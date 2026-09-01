<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyReport;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PropertyReportController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, Property $property)
    {
        $data = $request->validate([
            'reason' => ['required', Rule::in([
                'fake_listing', 'duplicate', 'spam', 'incorrect_info', 'fraud', 'sold_already', 'other',
            ])],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        // One open report per user per property — resubmitting just updates the existing one.
        $report = PropertyReport::updateOrCreate(
            [
                'property_id' => $property->id,
                'reporter_id' => $request->user()->id,
                'status' => 'pending',
            ],
            $data
        );

        return $this->success($report, 'Report submitted. Our team will review it shortly.', 201);
    }
}
