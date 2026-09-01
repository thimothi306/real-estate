<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Owner Premium',
                'slug' => 'owner-premium',
                'target_role' => 'owner',
                'price' => 999,
                'duration_days' => 30,
                'features' => ['Up to 3 featured listings', 'Priority in search results', 'Verified badge fast-track'],
            ],
            [
                'name' => 'Builder Plan',
                'slug' => 'builder-plan',
                'target_role' => 'builder',
                'price' => 4999,
                'duration_days' => 30,
                'features' => ['Unlimited project listings', 'Builder analytics dashboard', 'Featured project placement'],
            ],
            [
                'name' => 'Agent CRM',
                'slug' => 'agent-crm',
                'target_role' => 'agent',
                'price' => 1999,
                'duration_days' => 30,
                'features' => ['Lead CRM access', 'Commission tracking', 'Client management tools'],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
