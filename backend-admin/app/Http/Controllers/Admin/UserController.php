<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'role' => ['nullable', 'string', 'max:40'],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'pending', 'deleted'])],
            'q' => ['nullable', 'string', 'max:150'],
        ]);

        $users = User::query()
            ->when($filters['role'] ?? null, fn ($q, $role) => $q->where('role', $role))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");
            }))
            ->withCount('properties')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return view('admin.users.index', compact('users', 'filters'));
    }

    public function suspend(Request $request, User $user)
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Administrator accounts cannot be suspended here.');
        }

        $user->update(['status' => 'suspended']);
        $user->tokens()->delete();

        return back()->with('success', "{$user->name} has been suspended and signed out of all devices.");
    }

    public function reactivate(Request $request, User $user)
    {
        $user->update(['status' => 'active', 'failed_login_attempts' => 0, 'locked_until' => null]);

        return back()->with('success', "{$user->name} has been reactivated.");
    }
}
