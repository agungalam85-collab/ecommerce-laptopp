<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;



class UserController extends Controller
{
    //Ambil semua pengguna
     public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at', 'plain_password')->get();
        return response()->json($users);
    }
    // Tambah pengguna baru
     public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,superadmin',


        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'plain_password' => $validated['password'],
            'role' => $validated['role']
        ]);

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan',
            'user' => $user
        ], 201);
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);
    $user->update($request->only(['name', 'email', 'role']));
    return response()->json(['message' => 'User updated', 'user' => $user]);
}

public function destroy($id)
{
    $user = User::findOrFail($id);
    $user->delete();
    return response()->json(['message' => 'User deleted']);

}



public function uploadAvatar(Request $request)
{
    try {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 401);
        }

        // Validasi file
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        // Simpan file ke storage/app/public/avatars
        $path = $request->file('avatar')->store('avatars', 'public');

        // Simpan path ke kolom avatar
        $user->avatar = $path;
        $user->save();

        return response()->json([
            'message' => 'Avatar berhasil diupload',
            'avatar_url' => Storage::url($path) // hasil: /storage/avatars/xxxxx.jpg
        ]);
    } catch (\Exception $e) {
        Log::error('Gagal upload avatar: ' . $e->getMessage());
        return response()->json(['message' => 'Terjadi kesalahan saat upload avatar'], 500);
    }
}







}
