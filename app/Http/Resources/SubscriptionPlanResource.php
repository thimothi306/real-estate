<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'target_role' => $this->target_role,
            'price' => (float) $this->price,
            'duration_days' => $this->duration_days,
            'features' => $this->features,
            'is_active' => $this->is_active,
        ];
    }
}
