<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $allowedRoles = array_map('trim', explode(',', (string) $role));
        $actualRole = $request->user()->role === 'user' ? 'retailer' : $request->user()->role;
        $normalizedAllowed = array_map(function ($r) {
            return $r === 'user' ? 'retailer' : $r;
        }, $allowedRoles);

        if (!in_array($actualRole, $normalizedAllowed, true)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
