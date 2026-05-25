<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public function callback(Request $request)
    {
        // ✅ Ambil server key dari .env
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $expectedSignature = hash('sha512',
            $request->order_id .
            $request->status_code .
            $request->gross_amount .
            $serverKey
        );

        if ($expectedSignature !== $request->signature_key) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::with(['details.product','user'])
            ->where('order_id', $request->order_id)
            ->first();

        if (!$order) return response()->json(['message' => 'Order not found'], 404);

        $va = $request->va_numbers[0] ?? null;

        DB::transaction(function () use ($order, $request, $va) {
            // ✅ Update field pembayaran
            $order->payment_type        = $request->payment_type;
            $order->va_number           = $va['va_number'] ?? null;
            $order->bank                = $va['bank'] ?? null;
            $order->transaction_status  = $request->transaction_status;
            $order->fraud_status        = $request->fraud_status;
            $order->transaction_time    = $request->transaction_time;
            $order->expiry_time         = $request->expiry_time;
            $order->pdf_url             = $request->pdf_url ?? null;
            $order->finish_redirect_url = $request->finish_redirect_url ?? null;

            // ✅ Mapping status
            $order->status = match ($request->transaction_status) {
                'pending'    => 'pending',
                'settlement' => 'settlement',
                'expire'     => 'expired',
                'cancel'     => 'cancelled',
                default      => 'menunggu_konfirmasi'
            };

            $order->save();

            // ✅ Kurangi stok hanya jika pembayaran sukses
            if ($request->transaction_status === 'settlement') {
                foreach ($order->details as $detail) {
                    $product = $detail->product;
                    if ($product && $product->stock >= $detail->quantity) {
                        $product->stock -= $detail->quantity;
                        $product->save();
                    }
                }

                // ✅ Kirim notifikasi WhatsApp via Fonnte
                $apiKey = env('FONNTE_API_KEY');
                $target = $order->user->phone ?? null;
                $name   = $order->user->name ?? 'Customer';

                if ($target) {
                    // Hitung ulang total bayar
                    $totalBayar = $order->total_price + $order->shipping_cost;

                    $message = "
Halo {$name},

Pembayaran untuk Order ID: {$order->order_id} sudah berhasil ✅
Total Bayar: Rp" . number_format($totalBayar, 0, ',', '.') . "

Terima kasih sudah belanja di MistarPart SparePart & Accesories
Hubungi admin jika perlu bantuan ke nomer Whatsapp ini
";

                    $resp = Http::withHeaders([
                        'Authorization' => $apiKey
                    ])->post('https://api.fonnte.com/send', [
                        'target' => $target,
                        'message' => $message
                    ]);

                    Log::info('Fonnte response', $resp->json());
                }
            }
        });

        return response()->json(['message' => 'Callback processed']);
    }
}
