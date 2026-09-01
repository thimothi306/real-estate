<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LifestyleTag;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Cache;

class LifestyleTagController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $tags = Cache::remember('lifestyle_tags.all', now()->addHours(6), function () {
            return LifestyleTag::select(['id', 'name', 'slug', 'icon'])->orderBy('name')->get();
        });

        return $this->success($tags);
    }
}
