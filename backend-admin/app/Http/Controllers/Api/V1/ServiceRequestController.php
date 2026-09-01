<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequestRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Models\ServiceCategory;
use App\Models\ServiceRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(StoreServiceRequestRequest $request)
    {
        $data = $request->validated();

        $serviceRequest = ServiceRequest::create($data + [
            'user_id' => $request->user()->id,
            'status' => ServiceRequest::STATUS_OPEN,
        ]);

        return $this->success(
            new ServiceRequestResource($serviceRequest->load('category:id,name,slug')),
            'Request posted. Partners will start quoting shortly.',
            201
        );
    }

    public function myRequests(Request $request)
    {
        $requests = ServiceRequest::where('user_id', $request->user()->id)
            ->with(['category:id,name,slug', 'property:id,title,slug', 'assignedPartner:id,name,phone'])
            ->withCount('quotes')
            ->latest()
            ->paginate(20);

        return $this->success(
            ServiceRequestResource::collection($requests->items()),
            'OK',
            200,
            ['total' => $requests->total()]
        );
    }

    public function show(Request $request, ServiceRequest $serviceRequest)
    {
        $user = $request->user();
        abort_unless(
            $user->id === $serviceRequest->user_id
                || $user->id === $serviceRequest->assigned_partner_id
                || $user->isAdmin()
                || ($user->isPartner() && $serviceRequest->status === ServiceRequest::STATUS_OPEN),
            403
        );

        $serviceRequest->load([
            'category:id,name,slug',
            'property:id,title,slug,city',
            'requester:id,name,phone',
            'assignedPartner:id,name,phone',
            'quotes' => fn ($q) => $q->with('partner:id,name,phone')->orderBy('amount'),
        ]);

        return $this->success(new ServiceRequestResource($serviceRequest));
    }

    public function cancel(Request $request, ServiceRequest $serviceRequest)
    {
        abort_unless($request->user()->id === $serviceRequest->user_id, 403);
        abort_unless(
            in_array($serviceRequest->status, [ServiceRequest::STATUS_OPEN, ServiceRequest::STATUS_QUOTED]),
            422,
            'Only an open or quoted request can be cancelled.'
        );

        $serviceRequest->update(['status' => ServiceRequest::STATUS_CANCELLED]);

        return $this->success(new ServiceRequestResource($serviceRequest), 'Request cancelled.');
    }

    /** The queue a partner sees: open requests in the categories they serve. */
    public function queue(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isPartner(), 403, 'Only partner accounts have a request queue.');

        $categoryIds = ServiceCategory::query()
            ->whereJsonContains('partner_roles', $user->role)
            ->pluck('id');

        $requests = ServiceRequest::whereIn('service_category_id', $categoryIds)
            ->where('status', ServiceRequest::STATUS_OPEN)
            ->with(['category:id,name,slug', 'property:id,title,slug,city'])
            ->withCount('quotes')
            ->latest()
            ->paginate(20);

        return $this->success(
            ServiceRequestResource::collection($requests->items()),
            'OK',
            200,
            ['total' => $requests->total()]
        );
    }
}
