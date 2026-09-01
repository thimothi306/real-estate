<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AvailabilityBlock;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Date-range booking for bookable listing types (farmhouses, resorts, wedding
 * venues, PGs) — distinct from the one-time "schedule a visit" flow.
 */
class BookingController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['availability']);
    }

    public function availability(Request $request, Property $property)
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $blocks = $property->availabilityBlocks()
            ->whereIn('status', ['blocked', 'pending', 'confirmed'])
            ->when($data['from'] ?? null, fn ($q, $from) => $q->where('end_date', '>=', $from))
            ->when($data['to'] ?? null, fn ($q, $to) => $q->where('start_date', '<=', $to))
            ->orderBy('start_date')
            ->get(['id', 'start_date', 'end_date', 'status']);

        return $this->success($blocks);
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        abort_if(
            $property->availabilityBlocks()->overlapping($data['start_date'], $data['end_date'])->exists(),
            422,
            'Those dates are not available for this property.'
        );

        $booking = AvailabilityBlock::create([
            'property_id' => $property->id,
            'booked_by' => $request->user()->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => 'pending',
            'note' => $data['note'] ?? null,
        ]);

        return $this->success($booking, 'Booking request sent. The owner will confirm shortly.', 201);
    }

    public function myBookings(Request $request)
    {
        $bookings = AvailabilityBlock::where('booked_by', $request->user()->id)
            ->with('property:id,title,slug,city')
            ->orderByDesc('start_date')
            ->paginate(20);

        return $this->success($bookings->items(), 'OK', 200, ['total' => $bookings->total()]);
    }

    public function propertyBookings(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $bookings = $property->availabilityBlocks()
            ->with('bookedBy:id,name,phone')
            ->orderBy('start_date')
            ->paginate(20);

        return $this->success($bookings->items(), 'OK', 200, ['total' => $bookings->total()]);
    }

    public function updateStatus(Request $request, AvailabilityBlock $booking)
    {
        $this->authorize('update', $booking->property);

        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'cancelled'])],
        ]);

        $booking->update(['status' => $data['status']]);

        return $this->success($booking->fresh(), 'Booking updated.');
    }

    public function blockDates(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $block = AvailabilityBlock::create([
            'property_id' => $property->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => 'blocked',
            'note' => $data['note'] ?? null,
        ]);

        return $this->success($block, 'Dates blocked.', 201);
    }
}
