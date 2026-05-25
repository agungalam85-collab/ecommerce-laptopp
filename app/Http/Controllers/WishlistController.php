<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $items = Wishlist::with('product.images')
            ->where('user_id', $user->id)
            ->get()
            ->pluck('product');

        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $productId = $request->product_id;

        $exists = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Sudah ada di wishlist'], 200);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $productId
        ]);

        return response()->json(['message' => 'Berhasil ditambahkan ke wishlist']);
    }

    public function destroy(Request $request, $productId)
    {
        $user = $request->user();

        Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Berhasil dihapus dari wishlist']);
    }
}
