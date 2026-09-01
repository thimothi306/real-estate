<?php

return [
    'login_max_attempts' => env('LOGIN_MAX_ATTEMPTS', 5),
    'login_lockout_minutes' => env('LOGIN_LOCKOUT_MINUTES', 15),
    'token_expiration_minutes' => env('SANCTUM_TOKEN_EXPIRATION', 43200), // 30 days
];
