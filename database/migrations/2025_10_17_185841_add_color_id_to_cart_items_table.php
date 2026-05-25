<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pindahkan pengecekan ke luar closure
        if (!Schema::hasColumn('cart_items', 'color_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->foreignId('color_id')->nullable()->constrained('colors');
            });
        }
    }

    public function down(): void
    {
        // Pastikan kolom ada sebelum di-drop
        if (Schema::hasColumn('cart_items', 'color_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropForeign(['color_id']);
                $table->dropColumn('color_id');
            });
        }
    }
};

