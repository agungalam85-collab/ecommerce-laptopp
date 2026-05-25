<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;



class HomeController extends Controller
{
    public function index()
         {
        $categories = Category::all();
        $latestProducts = Product::with('category')->latest()->take(10)->get();

        return response()->json([
            'message' => 'Homepage data',
            'categories' => $categories,
            'latest_products' => $latestProducts
        ]);
    }


}
