<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LoanOffer;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class LoanOfferController extends Controller
{
    use ApiResponse;

    /** Public — the Home Loan screen is browsable before sign-in. */
    public function index()
    {
        $offers = LoanOffer::active()->orderBy('sort_order')->orderBy('interest_rate_from')->get();

        return $this->success($offers->map(fn ($offer) => [
            'id' => $offer->id,
            'lender_name' => $offer->lender_name,
            'logo_url' => $offer->logo_url,
            'interest_rate_from' => (float) $offer->interest_rate_from,
            'max_amount' => (float) $offer->max_amount,
            'max_tenure_years' => $offer->max_tenure_years,
            'processing_fee_percent' => $offer->processing_fee_percent !== null ? (float) $offer->processing_fee_percent : null,
            'highlight' => $offer->highlight,
            'apply_url' => $offer->apply_url,
        ]));
    }

    /**
     * EMI on the reducing-balance formula banks actually use:
     * EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate, n = months.
     * Server-side so the app and any future web surface agree to the rupee.
     */
    public function calculateEmi(Request $request)
    {
        $data = $request->validate([
            'principal' => ['required', 'numeric', 'min:1000', 'max:1000000000'],
            'annual_rate' => ['required', 'numeric', 'min:0.1', 'max:36'],
            'tenure_years' => ['required', 'integer', 'min:1', 'max:40'],
        ]);

        $principal = (float) $data['principal'];
        $monthlyRate = ((float) $data['annual_rate']) / 12 / 100;
        $months = (int) $data['tenure_years'] * 12;

        $growth = pow(1 + $monthlyRate, $months);
        $emi = $principal * $monthlyRate * $growth / ($growth - 1);
        $totalPayable = $emi * $months;

        return $this->success([
            'emi' => round($emi, 2),
            'total_payable' => round($totalPayable, 2),
            'total_interest' => round($totalPayable - $principal, 2),
            'principal' => round($principal, 2),
            'months' => $months,
        ]);
    }
}
