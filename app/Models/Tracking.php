<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tracking extends Model
{
    protected $fillable = [
        'tracking_id',
        'waybill_id',
        'courier_code',
        'status',
        'history'
    ];
}
