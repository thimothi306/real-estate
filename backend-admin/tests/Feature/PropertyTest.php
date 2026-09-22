<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_buyer_posting_their_first_property_is_promoted_to_owner(): void
    {
        // Self-service listing: posting a property is what makes a plain
        // buyer/tenant an owner (StorePropertyRequest::authorize) — mirrors
        // the same self-promotion used for Kavuri Connect providers. The
        // listing still starts as a draft and needs admin approval before
        // it's publicly visible, so this doesn't bypass moderation.
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        $response = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/properties', [
            'title' => 'My First Listing',
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'price' => 1000000,
            'city' => 'Hyderabad',
            'state' => 'Telangana',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.status', 'draft');

        $this->assertSame(User::ROLE_OWNER, $buyer->fresh()->role);
        $this->assertDatabaseHas('properties', ['title' => 'My First Listing', 'owner_id' => $buyer->id]);
    }

    public function test_a_pending_partner_role_still_cannot_create_a_property(): void
    {
        // Only the *unassigned* base roles (buyer/tenant) get auto-promoted.
        // A role that's already a specific kind of partner (e.g. a legal
        // consultant) shouldn't silently become a property owner too.
        $consultant = User::factory()->create(['role' => User::ROLE_LEGAL_CONSULTANT]);

        $response = $this->actingAs($consultant, 'sanctum')->postJson('/api/v1/properties', [
            'title' => 'Should Fail',
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'price' => 1000000,
            'city' => 'Hyderabad',
            'state' => 'Telangana',
        ]);

        $response->assertStatus(403);
        $this->assertSame(User::ROLE_LEGAL_CONSULTANT, $consultant->fresh()->role);
    }

    public function test_an_owner_can_create_a_draft_property(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);

        $response = $this->actingAs($owner, 'sanctum')->postJson('/api/v1/properties', [
            'title' => 'Nice Villa',
            'property_type' => 'villa',
            'listing_type' => 'sale',
            'price' => 15000000,
            'city' => 'Hyderabad',
            'state' => 'Telangana',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('properties', [
            'title' => 'Nice Villa',
            'owner_id' => $owner->id,
            'status' => 'draft',
        ]);

        // Creating a property should be recorded on its timeline.
        $this->assertDatabaseHas('property_history', ['event_type' => 'created']);
    }

    public function test_the_full_moderation_lifecycle_draft_to_published(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $admin = User::factory()->admin()->create();
        $property = Property::factory()->for($owner, 'owner')->create(['status' => Property::STATUS_DRAFT]);

        // A published-only search shouldn't see the draft yet.
        $this->getJson('/api/v1/properties')->assertJsonMissing(['id' => $property->id]);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/submit-for-review")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'pending_review');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/properties/{$property->id}/approve")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('properties', ['id' => $property->id, 'status' => 'published']);

        // Now it should be publicly visible.
        $this->getJson('/api/v1/properties')->assertJsonFragment(['id' => $property->id]);
    }

    public function test_a_non_admin_cannot_approve_a_property(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $property = Property::factory()->for($owner, 'owner')->pendingReview()->create();

        $response = $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/admin/properties/{$property->id}/approve");

        $response->assertStatus(403);
    }

    public function test_price_change_is_recorded_on_the_timeline(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $property = Property::factory()->for($owner, 'owner')->create(['price' => 1000000]);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/v1/properties/{$property->id}", ['price' => 1200000])
            ->assertStatus(200);

        $this->assertDatabaseHas('property_history', [
            'property_id' => $property->id,
            'event_type' => 'price_changed',
        ]);

        $timeline = $this->getJson("/api/v1/properties/{$property->id}/timeline")->json('data');
        $this->assertContains('price_changed', array_column($timeline, 'event_type'));
    }

    public function test_search_filters_by_city_and_property_type(): void
    {
        Property::factory()->published()->create(['city' => 'Hyderabad', 'property_type' => 'villa']);
        Property::factory()->published()->create(['city' => 'Bangalore', 'property_type' => 'apartment']);

        $response = $this->getJson('/api/v1/properties?city=Hyderabad&property_type=villa');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_a_property_owner_can_delete_their_own_draft(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $property = Property::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('properties', ['id' => $property->id]);
    }

    public function test_another_owner_cannot_delete_someone_elses_property(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $otherOwner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $property = Property::factory()->for($owner, 'owner')->create();

        $this->actingAs($otherOwner, 'sanctum')
            ->deleteJson("/api/v1/properties/{$property->id}")
            ->assertStatus(403);
    }

    public function test_favoriting_a_property_reflects_in_the_detail_response(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $property = Property::factory()->published()->create();

        $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/favorite")
            ->assertStatus(201);

        $this->actingAs($buyer, 'sanctum')
            ->getJson("/api/v1/properties/{$property->slug}")
            ->assertJsonPath('data.is_favorited', true);
    }
}
