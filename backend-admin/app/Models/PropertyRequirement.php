<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyRequirement extends Model
{
    use HasFactory;

    public const STATUSES = ['new', 'contacted', 'closed'];

    protected $fillable = [
        'name', 'phone', 'email', 'city', 'property_type', 'listing_type',
        'budget_min', 'budget_max', 'message', 'status',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
    ];
}
