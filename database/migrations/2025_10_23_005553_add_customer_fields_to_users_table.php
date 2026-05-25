<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
           // $table->string('full_name')->nullable();
           // $table->string('phone')->nullable();
            //$table->text('address')->nullable();
            //$table->date('birth_date')->nullable();
           // $table->string('gender')->nullable();
            //$table->string('avatar_url')->nullable();
            //$table->string('plain_password')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'full_name',
                'phone',
                'address',
                'birth_date',
                'gender',
                'avatar_url',
                'plain_password',
            ]);
        });
    }
};
