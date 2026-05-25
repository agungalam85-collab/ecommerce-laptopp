<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});



Route::get('/debug-midtrans', function () {
    return response()->json([
        'server_key' => config('midtrans.server_key'),
        'client_key' => config('midtrans.client_key'),
        'is_production' => config('midtrans.is_production'),
    ]);
});

