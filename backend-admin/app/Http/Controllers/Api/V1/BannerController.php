<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Serves admin-managed banners to the mobile app and the web site.
 * Public: banners are marketing content shown before sign-in too.
 */
class BannerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $filters = $request->validate([
            'audience' => ['nullable', Rule::in(['mobile', 'web'])],
            'placement' => ['nullable', Rule::in(Banner::PLACEMENTS)],
        ]);

        $banners = Banner::live($filters['audience'] ?? null)
            ->when($filters['placement'] ?? null, fn ($q, $v) => $q->where('placement', $v))
            ->orderBy('sort_order')
            ->get();

        // Counted in one statement rather than per-model saves.
        Banner::whereIn('id', $banners->pluck('id'))->increment('impressions');

        return $this->success($banners->map(fn ($banner) => [
            'id' => $banner->id,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'image_url' => $banner->image_url,
            'cta_label' => $banner->cta_label,
            'cta_url' => $banner->cta_url,
            'placement' => $banner->placement,
        ]));
    }

    /** Fire-and-forget click tracking; never blocks the client's navigation. */
    public function trackClick(Banner $banner)
    {
        $banner->increment('clicks');

        return $this->success(null, 'Recorded.');
    }
}
