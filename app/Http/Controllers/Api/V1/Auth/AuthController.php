<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\OtpService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AuthService $authService,
        protected OtpService $otpService,
    ) {
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated(), $request->ip());

        return $this->success(
            new UserResource($user),
            'Registration successful. An OTP has been sent to your phone for verification.',
            201
        );
    }

    public function sendOtp(SendOtpRequest $request)
    {
        $this->otpService->generateAndSend($request->phone, $request->purpose, $request->ip());

        return $this->success(null, 'OTP sent successfully.');
    }

    public function verifyRegistrationOtp(VerifyOtpRequest $request)
    {
        $user = $this->authService->verifyRegistrationOtp($request->phone, $request->code);

        if (! $user) {
            return $this->error('Invalid or expired OTP.', 422);
        }

        $token = $user->createToken('registration-device', ['role:'.$user->role])->plainTextToken;

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Phone verified successfully.');
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->attemptLogin(
            $request->identifier,
            $request->password,
            $request->ip(),
            $request->userAgent(),
            $request->device_name
        );

        return $this->success([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 'Login successful.');
    }

    public function forgotPassword(SendOtpRequest $request)
    {
        $this->otpService->generateAndSend($request->phone, 'password_reset', $request->ip());

        return $this->success(null, 'If an account exists for this phone number, an OTP has been sent.');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $ok = $this->authService->resetPassword($request->phone, $request->otp_code, $request->password);

        if (! $ok) {
            return $this->error('Invalid or expired OTP.', 422);
        }

        return $this->success(null, 'Password reset successfully. Please log in again.');
    }

    public function me(Request $request)
    {
        return $this->success(new UserResource($request->user()));
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return $this->success(null, 'Logged out successfully.');
    }

    public function logoutAllDevices(Request $request)
    {
        $this->authService->logoutAllDevices($request->user());

        return $this->success(null, 'Logged out from all devices.');
    }
}
