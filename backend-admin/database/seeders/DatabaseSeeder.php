<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            // Reference data first — later seeders attach to these.
            AmenitySeeder::class,
            LifestyleTagSeeder::class,
            ServiceCategorySeeder::class,
            SubscriptionPlanSeeder::class,
            LoanOfferSeeder::class,
            AdminUserSeeder::class,

            // Demo content — properties, then everything that hangs off them.
            DemoContentSeeder::class,
            PropertyImageSeeder::class,
            PropertyInsightSeeder::class,
            CommunityReviewSeeder::class,
            DemoConversationSeeder::class,
        ]);
    }
}
