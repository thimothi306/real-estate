<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyDuplicateFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id', 'matched_property_id', 'media_id', 'matched_media_id', 'content_hash', 'status',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function matchedProperty()
    {
        return $this->belongsTo(Property::class, 'matched_property_id');
    }
}
