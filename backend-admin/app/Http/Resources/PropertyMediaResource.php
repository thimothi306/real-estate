<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyMediaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'url' => $this->url,
            'thumbnail_url' => $this->thumbnail_path ? Storage::disk($this->disk)->url($this->thumbnail_path) : null,
            'sort_order' => $this->sort_order,
        ];
    }
}
