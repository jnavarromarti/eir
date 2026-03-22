<?php

namespace App\Modules\Auth\Infrastructure\Guards;

use App\Shared\Domain\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Usage: ->middleware('role:ADMIN,ADMINISTRATIVE')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        // ADMIN always passes
        if ($user->role === UserRole::ADMIN) {
            return $next($request);
        }

        $allowedRoles = array_map(
            fn(string $r) => UserRole::tryFrom($r),
            $roles
        );

        if (!in_array($user->role, $allowedRoles, true)) {
            return response()->json(['message' => 'No tienes permisos para acceder a este recurso.'], 403);
        }

        return $next($request);
    }
}
