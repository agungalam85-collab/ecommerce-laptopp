<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdminOrderController extends Controller
{
    // 🔍 Lihat semua order dari semua user
    public function index()
    {
        $orders = Order::with(['user', 'details.product'])->latest()->get();

        return response()->json(['data' => $orders]);
    }

    // 📄 Lihat detail 1 order
    public function show($id)
    {
        $order = Order::with(['user', 'details.product'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        return response()->json(['data' => $order]);
    }

    // ✏️ Update status pengiriman (bukan status pembayaran Midtrans)
public function updateShippingStatus(Request $request, $id)
{
    $valid = [
        'belum_dikonfirmasi',
        'telah_dikonfirmasi',
        'belum_dikirim',
        'dikirim',
        'selesai',
        'dibatalkan'
    ];

    if (!in_array($request->status, $valid)) {
        return response()->json(['message' => 'Status pengiriman tidak valid'], 422);
    }

    $order = Order::findOrFail($id);
    $order->shipping_status = $request->status;
    $order->save();

    // === Kirim notifikasi ke customer via Fonnte ===
    Http::withHeaders([
        'Authorization' => env('FONNTE_API_KEY')
    ])->post('https://api.fonnte.com/send', [
        'target'  => $order->user->phone, // pastikan format nomor WA benar (628xxx)
        'message' => "Halo {$order->user->full_name}, status pengiriman pesanan #{$order->id} sekarang: {$order->shipping_status}"
    ]);

    return response()->json([
        'message' => 'Status pengiriman diperbarui',
        'data' => [
            'order_id' => $order->id,
            'shipping_status' => $order->shipping_status
        ]
    ]);
}

    public function updateResi(Request $request, $id)
{
    $request->validate([
        'resi' => 'required|string|max:100'
    ]);

    $order = Order::findOrFail($id);
    $order->resi = $request->resi;
    $order->save();

    // === Kirim notifikasi ke customer via Fonnte ===
    Http::withHeaders([
        'Authorization' => env('FONNTE_API_KEY')
    ])->post('https://api.fonnte.com/send', [
        'target'  => $order->user->phone,
        'message' => "Halo {$order->user->full_name}, pesanan #{$order->id} sudah dikirim. Nomor resi: {$order->resi}"
    ]);

    return response()->json(['message' => 'Resi berhasil disimpan']);
}

}
