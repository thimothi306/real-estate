<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyVerification;
use App\Services\SavedSearchMatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    public function __construct(protected SavedSearchMatchService $savedSearchMatchService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'pending_review', 'published', 'rejected', 'sold', 'rented', 'archived'])],
            'city' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:150'],
        ]);

        $properties = Property::query()
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['city'] ?? null, fn ($q, $city) => $q->where('city', $city))
            ->when($filters['q'] ?? null, fn ($q, $term) => $q->where('title', 'like', "%{$term}%"))
            ->with(['owner:id,name', 'coverMedia'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $cities = Property::select('city')->distinct()->orderBy('city')->pluck('city');

        return view('admin.properties.index', compact('properties', 'filters', 'cities'));
    }

    public function show(Property $property)
    {
        $property->load(['owner', 'media', 'amenities:id,name', 'verifications', 'score', 'reports.reporter:id,name']);

        return view('admin.properties.show', compact('property'));
    }

    public function approve(Request $request, Property $property)
    {
        if ($property->status !== Property::STATUS_PENDING_REVIEW) {
            return back()->with('error', 'Only listings pending review can be approved.');
        }

        $property->forceFill([
            'status' => Property::STATUS_PUBLISHED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'published_at' => now(),
            'rejection_reason' => null,
        ])->save();

        Cache::forget('locations.cities');
        $this->savedSearchMatchService->notifyMatches($property);

        return back()->with('success', 'Listing approved and published.');
    }

    public function reject(Request $request, Property $property)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        if ($property->status !== Property::STATUS_PENDING_REVIEW) {
            return back()->with('error', 'Only listings pending review can be rejected.');
        }

        $property->forceFill([
            'status' => Property::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['reason'],
        ])->save();

        return back()->with('success', 'Listing rejected.');
    }

    public function archive(Request $request, Property $property)
    {
        $property->forceFill(['status' => Property::STATUS_ARCHIVED])->save();

        return back()->with('success', 'Listing archived and removed from public search.');
    }

    public function verify(Request $request, Property $property)
    {
        $data = $request->validate([
            'badge_type' => ['required', Rule::in([
                'document_verified', 'owner_verified', 'video_verified',
                'gps_verified', 'government_record_checked',
            ])],
        ]);

        PropertyVerification::updateOrCreate(
            ['property_id' => $property->id, 'badge_type' => $data['badge_type']],
            ['verified_by' => $request->user()->id, 'verified_at' => now()]
        );

        return back()->with('success', 'Verification badge applied.');
    }

    public function removeVerification(Request $request, Property $property, PropertyVerification $verification)
    {
        abort_unless($verification->property_id === $property->id, 404);

        $verification->delete();

        return back()->with('success', 'Verification badge removed.');
    }
}
