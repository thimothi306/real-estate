<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight resource for list/search results — avoids serializing
 * heavy relations (media, amenities, description) that the list view
 * doesn't need, keeping search responses fast.
 */
class PropertyListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'property_type' => $this->property_type,
            'listing_type' => $this->listing_type,
            'price' => (float) $this->price,
            'rent_price' => $this->rent_price !== null ? (float) $this->rent_price : null,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'area_sqft' => $this->area_sqft !== null ? (float) $this->area_sqft : null,
            'city' => $this->city,
            'locality' => $this->locality,
            'is_featured' => $this->is_featured,
            'cover_image' => $this->whenLoaded('coverMedia', fn () => $this->coverMedia?->url),
            'investment_score' => $this->whenLoaded('score', fn () => $this->score?->investment_score),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
