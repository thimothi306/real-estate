<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerDocumentResource;
use App\Http\Resources\PartnerProfileResource;
use App\Models\PartnerDocument;
use App\Models\PartnerProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPartnerController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function pending(Request $request)
    {
        $profiles = PartnerProfile::where('is_verified', false)
            ->with(['user:id,name,phone,role,email', 'categories:id,name'])
            ->latest()
            ->paginate(20);

        return $this->success(
            PartnerProfileResource::collection($profiles->items()),
            'OK',
            200,
            ['total' => $profiles->total()]
        );
    }

    public function verify(Request $request, PartnerProfile $partnerProfile)
    {
        $partnerProfile->update([
            'is_verified' => true,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return $this->success(new PartnerProfileResource($partnerProfile), 'Partner verified.');
    }

    public function documents(PartnerProfile $partnerProfile)
    {
        return $this->success(PartnerDocumentResource::collection($partnerProfile->documents()->latest()->get()));
    }

    /**
     * Streams the file straight from the private disk — never a
     * Storage::url(), since that disk isn't publicly readable in the first
     * place. Only an authenticated admin can ever reach this.
     */
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

        return $this->success(new PartnerDocumentResource($document), 'Document reviewed.');
    }
}
