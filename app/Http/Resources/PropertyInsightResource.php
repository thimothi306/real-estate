<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Powers the Property Insights screen. Every numeric field is cast to a real
 * number — Laravel's decimal cast serializes to a string otherwise, which
 * silently breaks the typed `number` contract on the client.
 */
class PropertyInsightResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'sunlight_rating' => $this->sunlight_rating,
            'noise_level' => $this->noise_level,
            'commute_minutes' => $this->commute_minutes,
            'commute_landmark' => $this->commute_landmark,
            'future_infrastructure' => $this->future_infrastructure,
            'rental_yield_percent' => $this->rental_yield_percent !== null ? (float) $this->rental_yield_percent : null,
            'investment_score' => $this->investment_score !== null ? (float) $this->investment_score : null,
            'rental_score' => $this->rental_score,
            'growth_score' => $this->growth_score,
            'risk_percent' => $this->risk_percent !== null ? (float) $this->risk_percent : null,
            'demand_level' => $this->demand_level,
            'liquidity_level' => $this->liquidity_level,
            'estimated_market_price' => $this->estimated_market_price !== null ? (float) $this->estimated_market_price : null,
            'estimated_rental_value' => $this->estimated_rental_value !== null ? (float) $this->estimated_rental_value : null,
            'expected_selling_days' => $this->expected_selling_days,
        ];
    }
}
