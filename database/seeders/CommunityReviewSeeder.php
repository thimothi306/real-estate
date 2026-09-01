<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds locality ratings across the 7 review categories so the Community
 * Review screen shows a real aggregate instead of an empty state.
 */
class CommunityReviewSeeder extends Seeder
{
    protected const CATEGORIES = ['water_supply', 'internet', 'traffic', 'safety', 'schools', 'hospitals', 'maintenance'];

    /** Ratings that feel true to each area rather than uniform noise. */
    protected const PROFILES = [
        'Hitech City' => ['water_supply' => 4, 'internet' => 5, 'traffic' => 3, 'safety' => 5, 'schools' => 4, 'hospitals' => 5, 'maintenance' => 4],
        'Gachibowli' => ['water_supply' => 4, 'internet' => 5, 'traffic' => 3, 'safety' => 5, 'schools' => 5, 'hospitals' => 4, 'maintenance' => 4],
        'Kondapur' => ['water_supply' => 4, 'internet' => 4, 'traffic' => 3, 'safety' => 4, 'schools' => 4, 'hospitals' => 4, 'maintenance' => 4],
        'Madhapur' => ['water_supply' => 4, 'internet' => 5, 'traffic' => 2, 'safety' => 4, 'schools' => 4, 'hospitals' => 4, 'maintenance' => 3],
        'Jubilee Hills' => ['water_supply' => 5, 'internet' => 5, 'traffic' => 3, 'safety' => 5, 'schools' => 5, 'hospitals' => 5, 'maintenance' => 5],
        'Banjara Hills' => ['water_supply' => 5, 'internet' => 5, 'traffic' => 3, 'safety' => 5, 'schools' => 5, 'hospitals' => 5, 'maintenance' => 4],
        'Financial District' => ['water_supply' => 4, 'internet' => 5, 'traffic' => 4, 'safety' => 5, 'schools' => 3, 'hospitals' => 4, 'maintenance' => 4],
        'Whitefield' => ['water_supply' => 3, 'internet' => 5, 'traffic' => 2, 'safety' => 4, 'schools' => 5, 'hospitals' => 4, 'maintenance' => 4],
        'Koramangala' => ['water_supply' => 4, 'internet' => 5, 'traffic' => 2, 'safety' => 4, 'schools' => 4, 'hospitals' => 5, 'maintenance' => 4],
        'Electronic City' => ['water_supply' => 3, 'internet' => 5, 'traffic' => 3, 'safety' => 4, 'schools' => 4, 'hospitals' => 3, 'maintenance' => 3],
    ];

    protected const COMMENTS = [
        'water_supply' => ['Consistent 24x7 supply, no complaints.', 'Borewell plus municipal — never faced a shortage.', 'Occasional low pressure in summer.'],
        'internet' => ['Multiple fibre providers, 300 Mbps easily available.', 'Great connectivity, work-from-home friendly.', 'Fibre available but installation took time.'],
        'traffic' => ['Peak hours are rough, plan around them.', 'Improved after the flyover opened.', 'Heavy congestion on weekday evenings.'],
        'safety' => ['Very safe, well-lit streets and active security.', 'Comfortable walking late at night.', 'Gated communities are secure here.'],
        'schools' => ['Several good CBSE and IB schools nearby.', 'Excellent options within 5 km.', 'Decent schools, admissions are competitive.'],
        'hospitals' => ['Multi-specialty hospitals within 10 minutes.', 'Good emergency care access.', 'Clinics nearby, major hospitals a short drive.'],
        'maintenance' => ['Society upkeep is excellent.', 'Regular garbage collection and clean common areas.', 'Maintenance is decent for the price.'],
    ];

    public function run(): void
    {
        $reviewers = $this->seedReviewers();
        $created = 0;

        // Only rate localities we actually have listings in.
        $localities = Property::published()
            ->whereNotNull('locality')
            ->select('city', 'locality')
            ->distinct()
            ->get();

        foreach ($localities as $row) {
            $profile = self::PROFILES[$row->locality] ?? null;

            foreach (self::CATEGORIES as $index => $category) {
                // Two reviewers per category gives the average a bit of spread.
                foreach ([0, 1] as $offset) {
                    $reviewer = $reviewers[($index + $offset) % count($reviewers)];

                    if (Review::where('city', $row->city)->where('locality', $row->locality)
                        ->where('category', $category)->where('user_id', $reviewer->id)->exists()) {
                        continue;
                    }

                    $base = $profile[$category] ?? random_int(3, 5);
                    $rating = max(1, min(5, $base + ($offset === 1 ? random_int(-1, 0) : 0)));

                    Review::create([
                        'user_id' => $reviewer->id,
                        'city' => $row->city,
                        'locality' => $row->locality,
                        'category' => $category,
                        'rating' => $rating,
                        'comment' => self::COMMENTS[$category][$offset] ?? null,
                        'is_flagged' => false,
                    ]);

                    $created++;
                }
            }
        }

        $this->command?->info("Seeded {$created} community reviews across {$localities->count()} localities.");
    }

    /** @return User[] */
    protected function seedReviewers(): array
    {
        $people = [
            ['name' => 'Arjun Nair', 'email' => 'arjun.resident@demo.kavuriestates.com', 'phone' => '+919820000101'],
            ['name' => 'Sneha Iyer', 'email' => 'sneha.resident@demo.kavuriestates.com', 'phone' => '+919820000102'],
            ['name' => 'Rahul Verma', 'email' => 'rahul.resident@demo.kavuriestates.com', 'phone' => '+919820000103'],
            ['name' => 'Divya Menon', 'email' => 'divya.resident@demo.kavuriestates.com', 'phone' => '+919820000104'],
        ];

        return array_map(fn ($person) => User::updateOrCreate(
            ['email' => $person['email']],
            [
                'name' => $person['name'],
                'phone' => $person['phone'],
                'password' => Hash::make('Demo@12345'),
                'role' => User::ROLE_BUYER,
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        ), $people);
    }
}
