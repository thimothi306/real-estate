<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'role' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'pending', 'deleted'])],
            'q' => ['nullable', 'string', 'max:150'],
        ]);

        $users = User::query()
            ->when($data['role'] ?? null, fn ($q, $role) => $q->where('role', $role))
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['q'] ?? null, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('name', 'like', "{$term}%")
                    ->orWhere('email', $term)
                    ->orWhere('phone', $term);
            }))
            ->latest()
            ->paginate(25);

        return $this->success(UserResource::collection($users->items()), 'OK', 200, ['total' => $users->total()]);
    }

    public function suspend(Request $request, User $user)
    {
        abort_if($user->isAdmin(), 403, 'Cannot suspend an admin account.');

        $user->update(['status' => 'suspended']);
        $user->tokens()->delete();

        return $this->success(new UserResource($user), 'User suspended and all sessions revoked.');
    }

    public function reactivate(Request $request, User $user)
    {
        $user->update(['status' => 'active', 'failed_login_attempts' => 0, 'locked_until' => null]);

        return $this->success(new UserResource($user), 'User reactivated.');
    }
}
