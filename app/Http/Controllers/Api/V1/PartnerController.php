<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerProfileResource;
use App\Models\PartnerProfile;
use App\Models\ServiceCategory;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['directory', 'show']);
    }

    /** Public browse — buyers picking a partner directly rather than posting a request. */
    public function directory(Request $request)
    {
        $data = $request->validate([
            'category' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
        ]);

        $partners = PartnerProfile::query()
            ->where('is_verified', true)
            ->with(['user:id,name,phone,city', 'categories:id,name,slug'])
            ->when($data['category'] ?? null, fn ($q, $slug) => $q->whereHas('categories', fn ($c) => $c->where('slug', $slug)))
            ->when($data['city'] ?? null, fn ($q, $city) => $q->whereJsonContains('cities_served', $city))
            ->orderByDesc('rating_avg')
            ->paginate(20);

        return $this->success(
            PartnerProfileResource::collection($partners->items()),
            'OK',
            200,
            ['total' => $partners->total()]
        );
    }

    public function show(int $userId)
    {
        $profile = PartnerProfile::where('user_id', $userId)
            ->where('is_verified', true)
            ->with(['user:id,name,phone,city', 'categories:id,name,slug'])
            ->firstOrFail();

        return $this->success(new PartnerProfileResource($profile));
    }

    public function myProfile(Request $request)
    {
        $profile = $request->user()->partnerProfile()->with('categories:id,name,slug')->first();

        return $this->success($profile ? new PartnerProfileResource($profile) : null);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isPartner(), 403, 'Only partner accounts have a service profile.');

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:150'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'cities_served' => ['nullable', 'array'],
            'cities_served.*' => ['string', 'max:100'],
            'years_experience' => ['nullable', 'string', 'max:20'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:service_categories,id'],
        ]);

        $categoryIds = $data['category_ids'] ?? [];
        unset($data['category_ids']);

        // Only allow linking categories this role is actually eligible to serve —
        // prevents e.g. a loan_partner claiming the Legal Verification category.
        $eligibleCategoryIds = ServiceCategory::whereJsonContains('partner_roles', $user->role)->pluck('id');
        $categoryIds = array_values(array_intersect($categoryIds, $eligibleCategoryIds->all()));

        $profile = $user->partnerProfile()->updateOrCreate(['user_id' => $user->id], $data);
        $profile->categories()->sync($categoryIds);

        return $this->success(new PartnerProfileResource($profile->fresh('categories')), 'Profile saved. Awaiting verification.');
    }
}
