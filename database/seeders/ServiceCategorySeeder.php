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
                'partner_roles' => [User::ROLE_PROPERTY_MANAGER, User::ROLE_PACKERS_MOVERS],
                'is_property_specific' => true,
                'description' => 'General home repair and maintenance services.',
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
