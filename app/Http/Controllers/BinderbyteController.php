<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BinderbyteController extends Controller
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.binderbyte.api_key');
        $this->baseUrl = config('services.binderbyte.base_url');
    }

    // 🔹 List Kurir
    public function couriers()
    {
        $response = Http::get($this->baseUrl . '/courier', [
            'api_key' => $this->apiKey,
        ]);

        return response()->json($response->json(), $response->status());
    }

    // 🔹 Cek Ongkir
    public function getCost(Request $request)
    {
        $request->validate([
            'origin' => 'required',
            'destination' => 'required',
            'weight' => 'required|numeric',
            'courier' => 'required|string',
        ]);

        $response = Http::get($this->baseUrl . '/cost', [
            'api_key' => $this->apiKey,
            'origin' => $request->origin,
            'destination' => $request->destination,
            'weight' => $request->weight,
            'courier' => $request->courier,
        ]);

        return response()->json($response->json(), $response->status());
    }

    // 🔹 Tracking Resi
    public function track(Request $request)
    {
        $request->validate([
            'awb' => 'required|string',
            'courier' => 'required|string',
        ]);

        $response = Http::get($this->baseUrl . '/track', [
            'api_key' => $this->apiKey,
            'awb' => $request->awb,
            'courier' => $request->courier,
        ]);

        return response()->json($response->json(), $response->status());
    }
}
