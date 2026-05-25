<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('source')->nullable()->after('category_id'); // contoh: 'twitter', 'manual'
            $table->integer('popularity_score')->default(0)->after('source'); // nilai 0–100
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['source', 'popularity_score']);
        });
    }
};
