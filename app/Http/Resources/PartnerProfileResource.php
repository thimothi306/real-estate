<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PartnerProfileResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'business_name' => $this->business_name,
            'bio' => $this->bio,
            'cities_served' => $this->cities_served,
            'years_experience' => $this->years_experience,
            'is_verified' => $this->is_verified,
            'total_completed' => $this->total_completed,
            'rating_avg' => $this->rating_avg !== null ? (float) $this->rating_avg : null,
            'rating_count' => $this->rating_count,
            'user' => new UserResource($this->whenLoaded('user')),
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
