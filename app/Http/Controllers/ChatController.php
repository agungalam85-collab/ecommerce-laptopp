<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatMessage;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Http;


class ChatController extends Controller
{
    // Customer kirim pesan → ke admin via WA
   public function sendToAdmin(Request $request)
{
    $user = JWTAuth::parseToken()->authenticate();
    $message = $request->input('message', 'Halo Admin, saya butuh bantuan dari chatbot.');

    // Simpan pesan customer
    ChatMessage::create([
        'customer_id' => $user->id,
        'sender' => 'customer',
        'text' => $message,
        'read_by_customer' => true
    ]);

    // Kirim ke WA admin
    $adminPhone = '6281292764247'; // ganti dengan nomor admin
    $finalMessage = "Pesan dari {$user->full_name} ({$user->phone}):\n{$message}";

    $response = Http::withHeaders([
        'Authorization' => env('FONNTE_API_KEY'),
    ])->post('https://api.fonnte.com/send', [
        'target'  => $adminPhone,
        'message' => $finalMessage,
    ]);

    return response()->json([
        'message' => 'Pesan terkirim ke Admin via WhatsApp.',
        'fonnte_response' => $response->json()
    ]);
}


    // Customer polling untuk pesan baru dari admin
    public function getAdminReplies(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $lastId = $request->query('last_id', 0);

        $messages = ChatMessage::where('customer_id', $user->id)
            ->where('sender', 'admin')
            ->where('id', '>', $lastId)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Admin balas (WA webhook)
public function receiveAdminMessage(Request $request)
{
    $waNumber = $request->input('from');      // nomor WA admin
    $text     = $request->input('message');   // isi pesan admin
    $customerId = $request->input('customer_id'); // optional, kalau admin kirim customer_id

    // Jika admin kirim customer_id, pakai itu
    if (!$customerId) {
        // fallback: ambil customer terakhir yang chat ke admin
        $lastCustomerMessage = ChatMessage::where('sender', 'customer')
            ->whereNotNull('customer_id')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastCustomerMessage) {
            return response()->json([
                'status' => false,
                'message' => 'Customer tidak ditemukan'
            ], 404);
        }

        $customerId = $lastCustomerMessage->customer_id;
    }

    // Simpan pesan admin ke DB agar muncul di chatbot customer
    ChatMessage::create([
        'customer_id' => $customerId,
        'sender' => 'admin',
        'text' => $text,
        'read_by_customer' => false
    ]);

    return response()->json(['status' => true]);
}


  public function getMessages(Request $request)
{
    try {
        $user = JWTAuth::parseToken()->authenticate();

        $messages = ChatMessage::where('customer_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get(['sender', 'text', 'created_at']); // pakai text, bukan message

        return response()->json($messages);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Token invalid atau tidak ditemukan'], 401);
    }
}
}
