<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RajaOngkirController extends Controller
{
    public function getProvinces()
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'key' => config('rajaongkir.api_key'),
        ])->get('https://rajaongkir.komerce.id/api/v1/destination/province');

        if ($response->successful()) {
            $provinces = collect($response->json()['data'] ?? [])->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'name' => $item['name'],
                ];
            });
            return response()->json($provinces);
        }

        return response()->json(['error' => 'Gagal ambil provinsi'], 500);
    }

    public function getCities($provinceId)
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'key' => config('rajaongkir.api_key'),
        ])->get("https://rajaongkir.komerce.id/api/v1/destination/city/{$provinceId}");

        if ($response->successful()) {
            $cities = collect($response->json()['data'] ?? [])->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'name' => $item['name'],
                ];
            });
            return response()->json($cities);
        }

        return response()->json(['error' => 'Gagal ambil kota'], 500);
    }

    public function getDistricts($cityId)
    {
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'key' => config('rajaongkir.api_key'),
        ])->get("https://rajaongkir.komerce.id/api/v1/destination/district/{$cityId}");

        if ($response->successful()) {
            $districts = collect($response->json()['data'] ?? [])->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'name' => $item['name'],
                ];
            });
            return response()->json($districts);
        }

        return response()->json(['error' => 'Gagal ambil kecamatan'], 500);
    }

    public function checkOngkir(Request $request)
    {
        $request->validate([
            'district_id' => 'required|integer',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|string',
        ]);

        $response = Http::asForm()->withHeaders([
            'Accept' => 'application/json',
            'key' => config('rajaongkir.api_key'),
        ])->post('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', [
            'origin'      => 3855, // ID kecamatan asal
            'destination' => $request->input('district_id'),
            'weight'      => $request->input('weight'),
            'courier'     => $request->input('courier'),
        ]);

        if ($response->successful()) {
            return response()->json($response->json()['data'] ?? []);
        }

        return response()->json(['error' => 'Gagal hitung ongkir'], 500);
    }
}
