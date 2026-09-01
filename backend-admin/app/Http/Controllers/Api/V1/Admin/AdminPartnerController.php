<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerProfileResource;
use App\Models\PartnerProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AdminPartnerController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function pending(Request $request)
    {
        $profiles = PartnerProfile::where('is_verified', false)
            ->with(['user:id,name,phone,role,email', 'categories:id,name'])
            ->latest()
            ->paginate(20);

        return $this->success(
            PartnerProfileResource::collection($profiles->items()),
            'OK',
            200,
            ['total' => $profiles->total()]
        );
    }

    public function verify(Request $request, PartnerProfile $partnerProfile)
    {
        $partnerProfile->update([
            'is_verified' => true,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return $this->success(new PartnerProfileResource($partnerProfile), 'Partner verified.');
    }
}
