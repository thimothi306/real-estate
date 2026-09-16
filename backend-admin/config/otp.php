<?php

return [
    'expiry_minutes' => env('OTP_EXPIRY_MINUTES', 5),
    'max_attempts' => env('OTP_MAX_ATTEMPTS', 5),

    // Temporary stand-in until a real SMS gateway is wired up in
    // OtpService::dispatch(). While enabled, every OTP is generated as this
    // fixed code instead of a random one, so anyone can register/log in
    // with it without needing to read the server log. Must be turned off
    // (OTP_BYPASS_ENABLED=false) before real users rely on OTP delivery.
    'bypass_enabled' => env('OTP_BYPASS_ENABLED', false),
    'bypass_code' => env('OTP_BYPASS_CODE', '123456'),
];
