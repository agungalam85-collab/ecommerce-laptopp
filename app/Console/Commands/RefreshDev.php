<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class RefreshDev extends Command
{
    protected $signature = 'refresh:dev';
    protected $description = 'Clear and rebuild all dev caches, including config, routes, views, and storage symlink';

    public function handle()
    {
        $this->info('🔄 Clearing caches...');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        $this->info('⚙️ Rebuilding caches...');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        $this->info('🔗 Fixing storage symlink...');
        $link = public_path('storage');
        if (is_link($link) || file_exists($link)) {
            @unlink($link);
        }
        Artisan::call('storage:link');

        $this->info('✅ Dev environment refreshed!');
    }
}
