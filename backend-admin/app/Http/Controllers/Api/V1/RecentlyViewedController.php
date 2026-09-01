<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListResource;
use App\Models\Property;
use App\Models\RecentlyViewed;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class RecentlyViewedController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $viewed = RecentlyViewed::where('user_id', $request->user()->id)
            ->with(['property.coverMedia'])
            ->orderByDesc('viewed_at')
            ->limit(20)
            ->get()
            ->pluck('property')
            ->filter(fn ($property) => $property && $property->status === Property::STATUS_PUBLISHED)
            ->values();

        return $this->success(PropertyListResource::collection($viewed));
    }
}
