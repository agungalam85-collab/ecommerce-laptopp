<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ImageResource;
use App\Http\Resources\SpecificationResource;
use App\Http\Resources\ColorResource;

class ProductResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'description'    => $this->description,
            'price'          => $this->price,
            'stock'          => $this->stock,
            'category'       => new CategoryResource($this->category),
            'images'         => ImageResource::collection($this->images),
            'specifications' => SpecificationResource::collection($this->specifications),
            'colors'         => ColorResource::collection($this->colors),
        ];
    }
}
