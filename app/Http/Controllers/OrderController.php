<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Tymon\JWTAuth\Facades\JWTAuth;
use Midtrans\Transaction;

class OrderController extends Controller
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

    // ✅ Ambil detail order berdasarkan order_id (bukan id)
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

    // ✅ Ambil detail pembayaran dari Midtrans
    public function getPaymentDetail($order_id)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $order = Order::where('order_id', $order_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        $statusRaw = Transaction::status($order_id);
        $status = is_array($statusRaw) ? (object) $statusRaw : $statusRaw;

        $va = null;
        if (is_array($status->va_numbers ?? null) && count($status->va_numbers) > 0) {
            $va = (object) $status->va_numbers[0];
        }

        return response()->json([
            'order_id' => $order->order_id,
            'gross_amount' => $order->total_price,
            'transaction_status' => $status->transaction_status,
            'payment_type' => $status->payment_type,
            'va_number' => $va?->va_number,
            'bank' => $va?->bank,
            'transaction_time' => $status->transaction_time,
            'expiry_time' => $status->expiry_time,
            'pdf_url' => $status->pdf_url ?? null,
            'finish_redirect_url' => $status->finish_redirect_url ?? null,
        ]);
    }

    // ✅ Update status order manual (admin atau internal)
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json(['message' => 'Status diperbarui']);
    }
}
