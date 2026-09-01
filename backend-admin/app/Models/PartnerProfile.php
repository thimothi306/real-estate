<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'business_name', 'bio', 'cities_served', 'years_experience',
        'is_verified', 'verified_by', 'verified_at', 'total_completed', 'rating_avg', 'rating_count',
    ];

    protected $casts = [
        'cities_served' => 'array',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'rating_avg' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function categories()
    {
        return $this->belongsToMany(ServiceCategory::class, 'partner_profile_service_category');
    }
}
