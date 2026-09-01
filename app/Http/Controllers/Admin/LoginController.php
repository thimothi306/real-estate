<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::check() && Auth::user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        // Same generic message for "no such user", "wrong password", and
        // "not an admin" so this form can't be used to enumerate accounts.
        $failed = ! $user
            || ! $user->isAdmin()
            || $user->status !== 'active'
            || ! Auth::attempt($credentials, $request->boolean('remember'));

        if ($failed) {
            LoginActivity::create([
                'user_id' => $user?->id,
                'identifier' => $credentials['email'],
                'event' => 'login_failed',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        LoginActivity::create([
            'user_id' => $user->id,
            'event' => 'login_success',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request)
    {
        $userId = Auth::id();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        LoginActivity::create(['user_id' => $userId, 'event' => 'logout', 'ip_address' => $request->ip()]);

        return redirect()->route('admin.login');
    }
}
