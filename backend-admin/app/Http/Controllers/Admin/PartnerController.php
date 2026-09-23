<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartnerDocument;
use App\Models\PartnerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,verified'],
        ]);

        $status = $filters['status'] ?? 'pending';

        $partners = PartnerProfile::where('is_verified', $status === 'verified')
            ->with(['user:id,name,phone,email,role', 'categories:id,name', 'documents'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.partners.index', compact('partners', 'status'));
    }

    public function verify(Request $request, PartnerProfile $partner)
    {
        $partner->update([
            'is_verified' => true,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return back()->with('success', "{$partner->business_name} is now verified.");
    }

    /** Streams the file from its private disk — never a public Storage::url(). */
    public function downloadDocument(PartnerDocument $document)
    {
        abort_unless(Storage::disk($document->disk)->exists($document->path), 404);

        return Storage::disk($document->disk)->response($document->path);
    }

    public function reviewDocument(Request $request, PartnerDocument $document)
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:255'],
        ]);

        $document->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $data['status'] === 'rejected' ? ($data['rejection_reason'] ?? null) : null,
        ]);

        return back()->with('success', 'Document reviewed.');
    }
}
