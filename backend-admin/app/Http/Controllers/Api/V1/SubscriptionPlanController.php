<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use App\Traits\ApiResponse;

class SubscriptionPlanController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('price')->get();

        return $this->success(SubscriptionPlanResource::collection($plans));
    }
}
