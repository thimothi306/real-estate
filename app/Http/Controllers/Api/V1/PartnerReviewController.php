<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PartnerReview;
use App\Models\ServiceRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartnerReviewController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, ServiceRequest $serviceRequest)
    {
        $user = $request->user();
        abort_unless($user->id === $serviceRequest->user_id, 403);
        abort_unless($serviceRequest->status === ServiceRequest::STATUS_COMPLETED, 422, 'Only a completed request can be reviewed.');

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = DB::transaction(function () use ($data, $serviceRequest, $user) {
            $review = PartnerReview::create($data + [
                'service_request_id' => $serviceRequest->id,
                'partner_id' => $serviceRequest->assigned_partner_id,
                'reviewer_id' => $user->id,
            ]);

            $partnerProfile = $serviceRequest->assignedPartner->partnerProfile;

            if ($partnerProfile) {
                $newCount = $partnerProfile->rating_count + 1;
                $newAverage = (($partnerProfile->rating_avg ?? 0) * $partnerProfile->rating_count + $data['rating']) / $newCount;

                $partnerProfile->update(['rating_avg' => round($newAverage, 2), 'rating_count' => $newCount]);
            }

            return $review;
        });

        return $this->success($review, 'Review submitted.', 201);
    }
}
