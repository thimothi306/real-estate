<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_SEED_EMAIL', 'admin@kavuriestates.com')],
            [
                'name' => 'Kavuri Estates Admin',
                'phone' => env('ADMIN_SEED_PHONE', '+911234567890'),
                'password' => Hash::make(env('ADMIN_SEED_PASSWORD', 'ChangeMe@123')),
                'role' => User::ROLE_ADMIN,
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );
    }
}
