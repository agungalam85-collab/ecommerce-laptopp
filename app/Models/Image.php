<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Image extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'path'];
    protected $appends = ['url'];

    // Relasi ke produk
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Accessor untuk URL gambar
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }
}
