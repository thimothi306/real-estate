<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'icon', 'description', 'partner_roles', 'is_property_specific'];

    protected $casts = [
        'partner_roles' => 'array',
        'is_property_specific' => 'boolean',
    ];

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function partnerProfiles()
    {
        return $this->belongsToMany(PartnerProfile::class, 'partner_profile_service_category');
    }
}
