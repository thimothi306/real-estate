<?php

namespace Database\Seeders;

use App\Models\LoanOffer;
use Illuminate\Database\Seeder;

class LoanOfferSeeder extends Seeder
{
    public function run(): void
    {
        $offers = [
            ['lender_name' => 'SBI Home Loans', 'interest_rate_from' => 8.35, 'max_amount' => 20000000, 'max_tenure_years' => 30, 'processing_fee_percent' => 0.35, 'highlight' => 'Lowest interest rates', 'sort_order' => 1],
            ['lender_name' => 'HDFC Home Loans', 'interest_rate_from' => 8.40, 'max_amount' => 20000000, 'max_tenure_years' => 30, 'processing_fee_percent' => 0.50, 'highlight' => 'Quick approval in 48 hours', 'sort_order' => 2],
            ['lender_name' => 'ICICI Home Loans', 'interest_rate_from' => 8.50, 'max_amount' => 20000000, 'max_tenure_years' => 30, 'processing_fee_percent' => 0.50, 'highlight' => 'Minimal documentation', 'sort_order' => 3],
            ['lender_name' => 'Axis Bank Home Loan', 'interest_rate_from' => 8.60, 'max_amount' => 15000000, 'max_tenure_years' => 30, 'processing_fee_percent' => 0.50, 'highlight' => 'Balance transfer available', 'sort_order' => 4],
            ['lender_name' => 'LIC Housing Finance', 'interest_rate_from' => 8.45, 'max_amount' => 15000000, 'max_tenure_years' => 30, 'processing_fee_percent' => 0.25, 'highlight' => 'Low processing fee', 'sort_order' => 5],
            ['lender_name' => 'Bajaj Housing Finance', 'interest_rate_from' => 8.70, 'max_amount' => 50000000, 'max_tenure_years' => 32, 'processing_fee_percent' => 0.60, 'highlight' => 'High-value loans up to ₹5 Cr', 'sort_order' => 6],
        ];

        foreach ($offers as $offer) {
            LoanOffer::updateOrCreate(['lender_name' => $offer['lender_name']], $offer + ['is_active' => true]);
        }

        $this->command?->info('Seeded '.count($offers).' loan offers.');
    }
}
