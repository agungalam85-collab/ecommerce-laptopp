<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class CustomerController extends Controller
{
    /**
     * Tampilkan info profil customer yang sedang login
     */
    public function show()
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'full_name' => $user->full_name,
        'phone' => $user->phone,
        'address' => $user->address,
        'birth_date' => $user->birth_date,
        'gender' => $user->gender,
        'avatar_url' => $user->avatar
            ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/' . $user->avatar))
            : asset('images/default.jpg'),
        'created_at' => $user->created_at,
    ]);
}

    /**
     * Simpan info profil customer (POST)
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Laki-laki,Perempuan',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Info customer berhasil disimpan',
            'user' => $user
        ]);
    }

    /**
     * Update info profil customer (PUT)
     */
    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Laki-laki,Perempuan',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Info customer berhasil diperbarui',
            'user' => $user
        ]);
    }

    /**
     * Ganti password customer
     */
    public function changePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($validated['old_password'], $user->password)) {
            return response()->json(['error' => 'Password lama salah'], 403);
        }

        $user->update([
            'password' => bcrypt($validated['new_password']),
            'plain_password' => $validated['new_password'],
        ]);

        return response()->json(['message' => 'Password berhasil diganti']);
    }

    /**
     * Upload avatar customer
     */

    public function uploadAvatar(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $validated = $request->validate([
        'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $path = $request->file('avatar')->store('avatars', 'public');

    $user->update(['avatar' => $path]);

    return response()->json([
        'message' => 'Avatar berhasil diupload',
        'avatar_url' => asset('storage/' . $path),
    ]);
}
    /**
     * Hapus akun customer
     */
    public function destroy()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->delete();

        return response()->json(['message' => 'Akun customer berhasil dihapus']);
    }
}
