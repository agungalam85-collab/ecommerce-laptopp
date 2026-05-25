<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Ambil user dari token
        $user = JWTAuth::parseToken()->authenticate();

        // Cek apakah role cocok
        if ($user->role !== $role) {
            return response()->json(['error' => 'Forbidden: Access denied'], 403);
        }

        return $next($request);
    }
}
