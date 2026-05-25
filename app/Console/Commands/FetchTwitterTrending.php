<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchTwitterTrending extends Command
{
    protected $signature = 'fetch:twitter-trending';
    protected $description = 'Ambil tweet produk elektronik dan hitung skor popularitas';

    public function handle()
    {
        $token = env('TWITTER_BEARER_TOKEN');

        $keywords = ['macbook', 'asus rog', 'lenovo legion', 'xiaomi pad', 'samsung galaxy'];
        $query = implode(' OR ', array_map(fn($k) => "\"$k\"", $keywords)) . ' lang:id';

        $response = Http::withToken($token)->get('https://api.twitter.com/2/tweets/search/recent', [
            'query' => $query,
            'max_results' => 50,
            'tweet.fields' => 'public_metrics,text,author_id',
        ]);

        if (!$response->successful()) {
            $this->error('Gagal ambil data dari Twitter: ' . $response->body());
            return;
        }

        $tweets = $response->json('data') ?? [];
        $this->info("Ditemukan " . count($tweets) . " tweet");

        foreach ($tweets as $tweet) {
            $text = strtolower($tweet['text']);
            $score = $tweet['public_metrics']['like_count'] * 1.5
                   + $tweet['public_metrics']['retweet_count'] * 1.2
                   + $tweet['public_metrics']['reply_count'];

            $matched = collect($keywords)->first(fn($k) => str_contains($text, strtolower($k)));

            if ($matched) {
                // Simpan ke database (contoh pakai model TrendingProduct)
                \App\Models\TrendingProduct::updateOrCreate(
                    ['tweet_id' => $tweet['id']],
                    [
                        'product_name' => $matched,
                        'tweet_text' => $tweet['text'],
                        'score' => $score,
                        'tweet_url' => "https://x.com/i/web/status/{$tweet['id']}",
                        'author_id' => $tweet['author_id'],
                    ]
                );

                $this->line("✅ [$matched] Skor: $score");
            }
        }

        $this->info('Selesai 🚀');
    }
}
