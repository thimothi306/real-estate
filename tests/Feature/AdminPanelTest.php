<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Lead;
use App\Models\PartnerProfile;
use App\Models\Payment;
use App\Models\Property;
use App\Models\PropertyReport;
use App\Models\ServiceCategory;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN, 'status' => 'active']);
    }

    /**
     * Every admin screen must render for a signed-in admin, with at least
     * one real row behind every eager-loaded relation.
     *
     * This matters specifically because Eloquent skips executing a relation
     * query entirely when the parent result set is empty — so a wrong
     * relation name (e.g. 'user' instead of 'requester' on ServiceRequest)
     * throws nothing and the page renders fine, right up until the first
     * real row exists. Seed one row per table so that class of bug can't
     * hide behind an empty list again.
     */
    public function test_all_admin_pages_render(): void
    {
        $admin = $this->admin();

        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);
        $partnerUser = User::factory()->create(['role' => User::ROLE_AGENT]);

        $property = Property::factory()->create(['owner_id' => $owner->id, 'status' => Property::STATUS_PUBLISHED]);
        Property::factory()->create(['owner_id' => $owner->id, 'status' => Property::STATUS_PENDING_REVIEW]);

        Lead::create(['property_id' => $property->id, 'buyer_id' => $buyer->id, 'type' => 'message', 'status' => 'new']);
        Visit::create([
            'property_id' => $property->id,
            'buyer_id' => $buyer->id,
            'scheduled_at' => now()->addDay(),
            'status' => 'pending',
        ]);

        $category = ServiceCategory::create([
            'name' => 'Interior Design', 'slug' => 'interior-design', 'partner_roles' => ['interior_designer'],
        ]);
        ServiceRequest::create([
            'user_id' => $buyer->id,
            'service_category_id' => $category->id,
            'title' => 'Full interior design for a 3 BHK',
            'status' => 'open',
        ]);

        PartnerProfile::create(['user_id' => $partnerUser->id, 'business_name' => 'Test Partner Co.', 'is_verified' => false]);

        Payment::create([
            'user_id' => $owner->id, 'purpose' => 'featured_listing', 'reference_id' => $property->id,
            'amount' => 499.00, 'status' => 'completed',
        ]);

        $report = PropertyReport::create([
            'property_id' => $property->id, 'reporter_id' => $buyer->id,
            'reason' => 'incorrect_info', 'status' => 'pending',
        ]);

        // A second listing for the same owner, so the report detail page's
        // "other listings by this owner" panel has a real row to render too.
        Property::factory()->create(['owner_id' => $owner->id, 'status' => Property::STATUS_PUBLISHED]);

        $routes = [
            'admin.dashboard', 'admin.properties.index', 'admin.users.index', 'admin.partners.index',
            'admin.inquiries.index', 'admin.visits.index', 'admin.payments.index',
            'admin.verifications.index', 'admin.services.index', 'admin.reports.index',
            'admin.duplicates.index', 'admin.banners.index', 'admin.banners.create',
            'admin.analytics.index', 'admin.logs.index',
        ];

        foreach ($routes as $name) {
            $this->actingAs($admin)
                ->get(route($name))
                ->assertOk("Route [{$name}] did not render.");
        }

        $this->actingAs($admin)
            ->get(route('admin.reports.show', $report))
            ->assertOk('Route [admin.reports.show] did not render.')
            ->assertSee($property->title)
            ->assertSee($owner->name);
    }

    public function test_a_non_admin_cannot_reach_the_panel(): void
    {
        $buyer = User::factory()->create(['role' => User::ROLE_BUYER]);

        $this->actingAs($buyer)->get(route('admin.dashboard'))->assertRedirect();
        $this->get(route('admin.dashboard'))->assertRedirect();
    }

    public function test_admin_can_create_a_banner_that_targets_a_surface(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin())
            ->post(route('admin.banners.store'), [
                'title' => 'Verified Properties',
                'subtitle' => 'You can trust',
                'placement' => 'home_hero',
                'audience' => 'mobile',
                'is_active' => 1,
                // create() rather than image(): this environment has no GD
                // extension, and image() needs it to synthesise a real bitmap.
                'image' => UploadedFile::fake()->create('promo.jpg', 120, 'image/jpeg'),
            ])
            ->assertRedirect(route('admin.banners.index'));

        $banner = Banner::firstWhere('title', 'Verified Properties');

        $this->assertNotNull($banner);
        $this->assertSame('mobile', $banner->audience);
        Storage::disk('public')->assertExists($banner->image_path);
    }

    public function test_banner_live_scope_respects_schedule_and_audience(): void
    {
        Banner::create(['title' => 'Live now', 'placement' => 'home_strip', 'audience' => 'all', 'is_active' => true]);
        Banner::create(['title' => 'Paused', 'placement' => 'home_strip', 'audience' => 'all', 'is_active' => false]);
        Banner::create(['title' => 'Expired', 'placement' => 'home_strip', 'audience' => 'all', 'is_active' => true, 'ends_at' => now()->subDay()]);
        Banner::create(['title' => 'Not started', 'placement' => 'home_strip', 'audience' => 'all', 'is_active' => true, 'starts_at' => now()->addWeek()]);
        Banner::create(['title' => 'Web only', 'placement' => 'home_strip', 'audience' => 'web', 'is_active' => true]);

        $mobile = Banner::live('mobile')->pluck('title')->all();

        $this->assertSame(['Live now'], $mobile);
    }

    public function test_admin_can_update_an_inquiry_status(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => User::ROLE_OWNER]);
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $lead = Lead::create(['property_id' => $property->id, 'buyer_id' => $admin->id, 'type' => 'call', 'status' => 'new']);

        $this->actingAs($admin)
            ->post(route('admin.inquiries.update', $lead), ['status' => 'contacted'])
            ->assertRedirect();

        $this->assertSame('contacted', $lead->fresh()->status);
    }
}
