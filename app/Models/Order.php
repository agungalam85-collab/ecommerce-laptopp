<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address',
        'payment_method',
        'total_price',
        'status',
        'courier',
        'shipping_service',
        'shipping_cost',
        'weight',
        'district_id',
        'order_id',

        // kolom pembayaran Midtrans
        'payment_type',
        'va_number',
        'bank',
        'transaction_status',
        'fraud_status',
        'pdf_url',
        'finish_redirect_url',
        'transaction_time',
        'expiry_time',
        'snap_token',

    ];

    protected $dates = [
        'transaction_time',
        'expiry_time',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke detail pesanan
    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
