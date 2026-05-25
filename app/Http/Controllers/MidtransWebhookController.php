<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use App\Helpers\InvoiceSender;
use App\Helpers\PaymentSuccessSender;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Validasi Signature
        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash('sha512',
            $request->order_id .
            $request->status_code .
            $request->gross_amount .
            $serverKey
        );

        if ($expectedSignature !== $request->signature_key) {
            Log::warning('❌ Signature tidak valid');
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // Ambil Order
        $orderId = str_replace('ORDER-', '', $request->order_id);
        $order = Order::find($orderId);

        if (!$order) {
            Log::warning("❌ Order tidak ditemukan: {$request->order_id}");
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Update Status
        $order->status = $request->transaction_status;
        $order->save();

        Log::info("✅ Order #{$order->id} diupdate ke status: {$order->status}");

        // Kirim Notifikasi WhatsApp
        if ($request->transaction_status === 'pending') {
            $link = route('payment.page', ['invoice' => $order->invoice]);
            InvoiceSender::send($order->customer_phone, $link, $order->customer_name);
        }

        if ($request->transaction_status === 'settlement' && $request->fraud_status === 'accept') {
            PaymentSuccessSender::send($order->customer_phone, $order->invoice, $order->customer_name);
        }

        return response()->json(['message' => 'OK']);
    }
}
