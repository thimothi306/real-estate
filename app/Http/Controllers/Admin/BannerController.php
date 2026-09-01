<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('sort_order')->latest()->paginate(20);

        return view('admin.banners.index', compact('banners'));
    }

    public function create()
    {
        return view('admin.banners.form', ['banner' => new Banner(['is_active' => true])]);
    }

    public function edit(Banner $banner)
    {
        return view('admin.banners.form', compact('banner'));
    }

    public function store(Request $request)
    {
        $banner = Banner::create($this->validated($request));
        $this->storeImage($request, $banner);

        return redirect()->route('admin.banners.index')->with('status', 'Banner created.');
    }

    public function update(Request $request, Banner $banner)
    {
        $banner->update($this->validated($request));
        $this->storeImage($request, $banner);

        return redirect()->route('admin.banners.index')->with('status', 'Banner updated.');
    }

    public function toggle(Banner $banner)
    {
        $banner->update(['is_active' => ! $banner->is_active]);

        return back()->with('status', 'Banner '.($banner->is_active ? 'activated' : 'paused').'.');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return back()->with('status', 'Banner deleted.');
    }

    protected function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'subtitle' => ['nullable', 'string', 'max:200'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'placement' => ['required', Rule::in(Banner::PLACEMENTS)],
            'audience' => ['required', Rule::in(Banner::AUDIENCES)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['nullable', 'boolean'],
        ]) + ['is_active' => $request->boolean('is_active')];
    }

    /** Replaces the old file rather than orphaning it in storage. */
    protected function storeImage(Request $request, Banner $banner): void
    {
        $request->validate(['image' => ['nullable', 'image', 'max:4096']]);

        if (! $request->hasFile('image')) {
            return;
        }

        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->update(['image_path' => $request->file('image')->store('banners', 'public')]);
    }
}
