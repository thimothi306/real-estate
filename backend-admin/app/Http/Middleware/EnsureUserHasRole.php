<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            throw new HttpException(403, 'You do not have permission to access this resource.');
        }

        if ($user->status !== 'active') {
            throw new HttpException(403, 'Your account is not active.');
        }

        return $next($request);
    }
}
