<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ServiceQuoteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'service_request_id' => $this->service_request_id,
            'partner_id' => $this->partner_id,
            'amount' => (float) $this->amount,
            'message' => $this->message,
            'status' => $this->status,
            'valid_until' => $this->valid_until?->toDateString(),
            'partner' => new UserResource($this->whenLoaded('partner')),
            'request' => $this->whenLoaded('request', fn () => [
                'id' => $this->request->id,
                'title' => $this->request->title,
                'status' => $this->request->status,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
