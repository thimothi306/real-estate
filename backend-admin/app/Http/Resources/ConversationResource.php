<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray($request)
    {
        $me = $request->user();
        // The chat list shows the *other* participant, whichever side you're on.
        $counterpart = $me && $this->buyer_id === $me->id ? $this->owner : $this->buyer;

        return [
            'id' => $this->id,
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property->id,
                'title' => $this->property->title,
                'slug' => $this->property->slug,
                'city' => $this->property->city,
                'price' => (float) $this->property->price,
                'cover_image' => $this->property->relationLoaded('coverMedia') ? $this->property->coverMedia?->url : null,
            ]),
            'counterpart' => $counterpart ? [
                'id' => $counterpart->id,
                'name' => $counterpart->name,
                'avatar_url' => $counterpart->avatar_url,
            ] : null,
            'last_message' => $this->whenLoaded('messages', fn () => optional($this->messages->last())->body),
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'unread_count' => $this->unread_count ?? 0,
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
