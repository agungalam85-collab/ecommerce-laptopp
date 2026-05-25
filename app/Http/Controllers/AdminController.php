<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminController extends Controller
{
    public function updateProfile(Request $request)
    {
         /** @var \App\Models\User $user */

        $user = auth('api')->user();

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $user->id
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email
        ]);

        return response()->json(['message' => 'Profil berhasil diupdate', 'user' => $user]);
    }

    public function changePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();


        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6'
        ]);

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json(['error' => 'Password lama salah'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password berhasil diganti']);
    }

    public function me()
{
    /** @var \App\Models\User $user */
    $user = auth('api')->user();

    return response()->json($user);
}

public function uploadAvatar(Request $request)
{
    $admin = $request->user();

    // Validasi file
    $request->validate([
        'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048'
    ]);

    if ($request->hasFile('avatar')) {
        // Buat nama file unik berdasarkan ID admin
        $filename = 'avatar_' . $admin->id . '.' . $request->file('avatar')->getClientOriginalExtension();

        // Simpan file ke storage/app/public/avatars
        $path = $request->file('avatar')->storeAs('avatars', $filename, 'public');

        // Simpan URL publik ke database
        $admin->avatar_url = asset('storage/' . $path);
        $admin->save();

        return response()->json([
            'success' => true,
            'avatar_url' => $admin->avatar_url
        ]);
    }

    return response()->json(['success' => false, 'message' => 'File tidak ditemukan'], 400);
}



}
