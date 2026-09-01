<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PropertyDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'property_type' => $this->property_type,
            'listing_type' => $this->listing_type,
            'status' => $this->status,
            'price' => (float) $this->price,
            'rent_price' => $this->rent_price !== null ? (float) $this->rent_price : null,
            'area_sqft' => $this->area_sqft !== null ? (float) $this->area_sqft : null,
            'plot_size_sqft' => $this->plot_size_sqft !== null ? (float) $this->plot_size_sqft : null,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'floor_no' => $this->floor_no,
            'total_floors' => $this->total_floors,
            'facing' => $this->facing,
            'furnishing_status' => $this->furnishing_status,
            'has_balcony' => $this->has_balcony,
            'has_swimming_pool' => $this->has_swimming_pool,
            'has_garden' => $this->has_garden,
            'has_parking' => $this->has_parking,
            'available_from' => $this->available_from?->toDateString(),
            'address_line' => $this->address_line,
            'locality' => $this->locality,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'pincode' => $this->pincode,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'rera_number' => $this->rera_number,
            'is_rera_approved' => $this->is_rera_approved,
            'is_featured' => $this->is_featured,
            'views_count' => $this->views_count,
            // Only meaningful for an authenticated request; false for guests.
            'is_favorited' => (bool) ($this->is_favorited ?? false),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'media' => PropertyMediaResource::collection($this->whenLoaded('media')),
            'amenities' => $this->whenLoaded('amenities', fn () => $this->amenities->pluck('name')),
            'lifestyle_tags' => $this->whenLoaded('lifestyleTags', fn () => $this->lifestyleTags->pluck('name')),
            'verifications' => $this->whenLoaded('verifications', fn () => $this->verifications->pluck('badge_type')),
            // Composite badge: "Verified by Kavuri" — true only once all 5 checks are on file.
            'is_gold_verified' => $this->whenLoaded('verifications', fn () => $this->verifications->pluck('badge_type')->unique()->count() >= 5),
            'score' => $this->whenLoaded('score'),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
