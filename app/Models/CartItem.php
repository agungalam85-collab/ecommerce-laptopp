<?php

namespace App\Models;
use App\Models\Color;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['user_id', 'cart_id', 'product_id', 'quantity', 'color_id' ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function user()
    {
    return $this->belongsTo(User::class);
    }

    public function color()
{
     return $this->belongsTo(ProductColor::class, 'color_id');


}

}
