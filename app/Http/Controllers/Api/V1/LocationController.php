<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    use ApiResponse;

    public function cities(Request $request)
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        // Full city list is small and changes slowly — cache it once, then
        // filter in PHP for the "q" prefix match instead of hitting the DB
        // on every keystroke of an autocomplete field.
        $cities = Cache::remember('locations.cities', now()->addHour(), function () {
            return Property::published()
                ->select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city');
        });

        if (! empty($data['q'])) {
            $needle = strtolower($data['q']);
            $cities = $cities->filter(fn ($city) => str_starts_with(strtolower($city), $needle))->values();
        }

        return $this->success($cities->take(20)->values());
    }

    public function localities(Request $request)
    {
        $data = $request->validate([
            'city' => ['required', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $query = Property::published()
            ->where('city', $data['city'])
            ->whereNotNull('locality')
            ->select('locality')
            ->distinct();

        if (! empty($data['q'])) {
            $query->where('locality', 'like', $data['q'].'%');
        }

        $localities = $query->orderBy('locality')->limit(20)->pluck('locality');

        return $this->success($localities);
    }
}
