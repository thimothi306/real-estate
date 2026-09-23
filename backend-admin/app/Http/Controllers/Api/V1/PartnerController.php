<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerDocumentResource;
use App\Http\Resources\PartnerProfileResource;
use App\Models\PartnerProfile;
use App\Models\ServiceCategory;
use App\Models\User;
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

        // Self-service onboarding: filling out a professional profile is what
        // makes a plain buyer/owner/tenant a provider — no separate "become a
        // provider" endpoint. Pre-defined partner roles (loan_partner, etc.)
        // and admin are untouched.
        if (!$user->isPartner() && $user->role !== User::ROLE_ADMIN) {
            $user->update(['role' => User::ROLE_SERVICE_PROVIDER]);
        }

        $data = $request->validate([
            'profession' => ['required', 'string', 'max:100'],
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

    /**
     * ID/address-proof upload for trust verification. Stored on the private
     * 'local' disk (unlike property photos, which are public) — never
     * exposed via a public Storage::url(); only reachable through
     * AdminPartnerController's authenticated, admin-only download action.
     */
    public function uploadDocument(Request $request)
    {
        $user = $request->user();
        $profile = $user->partnerProfile;
        abort_unless($profile, 422, 'Save your provider profile before uploading documents.');

        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'type' => ['nullable', 'in:id_proof,address_proof,other'],
        ]);

        $path = $data['file']->store("partner-documents/{$user->id}", 'local');

        $document = $profile->documents()->create([
            'type' => $data['type'] ?? 'id_proof',
            'disk' => 'local',
            'path' => $path,
            'status' => 'pending',
        ]);

        return $this->success(new PartnerDocumentResource($document), 'Document uploaded — awaiting review.', 201);
    }

    public function myDocuments(Request $request)
    {
        $profile = $request->user()->partnerProfile;
        $documents = $profile ? $profile->documents()->latest()->get() : collect();

        return $this->success(PartnerDocumentResource::collection($documents));
    }
}
