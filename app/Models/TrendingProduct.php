<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrendingProduct extends Model
{
    protected $fillable = [
    'product_name',
    'tweet_text',
    'tweet_id',
    'tweet_url',
    'author_id',
    'score',
];




}
