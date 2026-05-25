<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'plain_password',
        'avatar',
        'role', // admin / customer
        'full_name',
        'phone',
        'address',
        'birth_date',
        'gender',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url'];


    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // Relasi
    public function cart()
    {
        return $this->hasOne(Cart::class, 'customer_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
{
    return $this->hasMany(Review::class);
}

public function getAvatarUrlAttribute()
{
    return $this->avatar
        ? asset('storage/' . $this->avatar)
        : asset('storage/default.jpg');
}






}
