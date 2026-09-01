<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    protected function buyerAndListing(): array
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $property = Property::factory()->create([
            'owner_id' => $owner->id,
            'status' => Property::STATUS_PUBLISHED,
        ]);

        return [$buyer, $owner, $property];
    }

    public function test_a_buyer_can_start_a_conversation_on_a_listing(): void
    {
        [$buyer, $owner, $property] = $this->buyerAndListing();

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/conversation");

        $response->assertCreated()
            ->assertJsonPath('data.counterpart.name', $owner->name)
            ->assertJsonPath('data.property.id', $property->id);

        $this->assertDatabaseHas('conversations', [
            'property_id' => $property->id,
            'buyer_id' => $buyer->id,
            'owner_id' => $owner->id,
        ]);
    }

    public function test_starting_a_conversation_twice_reuses_the_same_thread(): void
    {
        [$buyer, , $property] = $this->buyerAndListing();

        $first = $this->actingAs($buyer, 'sanctum')->postJson("/api/v1/properties/{$property->id}/conversation");
        $second = $this->actingAs($buyer, 'sanctum')->postJson("/api/v1/properties/{$property->id}/conversation");

        $first->assertCreated();
        $second->assertOk(); // reused, not created again
        $this->assertSame($first->json('data.id'), $second->json('data.id'));
        $this->assertSame(1, Conversation::count());
    }

    public function test_an_owner_cannot_start_a_conversation_on_their_own_listing(): void
    {
        [, $owner, $property] = $this->buyerAndListing();

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/properties/{$property->id}/conversation")
            ->assertStatus(422);
    }

    public function test_an_outsider_cannot_read_or_post_to_someone_elses_conversation(): void
    {
        [$buyer, $owner, $property] = $this->buyerAndListing();
        $outsider = User::factory()->create(['role' => User::ROLE_BUYER]);

        $conversation = Conversation::create([
            'property_id' => $property->id,
            'buyer_id' => $buyer->id,
            'owner_id' => $owner->id,
            'last_message_at' => now(),
        ]);

        $this->actingAs($outsider, 'sanctum')
            ->getJson("/api/v1/conversations/{$conversation->id}")
            ->assertForbidden();

        $this->actingAs($outsider, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['body' => 'let me in'])
            ->assertForbidden();
    }

    public function test_opening_a_thread_marks_the_other_sides_messages_as_read(): void
    {
        [$buyer, $owner, $property] = $this->buyerAndListing();

        $conversation = Conversation::create([
            'property_id' => $property->id,
            'buyer_id' => $buyer->id,
            'owner_id' => $owner->id,
            'last_message_at' => now(),
        ]);

        // Owner writes; buyer has not read it yet.
        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['body' => 'Yes, it is available.'])
            ->assertCreated();

        $this->assertSame(1, $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/conversations/unread-count')->json('data.unread_count'));

        $this->actingAs($buyer, 'sanctum')->getJson("/api/v1/conversations/{$conversation->id}")->assertOk();

        $this->assertSame(0, $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/conversations/unread-count')->json('data.unread_count'));
    }

    public function test_a_sender_does_not_see_their_own_message_as_unread(): void
    {
        [$buyer, $owner, $property] = $this->buyerAndListing();

        $conversation = Conversation::create([
            'property_id' => $property->id,
            'buyer_id' => $buyer->id,
            'owner_id' => $owner->id,
            'last_message_at' => now(),
        ]);

        $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", ['body' => 'Hello?']);

        $this->assertSame(0, $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/conversations/unread-count')->json('data.unread_count'));
    }
}
