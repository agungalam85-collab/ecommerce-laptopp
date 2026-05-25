<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $category = Category::create(['name' => $request->name]);

        return response()->json([
            'message' => 'Category created',
            'data' => $category
        ]);
    }
    public function index()
    {
    $categories = Category::all();
    return response()->json($categories);
    }
    public function products($id)
{
    $category = Category::with(['products.images'])->find($id);

    if (!$category) {
        return response()->json(['message' => 'Category not found'], 404);
    }

    return response()->json([
        'message' => 'Products in category',
        'data' => $category->products
    ]);
}
    public function destroy($id)
{
    $category = Category::find($id);

    if (!$category) {
        return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
    }

    $category->delete();

    return response()->json(['message' => 'Kategori berhasil dihapus']);
}

}
