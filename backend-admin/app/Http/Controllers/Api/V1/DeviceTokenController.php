<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeviceTokenController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
            'platform' => ['required', Rule::in(['ios', 'android', 'web'])],
        ]);

        // A token belongs to one device, which may switch users (logout/login) —
        // re-pointing an existing token row to the current user handles that.
        $deviceToken = DeviceToken::updateOrCreate(
            ['token' => $data['token']],
            ['user_id' => $request->user()->id, 'platform' => $data['platform']]
        );

        return $this->success($deviceToken, 'Device registered.', 201);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        DeviceToken::where('user_id', $request->user()->id)
            ->where('token', $data['token'])
            ->delete();

        return $this->success(null, 'Device unregistered.');
    }
}
