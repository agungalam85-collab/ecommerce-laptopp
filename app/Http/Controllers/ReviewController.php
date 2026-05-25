<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
   public function index($productId)
{
    $reviews = Review::with('user')->where('product_id', $productId)->latest()->get();

    $data = $reviews->map(function ($review) {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at,
            'user' => [
                'name' => $review->user->name,
                'avatar_url' => $review->user->avatar_url,
            ]
        ];
    });

    return response()->json(['data' => $data]);
}

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string'
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json(['message' => 'Review berhasil dikirim', 'data' => $review]);
    }
}
