<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyScore;
use Illuminate\Database\Seeder;

/**
 * Generates plausible investment + livability signals for every published
 * property so the Property Insights screen always has something to show.
 * Values are derived from the property's own attributes (price, type,
 * locality) rather than pure randomness, so they stay internally consistent.
 */
class PropertyInsightSeeder extends Seeder
{
    /** Localities close to the IT corridor get shorter commutes and higher demand. */
    protected const IT_CORRIDOR = ['Hitech City', 'Gachibowli', 'Madhapur', 'Kondapur', 'Financial District', 'Kokapet'];

    public function run(): void
    {
        $properties = Property::published()->get();
        $count = 0;

        foreach ($properties as $property) {
            $nearCorridor = in_array($property->locality, self::IT_CORRIDOR, true);
            $isPremium = $property->price >= 30000000;
            $isCommercial = in_array($property->property_type, ['commercial', 'office_space', 'shop', 'warehouse'], true);

            // Rental yield: commercial out-yields residential in Indian metros.
            $rentalYield = $isCommercial
                ? round(random_int(650, 900) / 100, 2)
                : round(random_int(280, 480) / 100, 2);

            $investmentScore = min(10, max(5, ($nearCorridor ? 8 : 6) + ($isPremium ? 1 : 0)));

            PropertyScore::updateOrCreate(
                ['property_id' => $property->id],
                [
                    'investment_score' => $investmentScore,
                    'rental_score' => min(10, $investmentScore + random_int(-1, 1)),
                    'growth_score' => min(10, $investmentScore + random_int(-1, 2)),
                    'risk_percent' => round(random_int(800, 2400) / 100, 2),
                    'demand_level' => $nearCorridor ? 'very_high' : ($isPremium ? 'high' : 'medium'),
                    'liquidity_level' => $nearCorridor ? 'high' : 'medium',
                    'estimated_market_price' => $property->price * (1 + random_int(-3, 8) / 100),
                    'estimated_rental_value' => $property->rent_price ?: round($property->price * $rentalYield / 100 / 12),
                    'expected_selling_days' => $nearCorridor ? random_int(25, 60) : random_int(60, 150),
                    'rental_yield_percent' => $rentalYield,
                    'sunlight_rating' => $this->sunlightFor($property->facing),
                    'noise_level' => $nearCorridor ? 'moderate' : (in_array($property->property_type, ['farmhouse', 'resort'], true) ? 'low' : 'moderate'),
                    'commute_minutes' => $nearCorridor ? random_int(10, 25) : random_int(30, 75),
                    'commute_landmark' => $property->city === 'Hyderabad' ? 'Hi-Tech City' : ($property->city.' CBD'),
                    'future_infrastructure' => $this->infrastructureFor($property->city, $nearCorridor),
                    'calculated_at' => now(),
                ]
            );

            $count++;
        }

        $this->command?->info("Generated insights for {$count} properties.");
    }

    /** East/north-east facing homes get the best morning light — standard Vastu-aligned expectation. */
    protected function sunlightFor(?string $facing): string
    {
        return match ($facing) {
            'east', 'north_east' => 'excellent',
            'north', 'west' => 'good',
            'south' => 'average',
            default => 'good',
        };
    }

    protected function infrastructureFor(string $city, bool $nearCorridor): string
    {
        if ($city === 'Hyderabad') {
            return $nearCorridor ? 'Metro Phase 2 (2028)' : 'ORR connectivity upgrade';
        }

        return match ($city) {
            'Bengaluru' => 'Namma Metro Blue Line',
            'Pune' => 'Pune Metro Line 3',
            'Chennai' => 'Chennai Metro Phase 2',
            'Mumbai' => 'Coastal Road & Metro Line 2B',
            default => 'Planned road widening',
        };
    }
}
