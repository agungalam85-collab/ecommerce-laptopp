<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductSpecification;
use App\Models\ProductColor;



class ImportProdukCsv extends Command
{
    protected $signature = 'import:produk-csv';
    protected $description = 'Import produk dari file CSV ke database';

    public function handle()
    {
        $path = storage_path('app/produk.csv');
        if (!file_exists($path)) {
            $this->error('❌ File produk.csv tidak ditemukan.');
            return;
        }

        $rows = array_map('str_getcsv', file($path));
        $header = array_map('trim', array_shift($rows));

        foreach ($rows as $index => $row) {
            if (count($row) !== count($header)) {
                $this->warn("⚠️ Baris ke-" . ($index + 2) . " tidak valid, dilewati.");
                continue;
            }

            if (empty(array_filter($row))) {
                $this->warn("⚠️ Baris kosong ke-" . ($index + 2) . " dilewati.");
                continue;
            }

            $data = array_combine($header, $row);

            $category = Category::firstOrCreate(['name' => $data['category']]);

            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'stock' => $data['stock'],
                'category_id' => $category->id,
                'image_path' => 'images/' . $data['image'],
            ]);

            foreach (explode(';', $data['specifications']) as $spec) {
                if (strpos($spec, ':') !== false) {
                    [$key, $value] = array_map('trim', explode(':', $spec));
                    ProductSpecification::create([
                        'product_id' => $product->id,
                        'key' => $key,
                        'value' => $value,
                    ]);
                }
            }

            foreach (explode('|', $data['colors']) as $color) {
                ProductColor::create([
                    'product_id' => $product->id,
                    'name' => trim($color),
                    'hex_code' => '#cccccc', // default, bisa lo mapping nanti
                ]);
            }
        }

        $this->info('✅ Import produk selesai!');
    }
}


