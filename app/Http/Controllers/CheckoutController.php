<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\CartItem;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\ShippingRate;
use Midtrans\Config;
use Midtrans\Snap;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Helpers\InvoiceSender;




class CheckoutController extends Controller
{
    public function calculateShipping(Request $request)
    {
        $province = $request->input('province');
        $city = $request->input('city');
        $courier = $request->input('courier');

        $rate = ShippingRate::where('province', $province)
            ->where('city', $city)
            ->where('courier', $courier)
            ->first();

        if (!$rate) {
            return response()->json(['error' => 'Tarif tidak ditemukan'], 404);
        }

        return response()->json([
            'shipping_cost' => $rate->rate,
        ]);
    }

  public function store(Request $request)
{
    $user = JWTAuth::parseToken()->authenticate();

    $request->validate([
        'product_ids' => 'required|array|min:1',
        'product_ids.*' => 'integer|exists:products,id',
        'address' => 'required|string',
        'payment' => 'required|string|in:cod,transfer,midtrans,ewallet',
    ]);

    $cartItems = CartItem::with('product')
        ->where('user_id', $user->id)
        ->whereIn('product_id', $request->product_ids)
        ->get();

    if ($cartItems->isEmpty()) {
        return response()->json(['message' => 'Keranjang kamu kosong'], 400);
    }

    $total = $cartItems->sum(fn($item) => $item->product->price * $item->quantity);

    DB::beginTransaction();

    try {
        foreach ($cartItems as $item) {
            $product = $item->product;
            if ($product->stock < $item->quantity) {
                DB::rollBack();
                return response()->json([
                    'message' => "Stok produk {$product->name} tidak cukup"
                ], 400);
            }
        }

        $order = Order::create([
            $orderId = 'ORDER-' . time(),
            'user_id' => $user->id,
            'address' => $request->address,
            'payment_method' => $request->payment,
            'total_price' => $total,
            'shipping_cost' => $request->shipping_cost ?? 0,
            'district_id' => $request->district_id ?? null,
            'status' => 'menunggu_konfirmasi'

        ]);

        foreach ($cartItems as $item) {
            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->product->price,
                'color_id' => $item->color_id,

            ]);

            $product = $item->product;
            $product->stock -= $item->quantity;
            $product->save();
        }

        CartItem::where('user_id', $user->id)->delete();

        DB::commit();

        return response()->json([
            'message' => 'Checkout berhasil',
            'order_id' => $order->id
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'Checkout gagal', 'error' => $e->getMessage()], 500);
    }
}


public function getSnapToken(Request $request)
{
    $user = JWTAuth::parseToken()->authenticate();

    $request->validate([
        'product_ids' => 'required|array|min:1',
        'product_ids.*' => 'integer|exists:products,id',
        'address' => 'required|string',
        'shipping_cost' => 'required|numeric|min:0',
        'total_price' => 'required|numeric|min:0',
        'district_id' => 'required|integer'
    ]);

    \Midtrans\Config::$serverKey = config('midtrans.server_key');
    \Midtrans\Config::$isProduction = config('midtrans.is_production');
    \Midtrans\Config::$isSanitized = true;
    \Midtrans\Config::$is3ds = true;

    $orderId = 'ORDER-' . time();
    $grossAmount = $request->shipping_cost + $request->total_price;

    $params = [
        'transaction_details' => [
            'order_id' => $orderId,
            'gross_amount' => $grossAmount,
        ],
        'customer_details' => [
            'first_name' => $user->name,
            'email' => $user->email,
        ],
    ];

    DB::beginTransaction();

    try {
        $snapToken = \Midtrans\Snap::getSnapToken($params);

        $order = Order::create([
            'order_id' => $orderId,
            'user_id' => $user->id,
            'address' => $request->address,
            'payment_method' => 'midtrans',
            'total_price' => $grossAmount,
            'shipping_cost' => $request->shipping_cost,
            'district_id' => $request->district_id,
            'status' => 'pending',
            'snap_token' => $snapToken // ✅ simpan token di DB
        ]);

        foreach ($request->product_ids as $productId) {
            $item = CartItem::with('product')
                ->where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (!$item || !$item->product) {
                throw new \Exception("Produk dengan ID {$productId} tidak ditemukan di keranjang.");
            }

            $product = $item->product;

            if ($product->stock < $item->quantity) {
                throw new \Exception("Stok produk {$product->name} tidak cukup.");
            }

            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $product->price,
                'color_id' => $item->color_id,
            ]);
        }

        CartItem::where('user_id', $user->id)
            ->whereIn('product_id', $request->product_ids)
            ->delete();

        DB::commit();

        // ✅ Kirim link pembayaran via Fonnte
        $redirectUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken;
        \App\Helpers\InvoiceSender::send($user->phone, $redirectUrl, $user->name);

        return response()->json([
            'token' => $snapToken,
            'redirect_url' => $redirectUrl,
            'order_id' => $orderId,
            'status' => true
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Checkout gagal',
            'error' => $e->getMessage()
        ], 500);
    }
}
public function getPaymentDetail($orderId)
{
    \Midtrans\Config::$serverKey = config('midtrans.server_key');
    \Midtrans\Config::$isProduction = config('midtrans.is_production');

    try {
        $status = \Midtrans\Transaction::status($orderId);
        return response()->json($status);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Gagal ambil status pembayaran',
            'message' => $e->getMessage()
        ], 500);
    }
}

public function updateStatus(Request $request)
{
    $user = JWTAuth::parseToken()->authenticate();

    $order = Order::where('order_id', $request->order_id)
        ->where('user_id', $user->id)
        ->first();

    if (!$order) {
        return response()->json(['message' => 'Order tidak ditemukan'], 404);
    }

    $order->status = $request->status;
    $order->save();

    return response()->json(['message' => 'Status diperbarui']);
}


}
