<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyListResource;
use App\Models\Property;
use App\Models\PropertyVerification;
use App\Services\SavedSearchMatchService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class AdminPropertyController extends Controller
{
    use ApiResponse;

    public function __construct(protected SavedSearchMatchService $savedSearchMatchService)
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function pending(Request $request)
    {
        $properties = Property::where('status', Property::STATUS_PENDING_REVIEW)
            ->with(['owner:id,name,phone', 'coverMedia'])
            ->oldest()
            ->paginate(20);

        return $this->success(
            PropertyListResource::collection($properties->items()),
            'OK',
            200,
            ['total' => $properties->total()]
        );
    }

    public function approve(Request $request, Property $property)
    {
        abort_unless($property->status === Property::STATUS_PENDING_REVIEW, 422, 'Only pending listings can be approved.');

        // forceFill: reviewed_by/reviewed_at/published_at are deliberately excluded from
        // Property::$fillable (never settable via user-facing property requests). This
        // controller is the trusted, admin-only path that's allowed to set them.
        $property->forceFill([
            'status' => Property::STATUS_PUBLISHED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'published_at' => now(),
            'rejection_reason' => null,
        ])->save();

        Cache::forget('locations.cities');
        $this->savedSearchMatchService->notifyMatches($property);

        return $this->success(new PropertyDetailResource($property), 'Property approved and published.');
    }

    public function reject(Request $request, Property $property)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        abort_unless($property->status === Property::STATUS_PENDING_REVIEW, 422, 'Only pending listings can be rejected.');

        $property->forceFill([
            'status' => Property::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['reason'],
        ])->save();

        return $this->success(new PropertyDetailResource($property), 'Property rejected.');
    }

    public function verify(Request $request, Property $property)
    {
        $data = $request->validate([
            'badge_type' => ['required', Rule::in([
                'document_verified', 'owner_verified', 'video_verified',
                'gps_verified', 'government_record_checked',
            ])],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $verification = PropertyVerification::updateOrCreate(
            ['property_id' => $property->id, 'badge_type' => $data['badge_type']],
            ['verified_by' => $request->user()->id, 'verified_at' => now(), 'notes' => $data['notes'] ?? null]
        );

        return $this->success($verification, 'Verification badge applied.');
    }
}
