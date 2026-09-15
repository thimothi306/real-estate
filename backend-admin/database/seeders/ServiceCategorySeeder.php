<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The 9 marketplace verticals from the spec that all share one shape —
 * customer raises a request, a partner role quotes, customer accepts,
 * work is tracked to completion — implemented once as service_requests
 * rather than as 9 separate systems.
 */
class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Home Loan',
                'partner_roles' => [User::ROLE_LOAN_PARTNER],
                'is_property_specific' => true,
                'description' => 'Home loan assistance and eligibility check for a specific property purchase.',
            ],
            [
                'name' => 'Legal Verification',
                'partner_roles' => [User::ROLE_LEGAL_CONSULTANT],
                'is_property_specific' => true,
                'description' => 'Title and document verification before purchase.',
            ],
            [
                'name' => 'Interior Design',
                'partner_roles' => [User::ROLE_INTERIOR_DESIGNER],
                'is_property_specific' => true,
                'description' => 'Interior design consultation and cost estimate.',
            ],
            [
                'name' => 'Property Management',
                'partner_roles' => [User::ROLE_PROPERTY_MANAGER],
                'is_property_specific' => true,
                'description' => 'Day-to-day management of an owned property.',
            ],
            [
                'name' => 'Rental Management',
                'partner_roles' => [User::ROLE_RENTAL_MANAGER],
                'is_property_specific' => true,
                'description' => 'End-to-end rental management — tenant sourcing, rent collection, upkeep.',
            ],
            [
                'name' => 'Registration Assistance',
                'partner_roles' => [User::ROLE_GOVT_REGISTRATION_PARTNER],
                'is_property_specific' => true,
                'description' => 'Property registration and government paperwork assistance.',
            ],
            [
                'name' => 'Tenant Verification',
                'partner_roles' => [User::ROLE_PROPERTY_MANAGER, User::ROLE_RENTAL_MANAGER],
                'is_property_specific' => true,
                'description' => 'Background and identity verification for a prospective tenant.',
            ],
            [
                'name' => 'Moving Services',
                'partner_roles' => [User::ROLE_PACKERS_MOVERS],
                'is_property_specific' => false,
                'description' => 'Packing and moving between properties.',
            ],
            [
                'name' => 'Home Services',
                'partner_roles' => [User::ROLE_PROPERTY_MANAGER, User::ROLE_PACKERS_MOVERS, User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'General home repair and maintenance — catch-all for anything not covered below.',
            ],

            // Kavuri Connect — hyperlocal trade categories. Any user can self-register
            // as a provider under these (see PartnerController::updateProfile), unlike
            // the pre-defined partner-role verticals above. Grouped at the category
            // level per the spec rather than one row per granular trade (e.g. "Plumber"
            // vs "Borewell Technician") — the provider's specific trade is captured in
            // PartnerProfile::profession instead, keeping this an MVP-sized list.
            [
                'name' => 'Plumbing & Water',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Plumbers, borewell technicians, water tank cleaning, RO repair.',
            ],
            [
                'name' => 'Electrical & Electronics',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Electricians, AC/appliance repair, CCTV and Wi-Fi installation.',
            ],
            [
                'name' => 'Home Renovation & Repairs',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Carpentry, painting, masonry, tiling, false ceiling, waterproofing.',
            ],
            [
                'name' => 'Cleaning & Housekeeping',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Deep cleaning, housekeeping staff, water tank and sofa cleaning.',
            ],
            [
                'name' => 'Outdoor & Garden',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Gardening, lawn care, pest control, swimming pool maintenance.',
            ],
            [
                'name' => 'Security & Staffing',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Security guards, watchmen, caretakers, facility staff.',
            ],
            [
                'name' => 'Household Staff',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => false,
                'description' => 'Cooks, maids, drivers, caregivers, laundry service.',
            ],
            [
                'name' => 'Construction & Civil Works',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Civil contractors, labour contractors, structural work.',
            ],
            [
                'name' => 'Commercial Property Services',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Office cleaning, reception staff, HVAC and fire-safety maintenance.',
            ],
            [
                'name' => 'Utility Services',
                'partner_roles' => [User::ROLE_SERVICE_PROVIDER],
                'is_property_specific' => true,
                'description' => 'Broadband, DTH, LPG, electricity/water connection assistance.',
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                $category
            );
        }
    }
}
