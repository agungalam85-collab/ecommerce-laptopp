<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestMidtransWebhook extends Command
{
    protected $signature = 'test:webhook';
    protected $description = 'Simulasi webhook Midtrans ke endpoint lokal';

    public function handle()
    {
        $serverKey = config('midtrans.server_key');
        $orderId = 'ORDER-123';
        $statusCode = '200';
        $grossAmount = '100000';
        $signature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
        ];

        $response = Http::post('http://localhost:8000/api/midtrans/webhook', $payload);

        $this->info('Webhook sent. Response:');
        $this->line($response->body());
    }
}
