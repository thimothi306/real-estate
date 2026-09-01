<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyVerification extends Model
{
    use HasFactory;

    protected $fillable = ['property_id', 'badge_type', 'verified_by', 'verified_at', 'notes'];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
