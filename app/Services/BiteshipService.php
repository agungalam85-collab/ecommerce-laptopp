<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class BiteshipService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.biteship.api_key');
        $this->baseUrl = config('services.biteship.base_url');
    }

    // 🔹 Get Rates (Cek Ongkir)
    public function getRates($payload)
    {
        return Http::withToken($this->apiKey)
            ->post($this->baseUrl . '/rates/couriers', $payload)
            ->json();
    }

    // 🔹 Create Order
    public function createOrder($payload)
    {
        return Http::withToken($this->apiKey)
            ->post($this->baseUrl . '/orders', $payload)
            ->json();
    }

    // 🔹 Tracking Shipment
    public function trackShipment($waybill)
    {
        return Http::withToken($this->apiKey)
            ->get($this->baseUrl . '/trackings/' . $waybill)
            ->json();
    }
}
