<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipController extends Controller
{
    public function createOrder(Request $request)
    {
        $apiKey = config('services.biteship.api_key');

        if (!$apiKey) {
            Log::error('❌ BITESHIP_API_KEY tidak ditemukan di .env');
            return response()->json([
                'success' => false,
                'message' => 'API Key tidak tersedia'
            ], 500);
        }

        Log::info('✅ BITESHIP_API_KEY ditemukan');

        $payload = $request->all();

        Log::info('📦 Payload ke Biteship:', $payload);

        $response = Http::withHeaders([
    'x-api-key' => $apiKey,
    'Content-Type' => 'application/json',
    'Accept' => 'application/json'
    ])->post('https://api.biteship.com/v1/orders', $payload);

        Log::info('📬 Response dari Biteship:', $response->json());

        return response()->json($response->json(), $response->status());
    }
}
