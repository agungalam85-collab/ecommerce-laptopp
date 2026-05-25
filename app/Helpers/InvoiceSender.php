<?php
namespace App\Helpers;

use Illuminate\Support\Facades\Http;

class InvoiceSender
{
    public static function send($phone, $link, $name = 'Customer')
    {
        $message = "Halo $name, berikut link pembayaran kamu:\n$link\nSilakan selesaikan sebelum expired ya 🙏";

        return Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => $message,
        ])->json();
    }
}
