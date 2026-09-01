<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'subtitle', 'image_path', 'cta_label', 'cta_url',
        'placement', 'audience', 'is_active', 'starts_at', 'ends_at', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public const PLACEMENTS = ['home_hero', 'home_strip', 'search_inline', 'detail_footer'];
    public const AUDIENCES = ['all', 'mobile', 'web'];

    /** Active, in-window, and targeted at the requesting surface. */
    public function scopeLive($query, ?string $audience = null)
    {
        return $query
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->when($audience, fn ($q) => $q->whereIn('audience', ['all', $audience]));
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
