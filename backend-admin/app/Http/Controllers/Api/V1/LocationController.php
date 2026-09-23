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
            'state' => ['nullable', 'string', 'max:100'],
        ]);

        // A state-scoped query (for the cascading location selector) is
        // cheap and specific enough to just hit the DB directly — only the
        // unfiltered "all cities" list is worth caching, since that's the
        // one every autocomplete keystroke would otherwise repeat.
        if (! empty($data['state'])) {
            $cities = Property::published()
                ->where('state', $data['state'])
                ->select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city');
        } else {
            $cities = Cache::remember('locations.cities', now()->addHour(), function () {
                return Property::published()
                    ->select('city')
                    ->distinct()
                    ->orderBy('city')
                    ->pluck('city');
            });
        }

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
