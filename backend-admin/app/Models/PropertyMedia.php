<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PropertyMedia extends Model
{
    use HasFactory;

    protected $table = 'property_media';

    protected $fillable = [
        'property_id', 'type', 'disk', 'path', 'thumbnail_path', 'content_hash', 'sort_order', 'size_bytes', 'ai_processed',
    ];

    protected $casts = [
        'ai_processed' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
