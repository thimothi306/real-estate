<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\PropertyDuplicateFlag;
use App\Models\PropertyReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'reviewed', 'dismissed', 'actioned'])],
        ]);

        $status = $filters['status'] ?? 'pending';

        $reports = PropertyReport::where('status', $status)
            ->with(['property:id,title,slug,status', 'reporter:id,name,phone'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.reports.index', compact('reports', 'status'));
    }

    /**
     * Full context for one report: the property in detail, and the owner's
     * complete track record — other listings, revenue brought to the
     * platform, and whether they've been reported before — so an admin can
     * judge the report without opening three other screens first.
     */
    public function show(PropertyReport $report)
    {
        $report->load([
            'property.owner:id,name,email,phone,role,created_at',
            'property.coverMedia',
            'property.verifications',
            'reporter:id,name,phone,email',
            'reviewer:id,name',
        ]);

        $owner = $report->property?->owner;
        $ownerStats = null;

        if ($owner) {
            $listingCounts = Property::where('owner_id', $owner->id)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status');

            $ownerStats = [
                'listings_total' => $listingCounts->sum(),
                'listings_published' => $listingCounts['published'] ?? 0,
                'listings_pending' => $listingCounts['pending_review'] ?? 0,
                'listings_rejected' => $listingCounts['rejected'] ?? 0,
                'revenue' => (float) Payment::where('user_id', $owner->id)->where('status', 'completed')->sum('amount'),
                'leads_received' => Lead::whereHas('property', fn ($q) => $q->where('owner_id', $owner->id))->count(),
                'prior_reports' => PropertyReport::whereHas('property', fn ($q) => $q->where('owner_id', $owner->id))
                    ->where('id', '!=', $report->id)
                    ->count(),
                'other_listings' => Property::where('owner_id', $owner->id)
                    ->where('id', '!=', $report->property_id)
                    ->with('coverMedia')
                    ->latest()
                    ->limit(6)
                    ->get(),
            ];
        }

        return view('admin.reports.show', compact('report', 'owner', 'ownerStats'));
    }

    public function resolve(Request $request, PropertyReport $report)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['reviewed', 'dismissed', 'actioned'])],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'archive_listing' => ['sometimes', 'boolean'],
        ]);

        $report->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $data['admin_notes'] ?? null,
        ]);

        if ($request->boolean('archive_listing')) {
            $report->property()->update(['status' => Property::STATUS_ARCHIVED]);
        }

        return back()->with('success', 'Report resolved.');
    }

    public function duplicates(Request $request)
    {
        $flags = PropertyDuplicateFlag::where('status', 'pending')
            ->with([
                'property:id,title,slug,city,owner_id',
                'property.owner:id,name',
                'matchedProperty:id,title,slug,city,owner_id',
                'matchedProperty.owner:id,name',
            ])
            ->latest()
            ->paginate(20);

        return view('admin.reports.duplicates', compact('flags'));
    }

    public function resolveDuplicate(Request $request, PropertyDuplicateFlag $flag)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'dismissed'])],
        ]);

        $flag->update(['status' => $data['status']]);

        if ($data['status'] === 'confirmed') {
            $flag->property()->update(['status' => Property::STATUS_ARCHIVED]);
        }

        return back()->with('success', $data['status'] === 'confirmed'
            ? 'Duplicate confirmed — the newer listing has been archived.'
            : 'Flag dismissed.');
    }
}
