<?php

return [
    'expiry_minutes' => env('OTP_EXPIRY_MINUTES', 5),
    'max_attempts' => env('OTP_MAX_ATTEMPTS', 5),
];
