<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\SearchPropertyRequest;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyDetailResource;
use App\Http\Resources\PropertyInsightResource;
use App\Http\Resources\PropertyListResource;
use App\Models\Property;
use App\Models\RecentlyViewed;
use App\Services\PropertySearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    use ApiResponse;

    public function __construct(protected PropertySearchService $searchService)
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'compare', 'timeline', 'similar', 'categoryCounts', 'insights']);
    }

    /** Livability + investment signals for the Property Insights screen. */
    public function insights(Property $property)
    {
        $score = $property->score;

        abort_if(! $score, 404, 'Insights have not been generated for this property yet.');

        return $this->success(new PropertyInsightResource($score));
    }

    /**
     * Listing counts grouped by property_type and by listing_type, in two
     * GROUP BY queries. Exists so pages that show a row of category tiles
     * with live counts (e.g. the homepage) don't fire one HTTP request per
     * category — that fan-out is what triggered the OOM crash under load.
     */
    public function categoryCounts()
    {
        $byPropertyType = Property::published()
            ->select('property_type', DB::raw('count(*) as total'))
            ->groupBy('property_type')
            ->pluck('total', 'property_type');

        $byListingType = Property::published()
            ->select('listing_type', DB::raw('count(*) as total'))
            ->groupBy('listing_type')
            ->pluck('total', 'listing_type');

        return $this->success([
            'by_property_type' => $byPropertyType,
            'by_listing_type' => $byListingType,
        ]);
    }

    public function index(SearchPropertyRequest $request)
    {
        $results = $this->searchService->search($request->validated());

        return $this->success(
            PropertyListResource::collection($results->items()),
            'OK',
            200,
            [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'last_page' => $results->lastPage(),
            ]
        );
    }

    public function compare(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'string'],
        ]);

        $ids = array_slice(array_filter(array_map('intval', explode(',', $data['ids']))), 0, 4);

        abort_if(empty($ids), 422, 'Provide at least one property id.');

        $properties = Property::query()
            ->whereIn('id', $ids)
            ->published()
            ->with(['media', 'amenities:id,name', 'score'])
            ->get();

        return $this->success(PropertyDetailResource::collection($properties));
    }

    public function show(string $slug)
    {
        $viewer = request()->user('sanctum');

        $property = Property::query()
            ->where('slug', $slug)
            ->with(['owner:id,name,phone,avatar_url', 'media', 'amenities:id,name', 'lifestyleTags:id,name', 'verifications', 'score'])
            // Tells the client whether *this* viewer already saved the property, so
            // the save control can render in the right state on first paint.
            ->when($viewer, fn ($query) => $query->withExists([
                'favoritedBy as is_favorited' => fn ($q) => $q->where('user_id', $viewer->id),
            ]))
            ->firstOrFail();

        if ($property->status !== Property::STATUS_PUBLISHED) {
            abort_unless($viewer && ($viewer->isAdmin() || $property->isOwnedBy($viewer)), 404);
        }

        $property->increment('views_count');

        if ($viewer) {
            // upsert-style: touch viewed_at if already viewed, insert otherwise,
            // so "recently viewed" reorders on revisit rather than duplicating.
            RecentlyViewed::updateOrCreate(
                ['user_id' => $viewer->id, 'property_id' => $property->id],
                ['viewed_at' => now()]
            );
        }

        return $this->success(new PropertyDetailResource($property));
    }

    public function timeline(Property $property)
    {
        return $this->success(
            $property->history()->with('causedBy:id,name,role')->get()
        );
    }

    public function similar(Property $property)
    {
        // Same city + type, within ±25% of price, excluding itself — a simple
        // heuristic that avoids needing a recommendation engine for the MVP.
        $priceLow = $property->price * 0.75;
        $priceHigh = $property->price * 1.25;

        $similar = Property::query()
            ->select(['id', 'uuid', 'title', 'slug', 'property_type', 'listing_type', 'price', 'rent_price', 'bedrooms', 'bathrooms', 'area_sqft', 'city', 'locality', 'is_featured', 'published_at'])
            ->published()
            ->where('id', '!=', $property->id)
            ->where('city', $property->city)
            ->where('property_type', $property->property_type)
            ->whereBetween('price', [$priceLow, $priceHigh])
            ->with(['coverMedia'])
            ->limit(8)
            ->get();

        return $this->success(PropertyListResource::collection($similar));
    }

    public function store(StorePropertyRequest $request)
    {
        $data = $request->validated();
        $amenityIds = $data['amenity_ids'] ?? [];
        $lifestyleTagIds = $data['lifestyle_tag_ids'] ?? [];
        unset($data['amenity_ids'], $data['lifestyle_tag_ids']);

        $property = DB::transaction(function () use ($data, $amenityIds, $lifestyleTagIds, $request) {
            $property = Property::create(array_merge($data, [
                'owner_id' => $request->user()->id,
                'status' => Property::STATUS_DRAFT,
            ]));

            if (! empty($amenityIds)) {
                $property->amenities()->sync($amenityIds);
            }

            if (! empty($lifestyleTagIds)) {
                $property->lifestyleTags()->sync($lifestyleTagIds);
            }

            return $property;
        });

        return $this->success(new PropertyDetailResource($property->load(['amenities', 'lifestyleTags'])), 'Property created as draft.', 201);
    }

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        $data = $request->validated();
        $amenityIds = $data['amenity_ids'] ?? null;
        $lifestyleTagIds = $data['lifestyle_tag_ids'] ?? null;
        unset($data['amenity_ids'], $data['lifestyle_tag_ids']);

        DB::transaction(function () use ($data, $amenityIds, $lifestyleTagIds, $property) {
            $property->update($data);

            if ($amenityIds !== null) {
                $property->amenities()->sync($amenityIds);
            }

            if ($lifestyleTagIds !== null) {
                $property->lifestyleTags()->sync($lifestyleTagIds);
            }
        });

        return $this->success(new PropertyDetailResource($property->fresh(['amenities', 'lifestyleTags', 'media'])), 'Property updated.');
    }

    public function destroy(Request $request, Property $property)
    {
        $this->authorize('delete', $property);

        $property->delete();

        return $this->success(null, 'Property deleted.');
    }

    public function submitForReview(Request $request, Property $property)
    {
        $this->authorize('publish', $property);

        abort_unless($property->status === Property::STATUS_DRAFT, 422, 'Only draft listings can be submitted for review.');

        $property->update(['status' => Property::STATUS_PENDING_REVIEW]);

        return $this->success(new PropertyDetailResource($property), 'Submitted for admin review.');
    }

    public function myProperties(Request $request)
    {
        $properties = Property::query()
            ->where('owner_id', $request->user()->id)
            ->with(['coverMedia'])
            ->latest()
            ->paginate(20);

        return $this->success(
            PropertyListResource::collection($properties->items()),
            'OK',
            200,
            ['current_page' => $properties->currentPage(), 'total' => $properties->total()]
        );
    }
}
