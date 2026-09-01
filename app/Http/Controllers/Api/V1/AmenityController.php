<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;

class AmenityController extends Controller
{
    use ApiResponse;

    public function index()
    {
        // Amenities change rarely — cache the full list to avoid a DB hit on every request.
        $amenities = Cache::remember('amenities.all', now()->addHours(6), function () {
            return Amenity::select(['id', 'name', 'slug', 'icon', 'category'])->orderBy('category')->get();
        });

        return $this->success($amenities);
    }
}
