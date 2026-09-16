<?php

namespace Tests\Feature;

use App\Models\Otp;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_and_receives_a_pending_status(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Buyer',
            'email' => 'buyer@example.com',
            'phone' => '+919876543210',
            'password' => 'Passw0rd!123',
            'password_confirmation' => 'Passw0rd!123',
            'role' => 'buyer',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.phone_verified', false);

        $this->assertDatabaseHas('users', ['email' => 'buyer@example.com', 'status' => 'pending']);
        $this->assertDatabaseHas('otps', ['phone' => '+919876543210', 'purpose' => 'registration']);
    }

    public function test_registration_rejects_a_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Buyer',
            'email' => 'buyer2@example.com',
            'phone' => '+919876543211',
            'password' => 'weak',
            'password_confirmation' => 'weak',
            'role' => 'buyer',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_registration_rejects_duplicate_email_or_phone(): void
    {
        User::factory()->create(['email' => 'taken@example.com', 'phone' => '+919000000001']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone',
            'email' => 'taken@example.com',
            'phone' => '+919000000001',
            'password' => 'Passw0rd!123',
            'password_confirmation' => 'Passw0rd!123',
            'role' => 'buyer',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email', 'phone']);
    }

    public function test_otp_verification_activates_the_account_and_issues_a_token(): void
    {
        $user = User::factory()->create(['status' => 'pending', 'phone_verified_at' => null, 'phone' => '+919876543212']);

        $otp = Otp::create([
            'phone' => $user->phone,
            'code_hash' => Hash::make('123456'),
            'purpose' => 'registration',
            'expires_at' => now()->addMinutes(5),
        ]);

        $response = $this->postJson('/api/v1/auth/otp/verify-registration', [
            'phone' => $user->phone,
            'code' => '123456',
            'purpose' => 'registration',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'active']);
        $this->assertNotNull($user->fresh()->phone_verified_at);
    }

    public function test_wrong_otp_is_rejected_and_does_not_verify_the_phone(): void
    {
        $user = User::factory()->create(['status' => 'pending', 'phone_verified_at' => null, 'phone' => '+919876543213']);

        Otp::create([
            'phone' => $user->phone,
            'code_hash' => Hash::make('123456'),
            'purpose' => 'registration',
            'expires_at' => now()->addMinutes(5),
        ]);

        $response = $this->postJson('/api/v1/auth/otp/verify-registration', [
            'phone' => $user->phone,
            'code' => '999999',
            'purpose' => 'registration',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'pending']);
    }

    public function test_otp_bypass_generates_the_fixed_code_instead_of_a_random_one(): void
    {
        // No real SMS gateway is wired up yet (see OtpService::dispatch) —
        // this flag stands in for it during that gap. Must stay off
        // (OTP_BYPASS_ENABLED=false) once a real provider is integrated.
        Config::set('otp.bypass_enabled', true);
        Config::set('otp.bypass_code', '654321');

        app(OtpService::class)->generateAndSend('+919876543299', 'registration');

        $otp = Otp::where('phone', '+919876543299')->latest('id')->first();
        $this->assertTrue(Hash::check('654321', $otp->code_hash));

        $response = $this->postJson('/api/v1/auth/otp/send', [
            'phone' => '+919876543298',
            'purpose' => 'registration',
        ]);
        $response->assertStatus(200);

        $sent = Otp::where('phone', '+919876543298')->latest('id')->first();
        $this->assertTrue(Hash::check('654321', $sent->code_hash));
    }

    public function test_otp_bypass_off_generates_a_random_code(): void
    {
        // .env.example ships with this off; a local .env may have it on
        // while no real SMS gateway is wired up, so set it explicitly
        // rather than assuming the ambient config value.
        Config::set('otp.bypass_enabled', false);

        app(OtpService::class)->generateAndSend('+919876543297', 'registration');

        $otp = Otp::where('phone', '+919876543297')->latest('id')->first();
        $this->assertFalse(Hash::check('123456', $otp->code_hash));
    }

    public function test_a_user_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create(['email' => 'login@example.com', 'password' => Hash::make('Passw0rd!123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'login@example.com',
            'password' => 'Passw0rd!123',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'login2@example.com', 'password' => Hash::make('Passw0rd!123')]);

        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'login2@example.com',
            'password' => 'WrongPassword!1',
        ]);

        $response->assertStatus(401);
    }

    public function test_account_locks_after_too_many_failed_login_attempts(): void
    {
        $user = User::factory()->create(['email' => 'lockout@example.com', 'password' => Hash::make('Passw0rd!123')]);

        // security.login_max_attempts defaults to 5. The 5th wrong attempt is the one that
        // *trips* the lock server-side, but it still reports 401 for that same request
        // (the lock only takes effect starting with the *next* request) — so 5 attempts
        // here, all 401, then the 6th is the first to see 423.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'identifier' => 'lockout@example.com',
                'password' => 'WrongPassword!1',
            ])->assertStatus(401);
        }

        // The 5 attempts above already used most of the "login" rate limiter's 6/minute
        // budget (keyed by ip + identifier, cache-backed). Flush it so this test is
        // exercising the *account lockout* behavior specifically, not colliding with
        // the separate, already-covered-elsewhere rate-limit behavior.
        Cache::flush();

        $lockedResponse = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'lockout@example.com',
            'password' => 'WrongPassword!1',
        ]);

        $lockedResponse->assertStatus(423);

        Cache::flush();

        // Even the CORRECT password should now be rejected while locked.
        $stillLocked = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'lockout@example.com',
            'password' => 'Passw0rd!123',
        ]);

        $stillLocked->assertStatus(423);
    }

    public function test_a_suspended_users_login_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'suspended@example.com',
            'password' => Hash::make('Passw0rd!123'),
            'status' => 'suspended',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'suspended@example.com',
            'password' => 'Passw0rd!123',
        ]);

        $response->assertStatus(401);
    }

    public function test_me_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_me_endpoint_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200)->assertJsonPath('data.id', $user->id);
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);

        // Laravel's auth guards cache the resolved user for the lifetime of the
        // application container, which testing reuses across requests within one
        // method — forget it so the next call re-resolves from the (now-deleted) token,
        // matching what actually happens across separate real HTTP requests.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }
}
