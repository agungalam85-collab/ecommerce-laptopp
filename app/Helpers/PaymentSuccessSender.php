<?php
namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentSuccessSender
{
    public static function send($phone, $invoice, $name = 'Customer')
    {
        $message = "Halo $name, pembayaran untuk invoice *$invoice* telah berhasil. Terima kasih atas kepercayaannya 🙌";

        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => $message,
        ]);

        Log::info("📨 WA sukses dikirim ke $phone | Invoice: $invoice");
        return $response->json();
    }
}
