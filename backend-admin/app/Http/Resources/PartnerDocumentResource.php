<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PartnerDocumentResource extends JsonResource
{
    /**
     * Deliberately no file URL here — the underlying disk is private ('local'),
     * and the raw bytes are only ever reachable through
     * AdminPartnerController's authenticated, role:admin-gated download
     * action (keyed by this document's id), never a public Storage::url().
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
