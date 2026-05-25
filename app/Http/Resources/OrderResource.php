<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'address' => $this->address,
            'payment_method' => $this->payment_method,
            'total_price' => $this->total_price,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'courier' => $this->courier,
            'shipping_service' => $this->shipping_service,
            'shipping_cost' => $this->shipping_cost,
            'weight' => $this->weight,
            'district_id' => $this->district_id,
            'details' => $this->details->map(function ($detail) {
                return [
                    'product' => [
                        'name' => $detail->product->name,
                    ],
                    'quantity' => $detail->quantity,
                    'price' => $detail->price,
                    'color' => $detail->color ?? null,
                ];
            }),
        ];
    }
}
