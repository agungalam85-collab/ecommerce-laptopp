<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use App\Models\CartItem;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    public function store(Request $request)
{
    $user = JWTAuth::parseToken()->authenticate();

    $request->validate([
        'product_ids' => 'required|array|min:1',
        'product_ids.*' => 'integer|exists:products,id',
        'color_id' => 'nullable|integer|exists:product_colors,id' // ✅ ini yang benar



    ]);

    $cart = Cart::firstOrCreate(['customer_id' => $user->id]);

    foreach ($request->product_ids as $productId) {
    $item = CartItem::where([
        'product_id' => $productId,
        'cart_id' => $cart->id,
        'user_id' => $user->id,
        'color_id' => $request->color_id // ✅ ini penting


    ])->first();

    if ($item) {
        $item->quantity += 1;
        if (!$item->color_id && $request->color_id) {
            $item->color_id = $request->color_id;
        }
        $item->save();
    } else {
        $cart->items()->create([
            'product_id' => $productId,
            'cart_id' => $cart->id,
            'user_id' => $user->id,
            'quantity' => 1,
            'color_id' => $request->color_id
        ]);
    }
}

    return response()->json(['message' => 'Produk ditambahkan ke keranjang']);
}

    public function count()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $cart = Cart::where('customer_id', $user->id)->first();

        $count = $cart ? $cart->items()->sum('quantity') : 0;

        return response()->json(['count' => $count]);
    }

    public function index(Request $request)
    {
    $user = JWTAuth::parseToken()->authenticate();
    $cart = $user->cart;

    if (!$cart) {
        return response()->json([
            'message' => 'Keranjang kosong',
            'data' => []
        ]);
    }

   $items = $cart->items()->with(['product.images', 'color'])->get();


    return response()->json([
        'message' => 'Isi keranjang',
        'data' => $items
    ]);
    }

    public function destroy($id)
{
    $user = JWTAuth::parseToken()->authenticate();

    $item = CartItem::find($id);

    if (!$item || $item->cart->customer_id !== $user->id) {
        return response()->json(['message' => 'Item tidak ditemukan'], 404);
    }

    $item->delete();

    return response()->json(['message' => 'Item dihapus dari keranjang']);
}

public function update(Request $request, $id)
{
    $user = JWTAuth::parseToken()->authenticate();

    $request->validate([
        'quantity' => 'required|integer|min:1'
    ]);

    $item = CartItem::where('user_id', $user->id)->findOrFail($id);
    $item->quantity = $request->quantity;
    $item->save();

    return response()->json(['message' => 'Qty berhasil diupdate']);
}



public function clearByCustomer($customer_id)
{
    $cart = Cart::where('customer_id', $customer_id)->first();

    if (!$cart) {
        return response()->json(['message' => 'Keranjang tidak ditemukan'], 404);
    }

    $items = CartItem::where('cart_id', $cart->id)
                     ->where('user_id', $customer_id)
                     ->get();

    if ($items->isEmpty()) {
        return response()->json(['message' => 'Item tidak ditemukan'], 404);
    }

    foreach ($items as $item) {
        $item->delete();
    }

    return response()->json(['message' => 'Keranjang customer #' . $customer_id . ' dikosongkan']);
}









}











