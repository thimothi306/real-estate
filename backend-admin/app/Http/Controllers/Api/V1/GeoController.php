<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Geo;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class GeoController extends Controller
{
    use ApiResponse;

    public function countries()
    {
        return $this->success(Geo::countries());
    }

    public function states(Request $request)
    {
        $data = $request->validate([
            'country' => ['required', 'string', 'max:100'],
        ]);

        return $this->success(Geo::statesFor($data['country']));
    }
}
