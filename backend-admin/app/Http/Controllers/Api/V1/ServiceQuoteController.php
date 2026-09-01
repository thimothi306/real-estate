<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceQuoteResource;
use App\Http\Resources\ServiceRequestResource;
use App\Models\PartnerProfile;
use App\Models\ServiceQuote;
use App\Models\ServiceRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceQuoteController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, ServiceRequest $serviceRequest)
    {
        $user = $request->user();
        abort_unless($user->isPartner(), 403, 'Only partner accounts can submit quotes.');
        // 'open' (no quotes yet) and 'quoted' (has quotes, still comparing) both accept
        // more quotes — quoting is only closed once the buyer has accepted one.
        abort_unless(
            in_array($serviceRequest->status, [ServiceRequest::STATUS_OPEN, ServiceRequest::STATUS_QUOTED], true),
            422,
            'This request is no longer open for quotes.'
        );

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'message' => ['nullable', 'string', 'max:1000'],
            'valid_until' => ['nullable', 'date', 'after:today'],
        ]);

        $quote = ServiceQuote::updateOrCreate(
            ['service_request_id' => $serviceRequest->id, 'partner_id' => $user->id],
            $data + ['status' => 'pending']
        );

        if ($serviceRequest->status === ServiceRequest::STATUS_OPEN) {
            $serviceRequest->update(['status' => ServiceRequest::STATUS_QUOTED]);
        }

        return $this->success(new ServiceQuoteResource($quote), 'Quote submitted.', 201);
    }

    public function myQuotes(Request $request)
    {
        $quotes = $request->user()->serviceQuotes()
            ->with('request:id,title,status,service_category_id,property_id')
            ->latest()
            ->paginate(20);

        return $this->success(
            ServiceQuoteResource::collection($quotes->items()),
            'OK',
            200,
            ['total' => $quotes->total()]
        );
    }

    public function withdraw(Request $request, ServiceQuote $quote)
    {
        abort_unless($request->user()->id === $quote->partner_id, 403);
        abort_unless($quote->status === 'pending', 422, 'Only a pending quote can be withdrawn.');

        $quote->update(['status' => 'withdrawn']);

        return $this->success(new ServiceQuoteResource($quote), 'Quote withdrawn.');
    }

    public function accept(Request $request, ServiceQuote $quote)
    {
        $serviceRequest = $quote->request;

        abort_unless($request->user()->id === $serviceRequest->user_id, 403);
        abort_unless($quote->status === 'pending', 422, 'That quote is no longer available.');

        DB::transaction(function () use ($quote, $serviceRequest) {
            $quote->update(['status' => 'accepted']);

            // Every other quote on this request is now moot.
            $serviceRequest->quotes()
                ->where('id', '!=', $quote->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            $serviceRequest->update([
                'status' => ServiceRequest::STATUS_ACCEPTED,
                'accepted_quote_id' => $quote->id,
                'assigned_partner_id' => $quote->partner_id,
            ]);
        });

        return $this->success(
            new ServiceRequestResource($serviceRequest->fresh(['acceptedQuote', 'assignedPartner:id,name,phone,role'])),
            'Quote accepted.'
        );
    }

    /** Partner-side status progression: accepted -> in_progress -> completed. */
    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        abort_unless($request->user()->id === $serviceRequest->assigned_partner_id, 403);

        $data = $request->validate([
            'status' => ['required', 'in:in_progress,completed'],
        ]);

        $allowedFrom = [
            'in_progress' => ServiceRequest::STATUS_ACCEPTED,
            'completed' => ServiceRequest::STATUS_IN_PROGRESS,
        ];

        abort_unless($serviceRequest->status === $allowedFrom[$data['status']], 422, 'Invalid status transition.');

        $serviceRequest->update([
            'status' => $data['status'],
            'completed_at' => $data['status'] === 'completed' ? now() : null,
        ]);

        if ($data['status'] === 'completed') {
            // Query directly rather than through $serviceRequest->assignedPartner->partnerProfile —
            // touching that relation chain lazy-loads it onto the model, which then leaks into
            // the JSON response below since Eloquent serializes every loaded relation.
            PartnerProfile::where('user_id', $serviceRequest->assigned_partner_id)
                ->increment('total_completed');
        }

        return $this->success(new ServiceRequestResource($serviceRequest), 'Status updated.');
    }
}
