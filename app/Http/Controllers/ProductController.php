<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Image;
use App\Models\ProductColor;
use App\Models\ProductSpecification;





class ProductController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'weight' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'images.*' => 'image|max:2048'
        ]);

        $product = Product::create($request->only(['name', 'description', 'price', 'stock', 'weight', 'category_id']));

        foreach ($request->file('images', []) as $file) {
            $path = $file->store('products', 'public');
            $product->images()->create(['path' => $path]);
        }

        foreach ($request->spec_key ?? [] as $i => $key) {
            ProductSpecification::create([
                'product_id' => $product->id,
                'key' => $key,
                'value' => $request->spec_value[$i] ?? ''
            ]);
        }

        foreach ($request->color_name ?? [] as $i => $name) {
            ProductColor::create([
                'product_id' => $product->id,
                'name' => $name,
                'hex_code' => $request->color_hex[$i] ?? null
            ]);
        }

        $product->load(['category', 'images', 'specifications', 'colors']);

        return response()->json([
            'message' => 'Produk berhasil disimpan',
            'product' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'stock' => 'sometimes|integer',
            'weight' => 'sometimes|numeric',
            'category_id' => 'sometimes|exists:categories,id',
            'images.*' => 'image|max:2048'
        ]);

        $product->update($request->only(['name', 'description', 'price', 'stock', 'weight', 'category_id']));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $product->images()->create(['path' => $path]);
            }
        }

        $product->specifications()->delete();
        $product->colors()->delete();

        foreach ($request->spec_key ?? [] as $i => $key) {
            ProductSpecification::create([
                'product_id' => $product->id,
                'key' => $key,
                'value' => $request->spec_value[$i] ?? ''
            ]);
        }

        foreach ($request->color_name ?? [] as $i => $name) {
            ProductColor::create([
                'product_id' => $product->id,
                'name' => $name,
                'hex_code' => $request->color_hex[$i] ?? null
            ]);
        }

        $product->load(['category', 'images', 'specifications', 'colors']);

        return response()->json([
            'message' => 'Produk berhasil diupdate',
            'product' => $product
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'images', 'specifications', 'colors'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'message' => 'Product detail',
            'product' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->images()->delete();
        $product->specifications()->delete();
        $product->colors()->delete();
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

   public function index(Request $request)
{
    $query = Product::with(['category', 'images', 'specifications', 'colors']);

    if ($request->has('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    $products = $query->latest()->get();

    return response()->json([
        'message' => 'List of products',
        'data' => $products
    ]);
}

    public function search(Request $request)
    {
        $keyword = $request->query('keyword');
        $products = Product::with('category')
            ->where('name', 'LIKE', "%{$keyword}%")
            ->get();

        return response()->json(['products' => $products]);
    }

    public function getByIds(Request $request)
    {
        $ids = $request->input('ids', []);
        $products = Product::with('category', 'specifications', 'colors' )->whereIn('id', $ids)->get();

        return response()->json(['products' => $products]);
    }

    public function recommendations()
{
    $products = Product::with(['category', 'images', 'specifications'])
        ->inRandomOrder()
        ->take(5)
        ->get();

    return response()->json([
        'data' => $products
    ]);
}
}
