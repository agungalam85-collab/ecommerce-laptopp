<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\Product;
use League\Csv\Reader;

class ImportElektronikTrending extends Command
{
    protected $signature = 'import:elektronik-trending';
    protected $description = 'Import produk elektronik trending dari CSV Twitter';

    public function handle()
    {
        $path = storage_path('app/elektronik_trending.csv');
        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);

        $defaultCategoryId = 15; // ganti sesuai kategori elektronik

        // Daftar nama produk/brand yang bisa dikenali dari tweet
        $keywords = [
            'asus rog', 'macbook', 'lenovo legion', 'xiaomi pad', 'samsung galaxy',
            'hp pavilion', 'acer nitro', 'msi stealth', 'realme book', 'dell xps'
        ];

        foreach ($csv as $index => $record) {
    $tweet = strtolower($record['full_text'] ?? '');
    $foundKeyword = collect($keywords)->first(fn($kw) => str_contains($tweet, strtolower($kw)));
    $productName = $foundKeyword ? ucfirst($foundKeyword) : Str::limit($record['full_text'], 50);
    $cluster = $foundKeyword ?? 'lainnya';
    $score = $record['favorite_count'] ?? rand(50, 100);
    $url = $record['tweet_url'] ?? 'twitter';

    $this->line("[$index]");
    $this->line("🛒 Nama Produk: $productName");
    $this->line("🔑 Cluster: $cluster");
    $this->line("🔥 Skor: $score");
    $this->line("🔗 Link: $url");
    $this->line(str_repeat('-', 40));
}



        $this->info('✅ Import selesai! Produk trending sudah dikelompokkan berdasarkan nama produk.');
    }
}
