<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition()
    {
        return [
            'owner_id' => User::factory()->role(User::ROLE_OWNER),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'status' => Property::STATUS_DRAFT,
            'price' => fake()->numberBetween(2000000, 20000000),
            'bedrooms' => fake()->numberBetween(1, 4),
            'bathrooms' => fake()->numberBetween(1, 3),
            'area_sqft' => fake()->numberBetween(500, 3000),
            'city' => 'Hyderabad',
            'state' => 'Telangana',
            'locality' => fake()->streetName(),
        ];
    }

    public function published()
    {
        return $this->state(fn (array $attributes) => [
            'status' => Property::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
    }

    public function pendingReview()
    {
        return $this->state(fn (array $attributes) => [
            'status' => Property::STATUS_PENDING_REVIEW,
        ]);
    }
}
