<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id', 'investment_score', 'rental_score', 'growth_score',
        'risk_percent', 'demand_level', 'liquidity_level',
        'estimated_market_price', 'estimated_rental_value', 'expected_selling_days', 'calculated_at',
        'sunlight_rating', 'noise_level', 'commute_minutes', 'commute_landmark',
        'future_infrastructure', 'rental_yield_percent',
    ];

    protected $casts = [
        'risk_percent' => 'decimal:2',
        'estimated_market_price' => 'decimal:2',
        'estimated_rental_value' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
