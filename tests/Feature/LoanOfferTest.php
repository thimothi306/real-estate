<?php

namespace Tests\Feature;

use App\Models\LoanOffer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoanOfferTest extends TestCase
{
    use RefreshDatabase;

    public function test_loan_offers_are_public_and_hide_inactive_lenders(): void
    {
        LoanOffer::create(['lender_name' => 'Active Bank', 'interest_rate_from' => 8.35, 'max_amount' => 10000000, 'is_active' => true]);
        LoanOffer::create(['lender_name' => 'Retired Bank', 'interest_rate_from' => 9.10, 'max_amount' => 5000000, 'is_active' => false]);

        $response = $this->getJson('/api/v1/loan-offers')->assertOk();

        $names = array_column($response->json('data'), 'lender_name');
        $this->assertContains('Active Bank', $names);
        $this->assertNotContains('Retired Bank', $names);
    }

    public function test_rates_serialize_as_numbers_not_strings(): void
    {
        LoanOffer::create(['lender_name' => 'Numeric Bank', 'interest_rate_from' => 8.35, 'max_amount' => 10000000, 'is_active' => true]);

        // Laravel's decimal cast returns strings — the resource must cast back
        // to float or the client's `number` type is silently wrong.
        $rate = $this->getJson('/api/v1/loan-offers')->json('data.0.interest_rate_from');
        $this->assertIsFloat($rate);
    }

    public function test_emi_matches_the_reducing_balance_formula(): void
    {
        // ₹60,00,000 at 8.5% for 20 years → ₹52,069.39/month (standard EMI formula).
        $response = $this->postJson('/api/v1/loan-offers/emi', [
            'principal' => 6000000,
            'annual_rate' => 8.5,
            'tenure_years' => 20,
        ])->assertOk();

        $this->assertEqualsWithDelta(52069.39, $response->json('data.emi'), 0.5);
        $this->assertSame(240, $response->json('data.months'));
        $this->assertEqualsWithDelta(
            $response->json('data.total_payable') - 6000000,
            $response->json('data.total_interest'),
            0.5
        );
    }

    public function test_emi_rejects_out_of_range_input(): void
    {
        $this->postJson('/api/v1/loan-offers/emi', [
            'principal' => 100,          // below the ₹1,000 floor
            'annual_rate' => 8.5,
            'tenure_years' => 20,
        ])->assertStatus(422);

        $this->postJson('/api/v1/loan-offers/emi', [
            'principal' => 6000000,
            'annual_rate' => 8.5,
            'tenure_years' => 99,        // beyond the 40-year cap
        ])->assertStatus(422);
    }
}
