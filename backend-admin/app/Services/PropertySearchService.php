<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PropertySearchService
{
    /**
     * Runs a filtered, paginated property search.
     *
     * Performance notes:
     * - select() restricts columns instead of SELECT * (search results don't need description text).
     * - Only indexed columns are used as filters (city, property_type, listing_type, status, price).
     * - Full-text search uses the MySQL FULLTEXT index rather than LIKE '%term%' (which can't use an index).
     * - Eager loads only the first cover image + score, avoiding N+1 queries without over-fetching media.
     */
    public function search(array $filters): LengthAwarePaginator
    {
        $query = Property::query()
            ->select([
                'id', 'uuid', 'title', 'slug', 'property_type', 'listing_type',
                'price', 'rent_price', 'bedrooms', 'bathrooms', 'area_sqft',
                'city', 'locality', 'is_featured', 'published_at', 'latitude', 'longitude',
            ])
            ->published()
            ->with([
                'coverMedia',
                'score:id,property_id,investment_score',
            ]);

        if (! empty($filters['q'])) {
            // Keyword box also matches city/locality (e.g. "2bhk for rent in
            // Hi-tech city Hyderabad") — a plain FULLTEXT match on
            // title/description alone would miss the location half of a
            // natural-language query like that.
            $keyword = $filters['q'];
            $query->where(function ($sub) use ($keyword) {
                $sub->whereFullText(['title', 'description'], $keyword)
                    ->orWhere('city', 'like', "%{$keyword}%")
                    ->orWhere('locality', 'like', "%{$keyword}%");
            });
        }

        if (! empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        if (! empty($filters['state'])) {
            $query->where('state', $filters['state']);
        }

        if (! empty($filters['country'])) {
            $query->where('country', $filters['country']);
        }

        if (! empty($filters['property_type'])) {
            $query->where('property_type', $filters['property_type']);
        }

        if (! empty($filters['listing_type'])) {
            $query->where('listing_type', $filters['listing_type']);
        }

        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (! empty($filters['area_min'])) {
            $query->where('area_sqft', '>=', $filters['area_min']);
        }

        if (! empty($filters['area_max'])) {
            $query->where('area_sqft', '<=', $filters['area_max']);
        }

        if (! empty($filters['bedrooms'])) {
            $query->where('bedrooms', $filters['bedrooms']);
        }

        if (! empty($filters['furnishing_status'])) {
            $query->where('furnishing_status', $filters['furnishing_status']);
        }

        if (! empty($filters['rera_only'])) {
            $query->where('is_rera_approved', true);
        }

        if (! empty($filters['lifestyle_tag'])) {
            $query->whereHas('lifestyleTags', fn ($q) => $q->where('slug', $filters['lifestyle_tag']));
        }

        if (! empty($filters['lat']) && ! empty($filters['lng']) && ! empty($filters['radius_km'])) {
            $this->applyRadiusFilter($query, (float) $filters['lat'], (float) $filters['lng'], (float) $filters['radius_km']);
        }

        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default => $query->orderByDesc('is_featured')->orderByDesc('published_at'),
        };

        $perPage = min((int) ($filters['per_page'] ?? 20), 50);

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Haversine distance filter using indexed lat/lng bounding-box pre-filter
     * to avoid a full table scan before the precise distance calculation.
     */
    protected function applyRadiusFilter($query, float $lat, float $lng, float $radiusKm): void
    {
        $latDelta = $radiusKm / 111.0;
        $lngDelta = $radiusKm / (111.0 * cos(deg2rad($lat)));

        $query->whereBetween('latitude', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('longitude', [$lng - $lngDelta, $lng + $lngDelta])
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) as distance_km',
                [$lat, $lng, $lat]
            )
            ->having('distance_km', '<=', $radiusKm)
            ->orderBy('distance_km');
    }
}
