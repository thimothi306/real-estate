<?php

namespace App\Services;

use App\Exceptions\AccountLockedException;
use App\Exceptions\InvalidCredentialsException;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(private OtpService $otpService)
    {
    }

    public function register(array $data, string $ip): User
    {
        return DB::transaction(function () use ($data, $ip) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'status' => 'pending',
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
            ]);

            $this->otpService->generateAndSend($user->phone, 'registration', $ip);

            return $user;
        });
    }

    /**
     * @throws AccountLockedException|InvalidCredentialsException
     */
    public function attemptLogin(string $identifier, string $password, string $ip, ?string $userAgent, ?string $deviceName): array
    {
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (! $user) {
            LoginActivity::create(['identifier' => $identifier, 'event' => 'login_failed', 'ip_address' => $ip, 'user_agent' => $userAgent]);
            throw new InvalidCredentialsException();
        }

        if ($user->isLocked()) {
            LoginActivity::create(['user_id' => $user->id, 'event' => 'account_locked', 'ip_address' => $ip, 'user_agent' => $userAgent]);
            throw new AccountLockedException($user->locked_until);
        }

        if (! Hash::check($password, $user->password)) {
            $this->registerFailedAttempt($user);
            LoginActivity::create(['user_id' => $user->id, 'event' => 'login_failed', 'ip_address' => $ip, 'user_agent' => $userAgent]);
            throw new InvalidCredentialsException();
        }

        if ($user->status === 'suspended') {
            throw new InvalidCredentialsException('Your account has been suspended. Contact support.');
        }

        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ])->save();

        LoginActivity::create(['user_id' => $user->id, 'event' => 'login_success', 'ip_address' => $ip, 'user_agent' => $userAgent]);

        $tokenName = $deviceName ?: ('device-'.Str::random(8));
        $abilities = $user->role === User::ROLE_ADMIN ? ['*'] : ['role:'.$user->role];
        $token = $user->createToken($tokenName, $abilities, now()->addMinutes((int) config('security.token_expiration_minutes')));

        return ['user' => $user, 'token' => $token->plainTextToken];
    }

    protected function registerFailedAttempt(User $user): void
    {
        $maxAttempts = (int) config('security.login_max_attempts');
        $attempts = $user->failed_login_attempts + 1;

        $updates = ['failed_login_attempts' => $attempts];

        if ($attempts >= $maxAttempts) {
            $updates['locked_until'] = now()->addMinutes((int) config('security.login_lockout_minutes'));
            $updates['failed_login_attempts'] = 0;
        }

        $user->forceFill($updates)->save();
    }

    public function verifyRegistrationOtp(string $phone, string $code): ?User
    {
        if (! $this->otpService->verify($phone, $code, 'registration')) {
            return null;
        }

        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return null;
        }

        $user->forceFill([
            'phone_verified_at' => now(),
            'status' => 'active',
        ])->save();

        return $user;
    }

    public function resetPassword(string $phone, string $otpCode, string $newPassword): bool
    {
        if (! $this->otpService->verify($phone, $otpCode, 'password_reset')) {
            return false;
        }

        $user = User::where('phone', $phone)->first();

        if (! $user) {
            return false;
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'password_changed_at' => now(),
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ])->save();

        // Revoke all existing tokens on password change for safety.
        $user->tokens()->delete();

        return true;
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
        LoginActivity::create(['user_id' => $user->id, 'event' => 'logout']);
    }

    public function logoutAllDevices(User $user): void
    {
        $user->tokens()->delete();
        LoginActivity::create(['user_id' => $user->id, 'event' => 'logout']);
    }
}
