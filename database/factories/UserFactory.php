<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'phone' => '+91'.fake()->unique()->numerify('9########'),
            'phone_verified_at' => now(),
            'password' => Hash::make('Testing@123'),
            'role' => User::ROLE_BUYER,
            'status' => 'active',
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified()
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function role(string $role)
    {
        return $this->state(fn (array $attributes) => ['role' => $role]);
    }

    public function admin()
    {
        return $this->state(fn (array $attributes) => ['role' => User::ROLE_ADMIN]);
    }
}
