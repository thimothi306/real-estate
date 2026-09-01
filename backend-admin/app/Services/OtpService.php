<?php

namespace App\Services;

use App\Models\LoginActivity;
use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class OtpService
{
    public function generateAndSend(string $phone, string $purpose, ?string $ip = null): Otp
    {
        $code = (string) random_int(100000, 999999);

        $otp = Otp::create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'purpose' => $purpose,
            'attempts' => 0,
            'expires_at' => now()->addMinutes((int) config('otp.expiry_minutes', 5)),
            'ip_address' => $ip,
        ]);

        $this->dispatch($phone, $code);

        LoginActivity::create([
            'identifier' => $phone,
            'event' => 'otp_sent',
            'ip_address' => $ip,
        ]);

        return $otp;
    }

    /**
     * Sends the OTP via the configured channel.
     * Defaults to logging (safe for local/dev). Swap for a real
     * SMS gateway (MSG91 / Twilio) in production by implementing
     * this method against that provider's SDK/API.
     */
    protected function dispatch(string $phone, string $code): void
    {
        Log::channel('single')->info("OTP for {$phone}: {$code}");
    }

    public function verify(string $phone, string $code, string $purpose): bool
    {
        $otp = Otp::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if (! $otp) {
            return false;
        }

        if ($otp->isExpired()) {
            return false;
        }

        if ($otp->attempts >= (int) config('otp.max_attempts', 5)) {
            return false;
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');
            LoginActivity::create([
                'identifier' => $phone,
                'event' => 'otp_failed',
            ]);

            return false;
        }

        $otp->update(['verified_at' => now()]);

        return true;
    }
}
