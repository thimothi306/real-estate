<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Visit;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VisitController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $visit = Visit::create([
            'property_id' => $property->id,
            'buyer_id' => $request->user()->id,
            'scheduled_at' => $data['scheduled_at'],
            'note' => $data['note'] ?? null,
            'status' => 'pending',
        ]);

        return $this->success($visit, 'Visit scheduled.', 201);
    }

    public function myVisits(Request $request)
    {
        $visits = Visit::where('buyer_id', $request->user()->id)
            ->with('property:id,title,slug,city')
            ->orderBy('scheduled_at')
            ->paginate(20);

        return $this->success($visits->items(), 'OK', 200, ['total' => $visits->total()]);
    }

    public function updateStatus(Request $request, Visit $visit)
    {
        $property = $visit->property;
        $this->authorize('update', $property);

        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'completed', 'cancelled', 'no_show'])],
        ]);

        $visit->update(['status' => $data['status']]);

        return $this->success($visit, 'Visit status updated.');
    }
}
