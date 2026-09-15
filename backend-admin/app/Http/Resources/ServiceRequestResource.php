<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'budget_min' => $this->budget_min !== null ? (float) $this->budget_min : null,
            'budget_max' => $this->budget_max !== null ? (float) $this->budget_max : null,
            'urgency' => $this->urgency,
            'location' => $this->location,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'property' => $this->whenLoaded('property', fn () => $this->property ? [
                'id' => $this->property->id,
                'title' => $this->property->title,
                'slug' => $this->property->slug,
                'city' => $this->property->city,
            ] : null),
            'requester' => $this->whenLoaded('requester', fn () => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'phone' => $this->requester->phone,
            ]),
            'assigned_partner' => $this->whenLoaded('assignedPartner', fn () => $this->assignedPartner ? [
                'id' => $this->assignedPartner->id,
                'name' => $this->assignedPartner->name,
                'phone' => $this->assignedPartner->phone,
            ] : null),
            'quotes' => ServiceQuoteResource::collection($this->whenLoaded('quotes')),
            'quotes_count' => $this->when(isset($this->quotes_count), fn () => $this->quotes_count),
            'accepted_quote' => new ServiceQuoteResource($this->whenLoaded('acceptedQuote')),
            'accepted_quote_id' => $this->accepted_quote_id,
            'assigned_partner_id' => $this->assigned_partner_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
