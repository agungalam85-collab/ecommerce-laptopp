

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;
use Midtrans\Config;
use App\Models\Order;


class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function createPaymentToken(Request $request)
    {
         $order = Order::findOrFail($request->order_id);

    $params = [
        'transaction_details' => [
            'order_id' => $order->id,
            'gross_amount' => $order->total
        ],
        'customer_details' => [
            'first_name' => $order->user->name,
            'email' => $order->user->email
        ]
    ];

    $snapToken = Snap::getSnapToken($params);

    return response()->json(['token' => $snapToken]);

        // logic Snap token di sini
    }
}
