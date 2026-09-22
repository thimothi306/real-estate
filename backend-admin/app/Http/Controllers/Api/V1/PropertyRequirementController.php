<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PropertyRequirement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PropertyRequirementController extends Controller
{
    use ApiResponse;

    /**
     * Public lead-capture — "Tell us what you need". No login required, no
     * matching/notification against listings; just recorded for manual
     * follow-up (see PropertyRequirement::STATUSES for the admin workflow).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'city' => ['nullable', 'string', 'max:100'],
            'property_type' => ['nullable', 'string', 'max:50'],
            'listing_type' => ['nullable', Rule::in(['sale', 'rent'])],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0', 'gte:budget_min'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $requirement = PropertyRequirement::create($data + ['status' => 'new']);

        return $this->success(
            ['id' => $requirement->id],
            "Thanks — we've received your requirement and will get in touch soon.",
            201
        );
    }
}
