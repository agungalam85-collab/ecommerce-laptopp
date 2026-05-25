<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TrendingProduct;

class TrendingProductController extends Controller
{
    //   // Endpoint JSON untuk Android/web
    public function json()
{
    $products = \App\Models\TrendingProduct::orderByDesc('score')->take(20)->get();

    $recommendation = $products->first();

    return response()->json([
        'recommendation' => $recommendation,
        'products' => $products,
    ], 200, [], JSON_UNESCAPED_UNICODE);
}

    // Optional: tampilan web via Blade (kalau lo pakai)
    public function index()
    {
        $products = TrendingProduct::orderByDesc('score')->take(20)->get();
        $recommendation = $products->first();

        return view('trending.index', compact('products', 'recommendation'));
    }


}
