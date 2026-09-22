<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyRequirementTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_signed_out_visitor_can_submit_a_requirement(): void
    {
        $response = $this->postJson('/api/v1/property-requirements', [
            'name' => 'Asha Rao',
            'phone' => '+919876500001',
            'city' => 'Hyderabad',
            'property_type' => 'apartment',
            'listing_type' => 'rent',
            'budget_min' => 15000,
            'budget_max' => 25000,
            'message' => 'Looking for a 2BHK near Gachibowli.',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);

        $this->assertDatabaseHas('property_requirements', [
            'name' => 'Asha Rao',
            'phone' => '+919876500001',
            'city' => 'Hyderabad',
            'status' => 'new',
        ]);
    }

    public function test_name_and_phone_are_required(): void
    {
        $response = $this->postJson('/api/v1/property-requirements', [
            'city' => 'Hyderabad',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['name', 'phone']);
    }

    public function test_budget_max_cannot_be_below_budget_min(): void
    {
        $response = $this->postJson('/api/v1/property-requirements', [
            'name' => 'Test',
            'phone' => '+919876500002',
            'budget_min' => 50000,
            'budget_max' => 10000,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['budget_max']);
    }
}
