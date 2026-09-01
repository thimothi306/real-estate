<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;

class ServiceCategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $categories = Cache::remember('service_categories.all', now()->addHours(6), function () {
            return ServiceCategory::select(['id', 'name', 'slug', 'icon', 'description', 'is_property_specific'])
                ->orderBy('name')
                ->get();
        });

        return $this->success($categories);
    }
}
