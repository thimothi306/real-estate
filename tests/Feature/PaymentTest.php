<?php

namespace Tests\Feature;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscribing_without_gateway_keys_fails_gracefully_and_records_the_attempt(): void
    {
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $plan = SubscriptionPlan::create([
            'name' => 'Owner Premium', 'slug' => 'owner-premium', 'target_role' => 'owner',
            'price' => 999, 'duration_days' => 30, 'features' => [],
        ]);

        $response = $this->actingAs($owner, 'sanctum')->postJson("/api/v1/subscription-plans/{$plan->id}/subscribe");

        $response->assertStatus(503);
        $this->assertDatabaseHas('payments', ['user_id' => $owner->id, 'status' => 'failed', 'purpose' => 'subscription']);
    }

    public function test_a_user_cannot_subscribe_to_a_plan_meant_for_a_different_role(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $plan = SubscriptionPlan::create([
            'name' => 'Owner Premium', 'slug' => 'owner-premium', 'target_role' => 'owner',
            'price' => 999, 'duration_days' => 30, 'features' => [],
        ]);

        $this->actingAs($buyer, 'sanctum')
            ->postJson("/api/v1/subscription-plans/{$plan->id}/subscribe")
            ->assertStatus(403);
    }

    public function test_razorpay_signature_verification_rejects_a_tampered_signature(): void
    {
        $service = new \App\Services\RazorpayService();
        $reflection = new \ReflectionProperty($service, 'keySecret');
        $reflection->setAccessible(true);
        $reflection->setValue($service, 'test_secret');

        $validSignature = hash_hmac('sha256', 'order_1|pay_1', 'test_secret');

        $this->assertTrue($service->verifySignature('order_1', 'pay_1', $validSignature));
        $this->assertFalse($service->verifySignature('order_1', 'pay_1', 'tampered'));
    }
}
