<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyDuplicateFlag;
use App\Models\PropertyReport;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReportController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function duplicateFlags(Request $request)
    {
        $flags = PropertyDuplicateFlag::query()
            ->where('status', 'pending')
            ->with([
                'property:id,title,slug,owner_id',
                'matchedProperty:id,title,slug,owner_id',
            ])
            ->latest()
            ->paginate(25);

        return $this->success($flags->items(), 'OK', 200, ['total' => $flags->total()]);
    }

    public function resolveDuplicateFlag(Request $request, PropertyDuplicateFlag $flag)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'dismissed'])],
        ]);

        $flag->update(['status' => $data['status']]);

        if ($data['status'] === 'confirmed') {
            $flag->property()->update(['status' => Property::STATUS_ARCHIVED]);
        }

        return $this->success($flag->fresh(), 'Duplicate flag resolved.');
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'reviewed', 'dismissed', 'actioned'])],
        ]);

        $reports = PropertyReport::query()
            ->when($data['status'] ?? 'pending', fn ($q, $status) => $q->where('status', $status))
            ->with(['property:id,title,slug,status', 'reporter:id,name,phone'])
            ->latest()
            ->paginate(25);

        return $this->success($reports->items(), 'OK', 200, ['total' => $reports->total()]);
    }

    public function resolve(Request $request, PropertyReport $report)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['reviewed', 'dismissed', 'actioned'])],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'suspend_listing' => ['sometimes', 'boolean'],
        ]);

        $report->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $data['admin_notes'] ?? null,
        ]);

        if (! empty($data['suspend_listing'])) {
            $report->property()->update(['status' => Property::STATUS_ARCHIVED]);
        }

        return $this->success($report->fresh(), 'Report resolved.');
    }
}
