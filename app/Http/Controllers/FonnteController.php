<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ChatMessage;


class FonnteController extends Controller
{
    public function sendMessage(Request $request)
    {
        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_API_KEY')
        ])->post('https://api.fonnte.com/send', [
            'target' => $request->input('target'),
            'message' => $request->input('message'),
        ]);

        return response()->json($response->json());
    }


public function getMessages($customerId)
{
    $messages = ChatMessage::where('customer_id', $customerId)
        ->orderBy('created_at', 'asc')
        ->get();

    return response()->json($messages);
}
public function adminReply(Request $request)
{
    $request->validate([
        'customer_id' => 'required|exists:users,id',
        'message'     => 'required|string',
    ]);

    $customer = \App\Models\User::find($request->customer_id);

    // Simpan ke DB
    \App\Models\ChatMessage::create([
        'customer_id'      => $customer->id,
        'sender'           => 'admin',
        'text'             => $request->message,
        'read_by_customer' => false,
    ]);

    // Kirim ke WhatsApp via Fonnte
    Http::withHeaders([
        'Authorization' => env('FONNTE_API_KEY')
    ])->post('https://api.fonnte.com/send', [
        'target'  => $customer->phone,
        'message' => $request->message,
    ]);

    return response()->json([
        'status'  => true,
        'message' => 'Pesan admin terkirim ke customer'
    ]);
}
public function chatCustomers()
{
    $customerIds = \App\Models\ChatMessage::select('customer_id')
        ->distinct()
        ->pluck('customer_id');

    $customers = \App\Models\User::whereIn('id', $customerIds)
        ->select('id', 'full_name', 'phone', 'avatar_url')
        ->get();

    return response()->json($customers);
}

}

