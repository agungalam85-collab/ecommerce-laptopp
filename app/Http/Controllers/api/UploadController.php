<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        /** @var User $user */
        $user = Auth::user(); // pakai facade supaya Intelephense lebih pintar
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $userId = $user->id;

        // Pastikan ada file
        if (!$request->hasFile('gambar')) {
            return response()->json([
                'status' => false,
                'message' => 'File tidak ada'
            ], 400);
        }

        $file = $request->file('gambar');
        $fileName = time() . '_' . $file->getClientOriginalName();

        // Folder per user
        $uploadPath = public_path("uploads/{$userId}");
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0775, true);
        }

        // Simpan file
        $file->move($uploadPath, $fileName);

        // Return URL gambar
        return response()->json([
            'status' => true,
            'url' => url("uploads/{$userId}/{$fileName}")
        ]);
    }
}
