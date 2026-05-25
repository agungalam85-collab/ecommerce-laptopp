<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Tymon\JWTAuth\Facades\JWTAuth;
use Midtrans\Transaction;

class CustomerOrderController extends Controller
{
    // ✅ Ambil semua order milik user yang login
    public function index()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $orders = Order::with('details.product')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    // ✅ Ambil detail order berdasarkan order_id
    public function showByOrderId($order_id)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $order = Order::with('details.product')
            ->where('order_id', $order_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json(['data' => $order]);
    }

    // ✅ Ambil detail pembayaran dari DB atau Midtrans
    public function getPaymentDetail($order_id)
{
    $user = JWTAuth::parseToken()->authenticate();

    $order = Order::where('order_id', $order_id)
        ->where('user_id', $user->id)
        ->first();

    if (!$order) {
        return response()->json(['message' => 'Order tidak ditemukan'], 404);
    }

    if (!$order->transaction_status || !$order->payment_type) {
        $statusRaw = Transaction::status($order_id);
        $status = is_array($statusRaw) ? (object) $statusRaw : $statusRaw;

        $va = null;
        if (is_array($status->va_numbers ?? null) && count($status->va_numbers) > 0) {
            $va = (object) $status->va_numbers[0];
        }

        $order->payment_type = $status->payment_type;
        $order->va_number = $va?->va_number;
        $order->bank = $va?->bank;
        $order->transaction_status = $status->transaction_status;
        $order->fraud_status = $status->fraud_status ?? null;
        $order->transaction_time = $status->transaction_time ?? null;
        $order->expiry_time = $status->expiry_time ?? null;
        $order->pdf_url = $status->pdf_url ?? null;
        $order->finish_redirect_url = $status->finish_redirect_url ?? null;
        $order->save();
    }

    return response()->json([
        'order_id' => $order->order_id,
        'gross_amount' => $order->total_price,
        'transaction_status' => $order->transaction_status,
        'payment_type' => $order->payment_type,
        'va_number' => $order->va_number,
        'bank' => $order->bank,
        'transaction_time' => $order->transaction_time,
        'expiry_time' => $order->expiry_time,
        'pdf_url' => $order->pdf_url,
        'finish_redirect_url' => $order->finish_redirect_url,
        'shipping_status' => $order->shipping_status,
        'resi' => $order->resi
    ]);
}
}
