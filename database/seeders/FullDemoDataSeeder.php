<?php

namespace Database\Seeders;

use App\Models\AvailabilityBlock;
use App\Models\Favorite;
use App\Models\Lead;
use App\Models\Notification;
use App\Models\PartnerProfile;
use App\Models\PartnerReview;
use App\Models\Payment;
use App\Models\Property;
use App\Models\PropertyReport;
use App\Models\RecentlyViewed;
use App\Models\SavedSearch;
use App\Models\ServiceCategory;
use App\Models\ServiceQuote;
use App\Models\ServiceRequest;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Fills every remaining table so no screen in the app renders an empty state.
 *
 * Everything here is cross-referenced against rows that already exist — a
 * quote belongs to a real request, a favourite points at a published
 * property, a partner holds the role its service category expects. Re-running
 * is safe: each block checks before inserting.
 */
class FullDemoDataSeeder extends Seeder
{
    protected array $buyers = [];
    protected array $partners = [];

    public function run(): void
    {
        $properties = Property::published()->get();

        if ($properties->isEmpty()) {
            $this->command?->warn('No published properties — run DemoContentSeeder first.');

            return;
        }

        $this->buyers = $this->seedBuyers();
        $this->partners = $this->seedPartners();

        $this->seedFavourites($properties);
        $this->seedRecentlyViewed($properties);
        $this->seedSavedSearches();
        $this->seedVisits($properties);
        $this->seedLeads($properties);
        $this->seedBookings($properties);
        $this->seedServiceRequests($properties);
        $this->seedPartnerReviews();
        $this->seedPayments($properties);
        $this->seedReports($properties);
        $this->seedNotifications($properties);

        $this->command?->info('Full demo data seeded.');
    }

    /** @return User[] */
    protected function seedBuyers(): array
    {
        $people = [
            ['name' => 'Rohan Kumar', 'email' => 'rohan@demo.kavuriestates.com', 'phone' => '+919700000001'],
            ['name' => 'Kavya Rao', 'email' => 'kavya@demo.kavuriestates.com', 'phone' => '+919700000002'],
            ['name' => 'Imran Shaikh', 'email' => 'imran@demo.kavuriestates.com', 'phone' => '+919700000003'],
        ];

        return array_map(fn ($p) => User::updateOrCreate(
            ['email' => $p['email']],
            [
                'name' => $p['name'], 'phone' => $p['phone'], 'password' => Hash::make('Demo@12345'),
                'role' => User::ROLE_BUYER, 'status' => 'active', 'city' => 'Hyderabad',
                'email_verified_at' => now(), 'phone_verified_at' => now(),
            ]
        ), $people);
    }

    /**
     * One verified partner per service vertical, each holding a role that
     * category actually accepts — otherwise they'd never see its queue.
     * @return array<string, User>
     */
    protected function seedPartners(): array
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $partners = [];

        foreach (ServiceCategory::all() as $index => $category) {
            $roles = is_array($category->partner_roles) ? $category->partner_roles : [];
            $role = $roles[0] ?? User::ROLE_AGENT;

            $slug = Str::slug($category->name);
            $user = User::updateOrCreate(
                ['email' => "{$slug}@partners.kavuriestates.com"],
                [
                    'name' => $this->partnerNameFor($category->name),
                    'phone' => '+9198111000'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'password' => Hash::make('Demo@12345'),
                    'role' => $role, 'status' => 'active', 'city' => 'Hyderabad',
                    'email_verified_at' => now(), 'phone_verified_at' => now(),
                ]
            );

            $profile = PartnerProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $this->partnerNameFor($category->name),
                    'bio' => "Trusted {$category->name} partner serving Hyderabad and surrounding areas since 2016.",
                    'cities_served' => ['Hyderabad', 'Bengaluru'],
                    'years_experience' => random_int(4, 15),
                    'is_verified' => true,
                    'verified_by' => $admin?->id,
                    'verified_at' => now()->subDays(random_int(10, 200)),
                    'total_completed' => random_int(12, 180),
                    'rating_avg' => round(random_int(410, 495) / 100, 2),
                    'rating_count' => random_int(8, 90),
                ]
            );

            $profile->categories()->syncWithoutDetaching([$category->id]);
            $partners[$category->slug ?? $slug] = $user;
        }

        return $partners;
    }

    protected function partnerNameFor(string $category): string
    {
        return match (true) {
            str_contains($category, 'Interior') => 'Aashray Interiors',
            str_contains($category, 'Legal') => 'Sharma Legal Associates',
            str_contains($category, 'Loan') => 'FinEdge Loan Advisors',
            str_contains($category, 'Packers') => 'SafeMove Packers & Movers',
            str_contains($category, 'Management') => 'Prime Property Care',
            str_contains($category, 'Rental') => 'RentEasy Managers',
            str_contains($category, 'Registration') => 'GovDesk Registration Services',
            str_contains($category, 'Clean') => 'SparklePro Cleaning',
            default => $category.' Experts',
        };
    }

    protected function seedFavourites($properties): void
    {
        foreach ($this->buyers as $i => $buyer) {
            // Each buyer saves a different, overlapping slice.
            foreach ($properties->slice($i * 2, 5) as $property) {
                Favorite::firstOrCreate(['user_id' => $buyer->id, 'property_id' => $property->id]);
            }
        }
    }

    protected function seedRecentlyViewed($properties): void
    {
        foreach ($this->buyers as $buyer) {
            foreach ($properties->shuffle()->take(6) as $index => $property) {
                RecentlyViewed::updateOrCreate(
                    ['user_id' => $buyer->id, 'property_id' => $property->id],
                    ['viewed_at' => now()->subHours($index * 5 + 1)]
                );
            }
        }
    }

    protected function seedSavedSearches(): void
    {
        $searches = [
            ['name' => '3 BHK in Hitech City', 'filters' => ['city' => 'Hyderabad', 'bedrooms' => 3, 'listing_type' => 'sale']],
            ['name' => 'Plots under ₹1 Cr', 'filters' => ['property_type' => 'plot', 'max_price' => 10000000]],
            ['name' => 'Pet-friendly rentals', 'filters' => ['listing_type' => 'rent', 'lifestyle_tag' => 'pet-friendly']],
            ['name' => 'Villas in Gachibowli', 'filters' => ['property_type' => 'villa', 'city' => 'Hyderabad']],
        ];

        foreach ($this->buyers as $i => $buyer) {
            foreach (array_slice($searches, $i, 2) as $search) {
                SavedSearch::firstOrCreate(
                    ['user_id' => $buyer->id, 'name' => $search['name']],
                    ['filters' => $search['filters'], 'notify_on_match' => true]
                );
            }
        }
    }

    protected function seedVisits($properties): void
    {
        if (Visit::count() > 0) {
            return;
        }

        $plan = [
            ['status' => 'confirmed', 'days' => 2, 'note' => 'Prefer a morning slot if possible.'],
            ['status' => 'pending', 'days' => 4, 'note' => null],
            ['status' => 'completed', 'days' => -6, 'note' => 'Visited with family.'],
            ['status' => 'pending', 'days' => 7, 'note' => 'Coming with my parents.'],
            ['status' => 'confirmed', 'days' => 1, 'note' => null],
            ['status' => 'cancelled', 'days' => -2, 'note' => 'Had to reschedule.'],
        ];

        foreach ($plan as $i => $row) {
            $property = $properties[$i % $properties->count()];
            $buyer = $this->buyers[$i % count($this->buyers)];

            Visit::create([
                'property_id' => $property->id,
                'buyer_id' => $buyer->id,
                'scheduled_at' => now()->addDays($row['days'])->setTime(random_int(10, 17), [0, 30][random_int(0, 1)]),
                'status' => $row['status'],
                'note' => $row['note'],
            ]);
        }
    }

    protected function seedLeads($properties): void
    {
        if (Lead::count() > 0) {
            return;
        }

        $types = ['message', 'call', 'callback_request', 'whatsapp'];
        // Must match the leads.status ENUM exactly.
        $statuses = ['new', 'new', 'contacted', 'visit_scheduled', 'negotiating', 'closed'];

        foreach ($properties->take(14) as $i => $property) {
            Lead::create([
                'property_id' => $property->id,
                'buyer_id' => $this->buyers[$i % count($this->buyers)]->id,
                'type' => $types[$i % count($types)],
                'status' => $statuses[$i % count($statuses)],
                'note' => $i % 3 === 0 ? 'Interested — please share the floor plan.' : null,
                'created_at' => now()->subDays(random_int(0, 12)),
            ]);
        }
    }

    /** Date-range bookings only make sense for stay-type properties. */
    protected function seedBookings($properties): void
    {
        if (AvailabilityBlock::count() > 0) {
            return;
        }

        $bookable = $properties->whereIn('property_type', ['farmhouse', 'resort', 'wedding_venue', 'pg', 'hostel']);

        foreach ($bookable as $i => $property) {
            $start = now()->addDays(($i + 1) * 6);

            AvailabilityBlock::create([
                'property_id' => $property->id,
                'booked_by' => $this->buyers[$i % count($this->buyers)]->id,
                'start_date' => $start->toDateString(),
                'end_date' => $start->copy()->addDays(random_int(1, 3))->toDateString(),
                'status' => ['pending', 'confirmed', 'confirmed'][$i % 3],
                'note' => 'Weekend stay for the family.',
            ]);
        }
    }

    /** Requests across several verticals, each with quotes; one is accepted. */
    protected function seedServiceRequests($properties): void
    {
        if (ServiceRequest::count() > 0) {
            return;
        }

        $categories = ServiceCategory::all();
        $blueprint = [
            ['title' => 'Full interior design for a 3 BHK', 'desc' => 'Looking for modular kitchen, wardrobes and false ceiling for a newly bought 3 BHK in Hitech City.', 'min' => 400000, 'max' => 900000, 'status' => 'accepted'],
            ['title' => 'Title verification before purchase', 'desc' => 'Need a lawyer to verify title documents and encumbrance certificate for a plot.', 'min' => 8000, 'max' => 20000, 'status' => 'quoted'],
            ['title' => 'Home loan assistance for ₹60 L', 'desc' => 'Salaried, looking for the best rate and help with paperwork.', 'min' => 0, 'max' => 15000, 'status' => 'quoted'],
            ['title' => 'Shifting 2 BHK to Gachibowli', 'desc' => 'Need packers and movers for a 2 BHK move within the city next month.', 'min' => 12000, 'max' => 30000, 'status' => 'open'],
            ['title' => 'Tenant management for 2 flats', 'desc' => 'Looking for end-to-end rental management including rent collection.', 'min' => 5000, 'max' => 12000, 'status' => 'in_progress'],
            ['title' => 'Deep cleaning before possession', 'desc' => 'Full deep clean for a 1650 sq ft apartment before we move in.', 'min' => 4000, 'max' => 9000, 'status' => 'completed'],
        ];

        foreach ($blueprint as $i => $row) {
            $category = $categories[$i % $categories->count()];
            $buyer = $this->buyers[$i % count($this->buyers)];
            $partner = $this->partners[$category->slug] ?? null;

            $request = ServiceRequest::create([
                'user_id' => $buyer->id,
                'service_category_id' => $category->id,
                'property_id' => $properties[$i % $properties->count()]->id,
                'title' => $row['title'],
                'description' => $row['desc'],
                'budget_min' => $row['min'],
                'budget_max' => $row['max'],
                'status' => $row['status'] === 'open' ? 'open' : $row['status'],
                'created_at' => now()->subDays(random_int(1, 20)),
            ]);

            if ($row['status'] === 'open' || ! $partner) {
                continue;
            }

            $quote = ServiceQuote::create([
                'service_request_id' => $request->id,
                'partner_id' => $partner->id,
                'amount' => round(($row['min'] + $row['max']) / 2),
                'message' => 'Thanks for reaching out — this covers material, labour and a 1-year warranty.',
                'status' => in_array($row['status'], ['accepted', 'in_progress', 'completed'], true) ? 'accepted' : 'pending',
                'valid_until' => now()->addDays(14),
            ]);

            // A second, competing quote makes the compare view meaningful.
            $other = collect($this->partners)->firstWhere('id', '!=', $partner->id);
            if ($other) {
                ServiceQuote::create([
                    'service_request_id' => $request->id,
                    'partner_id' => $other->id,
                    'amount' => round(($row['min'] + $row['max']) / 2 * 1.15),
                    'message' => 'We can start next week and finish ahead of schedule.',
                    'status' => 'pending',
                    'valid_until' => now()->addDays(10),
                ]);
            }

            if ($quote->status === 'accepted') {
                $request->update([
                    'accepted_quote_id' => $quote->id,
                    'assigned_partner_id' => $partner->id,
                    'completed_at' => $row['status'] === 'completed' ? now()->subDays(2) : null,
                ]);
            }
        }
    }

    protected function seedPartnerReviews(): void
    {
        if (PartnerReview::count() > 0) {
            return;
        }

        $comments = [
            'Excellent work, finished on time and within budget.',
            'Very professional team, clear communication throughout.',
            'Good service overall. Would recommend to others.',
            'Handled everything end to end — completely hassle free.',
        ];

        foreach (ServiceRequest::whereNotNull('assigned_partner_id')->get() as $i => $request) {
            PartnerReview::create([
                'service_request_id' => $request->id,
                'partner_id' => $request->assigned_partner_id,
                'reviewer_id' => $request->user_id,
                'rating' => random_int(4, 5),
                'comment' => $comments[$i % count($comments)],
            ]);
        }
    }

    protected function seedPayments($properties): void
    {
        if (Payment::count() > 0) {
            return;
        }

        $owners = User::whereIn('role', [User::ROLE_OWNER, User::ROLE_BUILDER, User::ROLE_AGENT])->take(4)->get();
        $plans = SubscriptionPlan::all();

        foreach ($owners as $i => $owner) {
            $featured = $properties->where('owner_id', $owner->id)->first() ?? $properties[$i];

            Payment::create([
                'user_id' => $owner->id,
                'purpose' => 'featured_listing',
                'reference_id' => $featured->id,
                'amount' => 499.00,
                'currency' => 'INR',
                'status' => 'completed',
                'gateway' => 'razorpay',
                'gateway_order_id' => 'order_demo'.Str::random(10),
                'gateway_payment_id' => 'pay_demo'.Str::random(10),
                'paid_at' => now()->subDays(random_int(1, 25)),
                'created_at' => now()->subDays(random_int(1, 25)),
            ]);

            $plan = $plans->firstWhere('target_role', $owner->role);
            if (! $plan) {
                continue;
            }

            $payment = Payment::create([
                'user_id' => $owner->id,
                'purpose' => 'subscription',
                'reference_id' => $plan->id,
                'amount' => (float) $plan->price,
                'currency' => 'INR',
                'status' => 'completed',
                'gateway' => 'razorpay',
                'gateway_order_id' => 'order_demo'.Str::random(10),
                'gateway_payment_id' => 'pay_demo'.Str::random(10),
                'paid_at' => now()->subDays(random_int(1, 15)),
                'created_at' => now()->subDays(random_int(1, 15)),
            ]);

            Subscription::create([
                'user_id' => $owner->id,
                'subscription_plan_id' => $plan->id,
                'payment_id' => $payment->id,
                'status' => 'active',
                'starts_at' => now()->subDays(10),
                'ends_at' => now()->addDays($plan->duration_days - 10),
            ]);
        }

        // One failed attempt so the admin "failed payments" alert is real.
        Payment::create([
            'user_id' => $this->buyers[0]->id,
            'purpose' => 'featured_listing',
            'reference_id' => $properties[0]->id,
            'amount' => 499.00,
            'currency' => 'INR',
            'status' => 'failed',
            'gateway' => 'razorpay',
            'failure_reason' => 'Payment gateway credentials not configured.',
            'created_at' => now()->subDays(3),
        ]);
    }

    protected function seedReports($properties): void
    {
        if (PropertyReport::count() > 0) {
            return;
        }

        $reports = [
            ['reason' => 'incorrect_info', 'description' => 'The listed area does not match the floor plan shared by the owner.'],
            ['reason' => 'sold_already', 'description' => 'I called and was told this property was sold last month.'],
        ];

        foreach ($reports as $i => $report) {
            PropertyReport::create([
                'property_id' => $properties[$i + 2]->id,
                'reporter_id' => $this->buyers[$i]->id,
                'reason' => $report['reason'],
                'description' => $report['description'],
                'status' => 'pending',
                'created_at' => now()->subDays(random_int(1, 6)),
            ]);
        }
    }

    /**
     * Laravel notifications live in a polymorphic table, so they're written
     * directly rather than through a Notification model.
     */
    protected function seedNotifications($properties): void
    {
        if (DB::table('notifications')->count() > 0) {
            return;
        }

        $templates = [
            ['type' => 'price_drop', 'message' => 'Price dropped on a property you saved.'],
            ['type' => 'new_match', 'message' => 'A new listing matches your saved search.'],
            ['type' => 'visit_confirmed', 'message' => 'Your visit request has been confirmed by the owner.'],
            ['type' => 'new_message', 'message' => 'You have a new message from a property owner.'],
            ['type' => 'quote_received', 'message' => 'A verified partner sent you a quote.'],
        ];

        $rows = [];
        foreach ($this->buyers as $buyer) {
            foreach ($templates as $i => $template) {
                $property = $properties[$i % $properties->count()];

                $rows[] = [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\\Notifications\\'.Str::studly($template['type']),
                    'notifiable_type' => User::class,
                    'notifiable_id' => $buyer->id,
                    'data' => json_encode([
                        'type' => $template['type'],
                        'message' => $template['message'],
                        'property_id' => $property->id,
                        'property_slug' => $property->slug,
                        'title' => $property->title,
                        'price' => (float) $property->price,
                        'city' => $property->city,
                    ]),
                    'read_at' => $i < 2 ? null : now()->subHours($i),
                    'created_at' => now()->subHours($i * 7 + 1),
                    'updated_at' => now()->subHours($i * 7 + 1),
                ];
            }
        }

        DB::table('notifications')->insert($rows);
    }
}
