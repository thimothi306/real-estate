<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        return $this->success($request->user()->savedSearches()->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
            'filters' => ['required', 'array'],
            'filters.city' => ['nullable', 'string', 'max:100'],
            'filters.property_type' => ['nullable', 'string'],
            'filters.listing_type' => ['nullable', 'string'],
            'filters.min_price' => ['nullable', 'numeric', 'min:0'],
            'filters.max_price' => ['nullable', 'numeric', 'min:0'],
            'filters.bedrooms' => ['nullable', 'integer', 'min:0'],
            'notify_on_match' => ['sometimes', 'boolean'],
        ]);

        $savedSearch = $request->user()->savedSearches()->create($data);

        return $this->success($savedSearch, 'Search saved.', 201);
    }

    public function destroy(Request $request, SavedSearch $savedSearch)
    {
        abort_unless($savedSearch->user_id === $request->user()->id, 403);

        $savedSearch->delete();

        return $this->success(null, 'Saved search removed.');
    }
}
