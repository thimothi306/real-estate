<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['call', 'message', 'callback_request', 'whatsapp'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $lead = Lead::create([
            'property_id' => $property->id,
            'buyer_id' => $request->user()->id,
            'type' => $data['type'],
            'note' => $data['note'] ?? null,
            'status' => 'new',
        ]);

        $property->increment('leads_count');

        return $this->success($lead, 'Lead recorded.', 201);
    }

    public function myLeads(Request $request)
    {
        $leads = Lead::where('buyer_id', $request->user()->id)
            ->with('property:id,title,slug,city')
            ->latest()
            ->paginate(20);

        return $this->success($leads->items(), 'OK', 200, ['total' => $leads->total()]);
    }

    public function propertyLeads(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $leads = $property->leads()
            ->with('buyer:id,name,phone,avatar_url')
            ->latest()
            ->paginate(20);

        return $this->success($leads->items(), 'OK', 200, ['total' => $leads->total()]);
    }
}
