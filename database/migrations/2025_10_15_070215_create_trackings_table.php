<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trackings', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_id')->unique();         // ID dari Biteship
            $table->string('waybill_id')->nullable();        // Nomor resi
            $table->string('courier_code')->nullable();      // Kode kurir (jne, sicepat, dll)
            $table->string('status')->nullable();            // Status pengiriman
            $table->json('history')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trackings');
    }
};
