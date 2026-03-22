<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrustedHostMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedHosts = array_filter(
            array_map('trim', explode(',', env('APP_ALLOWED_HOSTS', '')))
        );

        if (empty($allowedHosts)) {
            return $next($request);
        }

        $requestHost = $request->getHost();

        if (!in_array($requestHost, $allowedHosts, true)) {
            abort(403, 'Forbidden: host not allowed.');
        }

        return $next($request);
    }
}
