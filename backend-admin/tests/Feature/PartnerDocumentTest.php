<?php

namespace Tests\Feature;

use App\Models\PartnerDocument;
use App\Models\PartnerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PartnerDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function providerWithProfile(): User
    {
        $user = User::factory()->create(['role' => User::ROLE_SERVICE_PROVIDER]);
        PartnerProfile::create(['user_id' => $user->id, 'profession' => 'Plumber', 'business_name' => 'Test Plumbing']);

        return $user;
    }

    public function test_a_provider_can_upload_a_document_and_it_starts_pending(): void
    {
        Storage::fake('local');
        $provider = $this->providerWithProfile();

        $response = $this->actingAs($provider, 'sanctum')->postJson('/api/v1/my/partner-profile/documents', [
            'file' => UploadedFile::fake()->create('id-card.pdf', 100, 'application/pdf'),
            'type' => 'id_proof',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.type', 'id_proof');

        // The document resource must never leak a downloadable file path/URL.
        $response->assertJsonMissingPath('data.url');
        $response->assertJsonMissingPath('data.path');

        $this->assertDatabaseHas('partner_documents', ['status' => 'pending']);
    }

    public function test_uploading_without_a_profile_is_rejected(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        $response = $this->actingAs($buyer, 'sanctum')->postJson('/api/v1/my/partner-profile/documents', [
            'file' => UploadedFile::fake()->create('id-card.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(422);
    }

    public function test_a_non_admin_cannot_review_or_download_documents(): void
    {
        Storage::fake('local');
        $provider = $this->providerWithProfile();
        $document = PartnerDocument::create([
            'partner_profile_id' => $provider->partnerProfile->id,
            'type' => 'id_proof',
            'disk' => 'local',
            'path' => 'partner-documents/1/fake.pdf',
            'status' => 'pending',
        ]);

        $this->actingAs($provider, 'sanctum')
            ->postJson("/api/v1/admin/partners/documents/{$document->id}/review", ['status' => 'approved'])
            ->assertStatus(403);

        $this->actingAs($provider, 'sanctum')
            ->getJson("/api/v1/admin/partners/documents/{$document->id}/download")
            ->assertStatus(403);
    }

    public function test_an_admin_can_approve_a_document(): void
    {
        Storage::fake('local');
        $provider = $this->providerWithProfile();
        $document = PartnerDocument::create([
            'partner_profile_id' => $provider->partnerProfile->id,
            'type' => 'id_proof',
            'disk' => 'local',
            'path' => 'partner-documents/1/fake.pdf',
            'status' => 'pending',
        ]);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/partners/documents/{$document->id}/review", ['status' => 'approved']);

        $response->assertStatus(200)->assertJsonPath('data.status', 'approved');
        $this->assertDatabaseHas('partner_documents', ['id' => $document->id, 'status' => 'approved', 'reviewed_by' => $admin->id]);
    }

    public function test_an_admin_can_reject_a_document_with_a_reason(): void
    {
        Storage::fake('local');
        $provider = $this->providerWithProfile();
        $document = PartnerDocument::create([
            'partner_profile_id' => $provider->partnerProfile->id,
            'type' => 'id_proof',
            'disk' => 'local',
            'path' => 'partner-documents/1/fake.pdf',
            'status' => 'pending',
        ]);
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson(
            "/api/v1/admin/partners/documents/{$document->id}/review",
            ['status' => 'rejected', 'rejection_reason' => 'Blurry photo']
        );

        $response->assertStatus(200)->assertJsonPath('data.status', 'rejected');
        $this->assertDatabaseHas('partner_documents', ['id' => $document->id, 'status' => 'rejected', 'rejection_reason' => 'Blurry photo']);
    }
}
