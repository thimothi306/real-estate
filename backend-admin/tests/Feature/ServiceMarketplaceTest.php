<?php

namespace Tests\Feature;

use App\Models\PartnerProfile;
use App\Models\ServiceCategory;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceMarketplaceTest extends TestCase
{
    use RefreshDatabase;

    protected function rentalManagementCategory(): ServiceCategory
    {
        return ServiceCategory::create([
            'name' => 'Rental Management',
            'slug' => 'rental-management',
            'partner_roles' => [User::ROLE_RENTAL_MANAGER],
            'is_property_specific' => true,
        ]);
    }

    public function test_a_buyer_can_post_a_service_request(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $category = $this->rentalManagementCategory();

        $response = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/service-requests', [
            'service_category_id' => $category->id,
            'title' => 'Manage my rental',
            'description' => 'Need full management.',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.status', 'open');
        $this->assertDatabaseHas('service_requests', ['user_id' => $buyer->id, 'status' => 'open']);
    }

    public function test_only_a_matching_partner_role_sees_the_request_in_their_queue(): void
    {
        $rentalManager = User::factory()->create(['role' => User::ROLE_RENTAL_MANAGER]);
        $loanPartner = User::factory()->create(['role' => User::ROLE_LOAN_PARTNER]);
        $category = $this->rentalManagementCategory();

        ServiceRequest::create([
            'user_id' => User::factory()->create()->id,
            'service_category_id' => $category->id,
            'title' => 'Manage my rental',
            'status' => ServiceRequest::STATUS_OPEN,
        ]);

        $this->actingAs($rentalManager, 'sanctum')
            ->getJson('/api/v1/my/service-queue')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->actingAs($loanPartner, 'sanctum')
            ->getJson('/api/v1/my/service-queue')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_a_non_partner_cannot_submit_a_quote(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $category = $this->rentalManagementCategory();

        $serviceRequest = ServiceRequest::create([
            'user_id' => User::factory()->create()->id,
            'service_category_id' => $category->id,
            'title' => 'Manage my rental',
            'status' => ServiceRequest::STATUS_OPEN,
        ]);

        $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/service-requests/{$serviceRequest->id}/quotes", ['amount' => 1000])
            ->assertStatus(403);
    }

    public function test_accepting_a_quote_assigns_the_partner_and_rejects_other_quotes(): void
    {
        $requester = User::factory()->create(['role' => User::ROLE_BUYER]);
        $partnerA = User::factory()->create(['role' => User::ROLE_RENTAL_MANAGER]);
        $partnerB = User::factory()->create(['role' => User::ROLE_RENTAL_MANAGER]);
        $category = $this->rentalManagementCategory();

        $serviceRequest = ServiceRequest::create([
            'user_id' => $requester->id,
            'service_category_id' => $category->id,
            'title' => 'Manage my rental',
            'status' => ServiceRequest::STATUS_OPEN,
        ]);

        $quoteA = $this->actingAs($partnerA, 'sanctum')
            ->postJson("/api/v1/service-requests/{$serviceRequest->id}/quotes", ['amount' => 3000])
            ->json('data');

        $this->actingAs($partnerB, 'sanctum')
            ->postJson("/api/v1/service-requests/{$serviceRequest->id}/quotes", ['amount' => 2500]);

        $this->actingAs($requester, 'sanctum')
            ->postJson("/api/v1/quotes/{$quoteA['id']}/accept")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'accepted')
            ->assertJsonPath('data.assigned_partner_id', $partnerA->id);

        $this->assertDatabaseHas('service_quotes', ['id' => $quoteA['id'], 'status' => 'accepted']);
        $this->assertDatabaseHas('service_quotes', ['partner_id' => $partnerB->id, 'status' => 'rejected']);
    }

    public function test_partner_directory_hides_unverified_profiles(): void
    {
        $partner = User::factory()->create(['role' => User::ROLE_RENTAL_MANAGER]);
        PartnerProfile::create([
            'user_id' => $partner->id,
            'business_name' => 'Unverified Co',
            'is_verified' => false,
        ]);

        $this->getJson('/api/v1/partners')->assertJsonCount(0, 'data');

        PartnerProfile::where('user_id', $partner->id)->update(['is_verified' => true]);

        $this->getJson('/api/v1/partners')->assertJsonCount(1, 'data');
    }
}
