<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $dbOk = true;

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbOk = false;
        }

        return $this->success([
            'status' => $dbOk ? 'ok' : 'degraded',
            'database' => $dbOk ? 'connected' : 'unreachable',
            'timestamp' => now()->toIso8601String(),
        ], $dbOk ? 'OK' : 'Degraded', $dbOk ? 200 : 503);
    }
}
