<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartnerProfile;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,verified'],
        ]);

        $status = $filters['status'] ?? 'pending';

        $partners = PartnerProfile::where('is_verified', $status === 'verified')
            ->with(['user:id,name,phone,email,role', 'categories:id,name'])
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
}
