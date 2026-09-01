<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\LifestyleTag;
use App\Models\Property;
use App\Models\PropertyVerification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Fills the app with realistic, varied content so every screen — home,
 * search, filters, favorites, compare — has enough real data to actually
 * demonstrate the product instead of showing empty states everywhere.
 *
 * Safe to re-run: owners are upserted by email, properties are only created
 * if they don't already exist (matched by title).
 */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $owners = $this->seedOwners();
        $amenityIds = Amenity::pluck('id', 'slug');
        $lifestyleTagIds = LifestyleTag::pluck('id', 'slug');

        $listings = $this->listingData();
        $created = 0;

        foreach ($listings as $index => $data) {
            if (Property::where('title', $data['title'])->exists()) {
                continue;
            }

            $owner = $owners[$index % count($owners)];

            $property = Property::create([
                'owner_id' => $owner->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'property_type' => $data['property_type'],
                'listing_type' => $data['listing_type'],
                'status' => Property::STATUS_PUBLISHED,
                'price' => $data['price'],
                'rent_price' => $data['rent_price'] ?? null,
                'area_sqft' => $data['area_sqft'] ?? null,
                'plot_size_sqft' => $data['plot_size_sqft'] ?? null,
                'bedrooms' => $data['bedrooms'] ?? null,
                'bathrooms' => $data['bathrooms'] ?? null,
                'floor_no' => $data['floor_no'] ?? null,
                'total_floors' => $data['total_floors'] ?? null,
                'facing' => $data['facing'] ?? null,
                'furnishing_status' => $data['furnishing_status'] ?? null,
                'has_balcony' => $data['has_balcony'] ?? false,
                'has_swimming_pool' => $data['has_swimming_pool'] ?? false,
                'has_garden' => $data['has_garden'] ?? false,
                'has_parking' => $data['has_parking'] ?? false,
                'address_line' => $data['address_line'] ?? null,
                'locality' => $data['locality'],
                'city' => $data['city'],
                'state' => $data['state'],
                'pincode' => $data['pincode'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'rera_number' => $data['rera_number'] ?? null,
                'is_rera_approved' => $data['is_rera_approved'] ?? false,
                'is_featured' => $data['is_featured'] ?? false,
                'featured_until' => ($data['is_featured'] ?? false) ? now()->addDays(30) : null,
                'views_count' => $data['views_count'] ?? random_int(3, 480),
                'reviewed_by' => $owners[0]->id,
                'reviewed_at' => now()->subDays(random_int(1, 40)),
                'published_at' => now()->subDays(random_int(0, 35)),
            ]);

            if (! empty($data['amenities'])) {
                $ids = array_values(array_filter(array_map(fn ($slug) => $amenityIds[$slug] ?? null, $data['amenities'])));
                if ($ids) {
                    $property->amenities()->sync($ids);
                }
            }

            if (! empty($data['lifestyle_tags'])) {
                $ids = array_values(array_filter(array_map(fn ($slug) => $lifestyleTagIds[$slug] ?? null, $data['lifestyle_tags'])));
                if ($ids) {
                    $property->lifestyleTags()->sync($ids);
                }
            }

            foreach ($data['badges'] ?? [] as $badge) {
                PropertyVerification::create([
                    'property_id' => $property->id,
                    'badge_type' => $badge,
                    'verified_by' => $owners[0]->id,
                    'verified_at' => now()->subDays(random_int(1, 20)),
                ]);
            }

            $created++;
        }

        $this->command?->info("Demo content seeded: {$created} new properties created.");
    }

    /** @return User[] */
    protected function seedOwners(): array
    {
        $profiles = [
            ['name' => 'Priya Sharma', 'email' => 'priya.owner@demo.kavuriestates.com', 'phone' => '+919810000001', 'city' => 'Hyderabad'],
            ['name' => 'Ravi Kumar', 'email' => 'ravi.owner@demo.kavuriestates.com', 'phone' => '+919810000002', 'city' => 'Bengaluru'],
            ['name' => 'Ananya Reddy', 'email' => 'ananya.owner@demo.kavuriestates.com', 'phone' => '+919810000003', 'city' => 'Hyderabad'],
            ['name' => 'Vikram Constructions', 'email' => 'vikram.builder@demo.kavuriestates.com', 'phone' => '+919810000004', 'city' => 'Pune', 'role' => User::ROLE_BUILDER],
            ['name' => 'Meera Realty', 'email' => 'meera.agent@demo.kavuriestates.com', 'phone' => '+919810000005', 'city' => 'Chennai', 'role' => User::ROLE_AGENT],
        ];

        return array_map(function ($profile) {
            return User::updateOrCreate(
                ['email' => $profile['email']],
                [
                    'name' => $profile['name'],
                    'phone' => $profile['phone'],
                    'password' => Hash::make('Demo@12345'),
                    'role' => $profile['role'] ?? User::ROLE_OWNER,
                    'status' => 'active',
                    'city' => $profile['city'],
                    'email_verified_at' => now(),
                    'phone_verified_at' => now(),
                ]
            );
        }, $profiles);
    }

    protected function listingData(): array
    {
        return [
            [
                'title' => 'Skyline 3BHK with Hitech City Views',
                'description' => "Corner-facing 3BHK on the 14th floor with unobstructed views toward the Hitech City skyline. Freshly painted, modular kitchen, and a covered car park included. Five minutes to the metro station.",
                'property_type' => 'apartment', 'listing_type' => 'sale', 'price' => 18500000,
                'area_sqft' => 1850, 'bedrooms' => 3, 'bathrooms' => 3, 'floor_no' => 14, 'total_floors' => 22,
                'facing' => 'east', 'furnishing_status' => 'semi_furnished', 'has_balcony' => true, 'has_parking' => true,
                'locality' => 'Hitech City', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500081',
                'latitude' => 17.4483, 'longitude' => 78.3915, 'is_rera_approved' => true, 'rera_number' => 'P02400001234',
                'is_featured' => true, 'amenities' => ['lift', 'covered-parking', 'gymnasium', 'security-cctv', 'power-backup'],
                'lifestyle_tags' => ['family-friendly', 'luxury-living'], 'badges' => ['document_verified', 'owner_verified', 'gps_verified'],
            ],
            [
                'title' => 'Cozy 1BHK Near Kondapur Metro',
                'description' => "Compact and efficient 1BHK, ideal for a working professional. Walking distance to the metro and several cafes. Semi-furnished with a wardrobe and modular kitchen fittings.",
                'property_type' => 'apartment', 'listing_type' => 'rent', 'price' => 1200000, 'rent_price' => 16500,
                'area_sqft' => 620, 'bedrooms' => 1, 'bathrooms' => 1, 'floor_no' => 4, 'total_floors' => 8,
                'facing' => 'north', 'furnishing_status' => 'semi_furnished', 'has_parking' => true,
                'locality' => 'Kondapur', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500084',
                'latitude' => 17.4615, 'longitude' => 78.3646, 'amenities' => ['lift', 'security-cctv', 'wi-fi-ready'],
                'lifestyle_tags' => ['bachelor-friendly'], 'badges' => ['owner_verified'],
            ],
            [
                'title' => 'Independent Villa with Private Garden, Gachibowli',
                'description' => "Four-bedroom independent villa on a 300 sq yd plot. Private garden, covered parking for two cars, and a small home office room. Gated community with round-the-clock security.",
                'property_type' => 'villa', 'listing_type' => 'sale', 'price' => 42000000,
                'area_sqft' => 3400, 'plot_size_sqft' => 2700, 'bedrooms' => 4, 'bathrooms' => 4,
                'facing' => 'north_east', 'furnishing_status' => 'unfurnished', 'has_garden' => true, 'has_parking' => true,
                'locality' => 'Gachibowli', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500032',
                'latitude' => 17.4401, 'longitude' => 78.3489, 'is_rera_approved' => true, 'rera_number' => 'P02400005678',
                'is_featured' => true, 'amenities' => ['covered-parking', 'garden', 'security-cctv', 'rainwater-harvesting'],
                'lifestyle_tags' => ['family-friendly', 'luxury-living', 'pet-friendly'],
                'badges' => ['document_verified', 'owner_verified', 'video_verified', 'gps_verified', 'government_record_checked'],
            ],
            [
                'title' => 'Open Residential Plot, Shamshabad Ring Road',
                'description' => "HMDA-approved plot on the outer ring road, 220 sq yards, clear title with no encumbrances. Ready for immediate construction. Close to the airport expressway.",
                'property_type' => 'plot', 'listing_type' => 'sale', 'price' => 8800000,
                'plot_size_sqft' => 1980, 'facing' => 'south',
                'locality' => 'Shamshabad', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '501218',
                'latitude' => 17.2403, 'longitude' => 78.4294, 'is_rera_approved' => true, 'rera_number' => 'P02400009911',
                'badges' => ['document_verified', 'government_record_checked'],
            ],
            [
                'title' => 'Weekend Farmhouse with Mango Orchard, Vikarabad',
                'description' => "5-acre farmhouse property with an existing mango orchard, borewell, and a two-room cottage. Ideal weekend retreat or agri-investment, 90 minutes from the city.",
                'property_type' => 'farmhouse', 'listing_type' => 'sale', 'price' => 12500000,
                'area_sqft' => 1200, 'plot_size_sqft' => 217800, 'bedrooms' => 2, 'bathrooms' => 1,
                'locality' => 'Vikarabad', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '501101',
                'amenities' => ['garden', 'rainwater-harvesting'], 'lifestyle_tags' => ['weekend-home', 'retirement-home'],
                'badges' => ['owner_verified'],
            ],
            [
                'title' => 'Lakeview Resort Property, Shamirpet',
                'description' => "Operating boutique resort on 2 acres bordering Shamirpet Lake — 12 guest cottages, a restaurant block, and an event lawn. Sold as a running business with staff willing to continue.",
                'property_type' => 'resort', 'listing_type' => 'sale', 'price' => 95000000,
                'area_sqft' => 18000, 'plot_size_sqft' => 87120,
                'locality' => 'Shamirpet', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500078',
                'is_featured' => true, 'amenities' => ['swimming-pool', 'garden', 'covered-parking', 'security-cctv'],
                'lifestyle_tags' => ['hotel-investment', 'luxury-living'], 'badges' => ['document_verified', 'owner_verified'],
            ],
            [
                'title' => 'Garden Wedding Venue, Outer Ring Road',
                'description' => "1.5-acre event venue with a covered mandap, an air-conditioned banquet hall for 300, and ample parking. Available for bookings on a per-event basis.",
                'property_type' => 'wedding_venue', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 250000,
                'area_sqft' => 12000, 'locality' => 'Patancheru', 'city' => 'Hyderabad', 'state' => 'Telangana',
                'pincode' => '502319', 'has_parking' => true, 'amenities' => ['covered-parking', 'garden', 'power-backup'],
                'lifestyle_tags' => ['luxury-living'],
            ],
            [
                'title' => 'Furnished PG for Working Women, Madhapur',
                'description' => "Ladies-only PG with twin-sharing rooms, home-cooked meals included, high-speed Wi-Fi, and laundry service. Five minutes' walk to the IT corridor.",
                'property_type' => 'pg', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 12000,
                'area_sqft' => 180, 'bedrooms' => 1, 'furnishing_status' => 'fully_furnished',
                'locality' => 'Madhapur', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500081',
                'amenities' => ['wi-fi-ready', 'security-cctv'], 'lifestyle_tags' => ['bachelor-friendly'],
                'badges' => ['owner_verified'],
            ],
            [
                'title' => 'Budget Hostel Near University, Ameerpet',
                'description' => "Dormitory-style hostel accommodation for students — 4-bed rooms, common study hall, and mess facility on the ground floor.",
                'property_type' => 'hostel', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 7500,
                'area_sqft' => 220, 'locality' => 'Ameerpet', 'city' => 'Hyderabad', 'state' => 'Telangana',
                'pincode' => '500016', 'amenities' => ['wi-fi-ready'], 'lifestyle_tags' => ['bachelor-friendly'],
            ],
            [
                'title' => 'Grade-A Office Floor Plate, Financial District',
                'description' => "10,000 sq ft fitted office floor with raised flooring, central AC, and a 200 KVA DG backup. Suitable for a mid-size IT or BFSI occupier. Immediate possession.",
                'property_type' => 'office_space', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 550000,
                'area_sqft' => 10000, 'floor_no' => 6, 'total_floors' => 12, 'furnishing_status' => 'fully_furnished',
                'locality' => 'Financial District', 'city' => 'Hyderabad', 'state' => 'Telangana', 'pincode' => '500032',
                'has_parking' => true, 'is_featured' => true,
                'amenities' => ['lift', 'covered-parking', 'power-backup', 'security-cctv'],
                'lifestyle_tags' => ['startup-office'], 'badges' => ['document_verified', 'owner_verified'],
            ],
            [
                'title' => 'High-Street Retail Shop, Banjara Hills Road No. 12',
                'description' => "Ground-floor retail shop with 30 ft frontage on a high-footfall commercial road. Currently vacant, previously operated as a boutique showroom.",
                'property_type' => 'shop', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 180000,
                'area_sqft' => 1400, 'locality' => 'Banjara Hills', 'city' => 'Hyderabad', 'state' => 'Telangana',
                'pincode' => '500034', 'amenities' => ['power-backup', 'security-cctv'],
            ],
            [
                'title' => 'Warehouse Unit with Loading Dock, Patancheru Industrial Area',
                'description' => "40,000 sq ft pre-leased warehouse with two loading docks, 30-ft clear height, and fire NOC in place. Suitable for 3PL or FMCG storage.",
                'property_type' => 'warehouse', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 480000,
                'area_sqft' => 40000, 'locality' => 'Patancheru Industrial Area', 'city' => 'Hyderabad',
                'state' => 'Telangana', 'pincode' => '502319', 'has_parking' => true,
                'amenities' => ['power-backup', 'covered-parking'], 'lifestyle_tags' => ['warehouse'],
            ],
            [
                'title' => 'Commercial Building for Sale, Kukatpally Y Junction',
                'description' => "G+3 commercial building, fully leased to three tenants generating steady rental yield. Located directly on the Y Junction commercial belt.",
                'property_type' => 'commercial', 'listing_type' => 'sale', 'price' => 65000000,
                'area_sqft' => 9500, 'total_floors' => 4, 'locality' => 'Kukatpally', 'city' => 'Hyderabad',
                'state' => 'Telangana', 'pincode' => '500072', 'has_parking' => true,
                'amenities' => ['covered-parking', 'power-backup'], 'badges' => ['document_verified'],
            ],
            [
                'title' => 'Premium 4BHK Duplex Penthouse, Jubilee Hills',
                'description' => "Top-floor duplex penthouse with a private terrace, plunge pool, and panoramic city views. Designer interiors with imported fittings throughout.",
                'property_type' => 'apartment', 'listing_type' => 'sale', 'price' => 68000000,
                'area_sqft' => 4200, 'bedrooms' => 4, 'bathrooms' => 5, 'floor_no' => 18, 'total_floors' => 18,
                'facing' => 'west', 'furnishing_status' => 'fully_furnished', 'has_balcony' => true,
                'has_swimming_pool' => true, 'has_parking' => true, 'locality' => 'Jubilee Hills', 'city' => 'Hyderabad',
                'state' => 'Telangana', 'pincode' => '500033', 'latitude' => 17.4239, 'longitude' => 78.4109,
                'is_rera_approved' => true, 'rera_number' => 'P02400002211', 'is_featured' => true,
                'amenities' => ['swimming-pool', 'lift', 'gymnasium', 'clubhouse', 'security-cctv', 'covered-parking'],
                'lifestyle_tags' => ['luxury-living'],
                'badges' => ['document_verified', 'owner_verified', 'video_verified', 'gps_verified'],
            ],
            [
                'title' => 'Retirement-Friendly 2BHK, Ground Floor, Whitefield',
                'description' => "Senior-friendly ground-floor unit with no steps, wide doorways, and a quiet, low-traffic street. Close to a multi-specialty hospital.",
                'property_type' => 'apartment', 'listing_type' => 'sale', 'price' => 9200000,
                'area_sqft' => 1100, 'bedrooms' => 2, 'bathrooms' => 2, 'floor_no' => 0, 'total_floors' => 6,
                'furnishing_status' => 'unfurnished', 'locality' => 'Whitefield', 'city' => 'Bengaluru',
                'state' => 'Karnataka', 'pincode' => '560066', 'latitude' => 12.9698, 'longitude' => 77.7500,
                'amenities' => ['lift', 'security-cctv'], 'lifestyle_tags' => ['retirement-home'],
                'badges' => ['owner_verified'],
            ],
            [
                'title' => 'Tech Park Adjacent 2BHK, Electronic City',
                'description' => "Ready-to-move 2BHK five minutes from the Electronic City tech park entrance. Ideal for IT professionals; landlord open to a corporate lease.",
                'property_type' => 'apartment', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 28000,
                'area_sqft' => 1050, 'bedrooms' => 2, 'bathrooms' => 2, 'floor_no' => 3, 'total_floors' => 10,
                'furnishing_status' => 'semi_furnished', 'has_parking' => true, 'locality' => 'Electronic City',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'pincode' => '560100',
                'amenities' => ['lift', 'covered-parking', 'gymnasium'], 'lifestyle_tags' => ['bachelor-friendly', 'family-friendly'],
            ],
            [
                'title' => 'Pet-Friendly 3BHK with Rooftop Deck, Koramangala',
                'description' => "Spacious 3BHK in a small, pet-friendly community with a shared rooftop deck. Two balconies, close to Koramangala's restaurant strip.",
                'property_type' => 'apartment', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 45000,
                'area_sqft' => 1650, 'bedrooms' => 3, 'bathrooms' => 3, 'floor_no' => 5, 'total_floors' => 7,
                'furnishing_status' => 'fully_furnished', 'has_balcony' => true, 'has_parking' => true,
                'locality' => 'Koramangala', 'city' => 'Bengaluru', 'state' => 'Karnataka', 'pincode' => '560034',
                'is_featured' => true, 'amenities' => ['lift', 'covered-parking', 'security-cctv'],
                'lifestyle_tags' => ['pet-friendly', 'luxury-living'], 'badges' => ['owner_verified', 'video_verified'],
            ],
            [
                'title' => 'New Launch 2BHK, Wakad Riverside Project',
                'description' => "Under-construction riverside project with clubhouse, landscaped gardens, and a jogging track. Possession expected in 18 months.",
                'property_type' => 'apartment', 'listing_type' => 'sale', 'price' => 7600000,
                'area_sqft' => 980, 'bedrooms' => 2, 'bathrooms' => 2, 'furnishing_status' => 'unfurnished',
                'locality' => 'Wakad', 'city' => 'Pune', 'state' => 'Maharashtra', 'pincode' => '411057',
                'is_rera_approved' => true, 'rera_number' => 'P52100034567',
                'amenities' => ['clubhouse', 'garden', 'gymnasium', 'covered-parking'], 'lifestyle_tags' => ['family-friendly'],
                'badges' => ['document_verified'],
            ],
            [
                'title' => 'Independent House, ECR Beach Road, Chennai',
                'description' => "Three-bedroom independent house 500 meters from ECR beach road. Terrace with sea breeze, small front garden, and covered parking for one car.",
                'property_type' => 'villa', 'listing_type' => 'sale', 'price' => 22000000,
                'area_sqft' => 2100, 'plot_size_sqft' => 1800, 'bedrooms' => 3, 'bathrooms' => 3,
                'has_garden' => true, 'has_parking' => true, 'locality' => 'ECR', 'city' => 'Chennai',
                'state' => 'Tamil Nadu', 'pincode' => '600119', 'amenities' => ['garden', 'covered-parking'],
                'lifestyle_tags' => ['weekend-home', 'family-friendly'], 'badges' => ['owner_verified'],
            ],
            [
                'title' => 'Compact Studio Apartment, Powai',
                'description' => "Efficient studio layout near Powai Lake, walking distance to Hiranandani Gardens. Perfect for a single occupant or young couple.",
                'property_type' => 'apartment', 'listing_type' => 'rent', 'price' => 0, 'rent_price' => 32000,
                'area_sqft' => 480, 'bedrooms' => 1, 'bathrooms' => 1, 'furnishing_status' => 'fully_furnished',
                'locality' => 'Powai', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'pincode' => '400076',
                'amenities' => ['lift', 'security-cctv', 'wi-fi-ready'], 'lifestyle_tags' => ['bachelor-friendly'],
            ],
            [
                'title' => 'Sea-Facing 3BHK, Bandra West',
                'description' => "Rare sea-facing 3BHK in a well-maintained low-rise building. Unobstructed Arabian Sea views from the living room and master bedroom.",
                'property_type' => 'apartment', 'listing_type' => 'sale', 'price' => 85000000,
                'area_sqft' => 2200, 'bedrooms' => 3, 'bathrooms' => 3, 'floor_no' => 6, 'total_floors' => 8,
                'facing' => 'west', 'furnishing_status' => 'semi_furnished', 'has_balcony' => true,
                'locality' => 'Bandra West', 'city' => 'Mumbai', 'state' => 'Maharashtra', 'pincode' => '400050',
                'is_featured' => true, 'is_rera_approved' => true, 'rera_number' => 'P51800012349',
                'amenities' => ['lift', 'security-cctv'], 'lifestyle_tags' => ['luxury-living'],
                'badges' => ['document_verified', 'owner_verified', 'gps_verified'],
            ],
        ];
    }
}
