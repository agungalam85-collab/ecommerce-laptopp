<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShipperService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.shipper.base_url');
        $this->apiKey = config('services.shipper.api_key');
    }

    public function createOrder(array $payload)
    {
        Log::info('📦 Payload ke Shipper:', $payload);

        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post($this->baseUrl . '/v3/order', $payload);

        Log::info('📬 Response dari Shipper:', $response->json());

        return $response->json();
    }

    public function testRates()
    {
        Log::info('🚚 Testing /v3/rates/domestic');

        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->get($this->baseUrl . '/v3/rates/domestic');

        Log::info('📬 Response dari /v3/rates:', $response->json());

        return $response->json();
    }
}
