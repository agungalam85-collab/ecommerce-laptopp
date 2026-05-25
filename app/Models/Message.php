<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'user_id',
        'sender',
        'message',
        'direction',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
