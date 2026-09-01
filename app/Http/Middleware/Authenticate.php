<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * This is an API-only backend — there is no web 'login' route to
     * redirect to. Always return null so unauthenticated requests fall
     * through to the JSON 401 response in App\Exceptions\Handler.
     */
    protected function redirectTo($request)
    {
        return null;
    }
}
