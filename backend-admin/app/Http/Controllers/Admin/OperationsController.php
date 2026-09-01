<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LoginActivity;
use App\Models\Payment;
use App\Models\Property;
use App\Models\ServiceRequest;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Read-and-triage screens for the transactional side of the platform.
 * Each list is filterable and paginated; the write actions are limited to
 * status transitions an admin legitimately owns.
 */
class OperationsController extends Controller
{
    public function inquiries(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(Lead::STATUSES)],
            'type' => ['nullable', Rule::in(['call', 'message', 'callback_request', 'whatsapp'])],
        ]);

        $leads = Lead::query()
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->with(['property:id,title,slug,city,locality', 'buyer:id,name,phone'])
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return view('admin.operations.inquiries', compact('leads', 'filters'));
    }

    public function updateInquiry(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['new', 'contacted', 'converted', 'closed'])],
        ]);

        $lead->update($data);

        return back()->with('status', 'Inquiry marked as '.$data['status'].'.');
    }

    public function visits(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        $visits = Visit::query()
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->with(['property:id,title,slug,city,locality', 'buyer:id,name,phone'])
            ->orderByDesc('scheduled_at')
            ->paginate(25)
            ->withQueryString();

        return view('admin.operations.visits', compact('visits', 'filters'));
    }

    public function updateVisit(Request $request, Visit $visit)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        $visit->update($data);

        return back()->with('status', 'Visit marked as '.$data['status'].'.');
    }

    public function payments(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'completed', 'failed', 'refunded'])],
            'purpose' => ['nullable', 'string', 'max:40'],
        ]);

        $payments = Payment::query()
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['purpose'] ?? null, fn ($q, $v) => $q->where('purpose', $v))
            ->with('user:id,name,email')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $totals = [
            'collected' => (float) Payment::where('status', 'completed')->sum('amount'),
            'pending' => (float) Payment::where('status', 'pending')->sum('amount'),
            'failed' => Payment::where('status', 'failed')->count(),
        ];

        return view('admin.operations.payments', compact('payments', 'filters', 'totals'));
    }

    /** The moderation queue — listings waiting on an admin decision. */
    public function verifications()
    {
        $pending = Property::where('status', Property::STATUS_PENDING_REVIEW)
            ->with(['owner:id,name,phone,role', 'coverMedia', 'verifications'])
            ->oldest()
            ->paginate(20);

        return view('admin.operations.verifications', compact('pending'));
    }

    public function services(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'])],
        ]);

        $requests = ServiceRequest::query()
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->with(['requester:id,name', 'category:id,name', 'assignedPartner:id,name'])
            ->withCount('quotes')
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return view('admin.operations.services', compact('requests', 'filters'));
    }

    public function logs(Request $request)
    {
        $filters = $request->validate([
            'event' => ['nullable', 'string', 'max:40'],
        ]);

        $activities = LoginActivity::query()
            ->when($filters['event'] ?? null, fn ($q, $v) => $q->where('event', $v))
            ->with('user:id,name,email,role')
            ->latest()
            ->paginate(40)
            ->withQueryString();

        return view('admin.operations.logs', compact('activities', 'filters'));
    }
}
