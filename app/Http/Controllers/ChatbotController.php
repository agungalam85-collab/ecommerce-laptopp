<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function reply(Request $request)
    {
        $message = $request->input('message');

        switch ($message) {
            case null: // awal percakapan
                return response()->json([
                    'reply' => 'Halo! Saya bisa bantu kamu dengan:',
                    'options' => ['FAQ Produk', 'Buat Order', 'Cek Status Pengiriman', 'Hubungi Admin']
                ]);

            case 'FAQ Produk':
                return response()->json([
                    'reply' => 'Pertanyaan yang sering ditanyakan:',
                    'options' => ['Cara bayar', 'Lama pengiriman', 'Garansi produk']
                ]);

            case 'Cara bayar':
                return response()->json([
                    'reply' => 'Pembayaran bisa dilakukan via transfer bank, e-wallet, atau COD.',
                    'options' => []
                ]);

            case 'Lama pengiriman':
                return response()->json([
                    'reply' => 'Pengiriman biasanya 2-3 hari kerja untuk wilayah Jabodetabek.',
                    'options' => []
                ]);

            case 'Garansi produk':
                return response()->json([
                    'reply' => 'Semua produk bergaransi resmi 1 tahun.',
                    'options' => []
                ]);

            case 'Buat Order':
                return response()->json([
                    'reply' => 'Silakan pilih produk yang ingin kamu pesan:',
                    'options' => ['Laptop ASUS', 'Laptop Lenovo', 'Laptop MacBook']
                ]);

            case 'Cek Status Pengiriman':
                return response()->json([
                    'reply' => 'Masukkan nomor resi kamu untuk cek status.',
                    'options' => []
                ]);

            case 'Hubungi Admin':
                return response()->json([
                    'reply' => 'Kamu bisa kirim pesan langsung ke Admin via WhatsApp:',
                    'options' => ['Kirim Pesan ke Admin']
                ]);

            default:
                return response()->json([
                    'reply' => 'Maaf, saya belum ngerti pilihan itu.',
                    'options' => ['FAQ Produk', 'Buat Order', 'Cek Status Pengiriman', 'Hubungi Admin']
                ]);
        }
    }

    // === Kirim pesan ke Admin via Fonnte ===
    public function sendToAdmin(Request $request)
{
    /** @var \App\Models\User|null $user */
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'User belum login'], 403);
    }

    $message = $request->input('message', 'Halo Admin, saya butuh bantuan dari chatbot.');

    $finalMessage = "Pesan dari {$user->full_name} ({$user->phone}):\n{$message}";

    // Simpan ke DB supaya bisa ditampilkan di frontend
    \App\Models\ChatMessage::create([
        'sender' => 'customer',
        'customer_id' => $user->id,
        'message' => $finalMessage,
    ]);

    // Kirim ke Admin via Fonnte
    $response = Http::withHeaders([
        'Authorization' => env('FONNTE_API_KEY'),
    ])->post('https://api.fonnte.com/send', [
        'target'  => '6281292764247',
        'message' => $finalMessage,
    ]);

    return response()->json([
        'status' => true,
        'message' => 'Pesan terkirim ke Admin via WhatsApp.',
        'fonnte' => $response->json()
    ]);
}

}
