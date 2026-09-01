@extends('admin.layouts.app')
@section('title', $banner->exists ? 'Edit banner' : 'New banner')

@section('content')
    <div class="page-head">
        <div>
            <h1>{{ $banner->exists ? 'Edit banner' : 'New banner' }}</h1>
            <p>Controls what buyers see in the mobile app and on the web site.</p>
        </div>
        <div class="spacer"></div>
        <a href="{{ route('admin.banners.index') }}" class="btn">← Back to banners</a>
    </div>

    @if($errors->any())
        <div class="alert alert-danger">
            <strong>Please fix the following:</strong>
            <ul style="margin:6px 0 0; padding-left:18px">
                @foreach($errors->all() as $message)
                    <li>{{ $message }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST"
          action="{{ $banner->exists ? route('admin.banners.update', $banner) : route('admin.banners.store') }}"
          enctype="multipart/form-data">
        @csrf

        <div class="grid grid-2-1">
            <div class="card" style="margin:0">
                <div class="card-header">Content</div>
                <div class="card-body" style="display:grid; gap:16px">
                    <div class="field">
                        <label for="title">Title *</label>
                        <input id="title" type="text" name="title" required maxlength="150" style="width:100%"
                               value="{{ old('title', $banner->title) }}" placeholder="e.g. Verified Properties You Can Trust">
                    </div>

                    <div class="field">
                        <label for="subtitle">Subtitle</label>
                        <input id="subtitle" type="text" name="subtitle" maxlength="200" style="width:100%"
                               value="{{ old('subtitle', $banner->subtitle) }}" placeholder="A short supporting line">
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 2fr; gap:16px">
                        <div class="field">
                            <label for="cta_label">Button label</label>
                            <input id="cta_label" type="text" name="cta_label" maxlength="60" style="width:100%"
                                   value="{{ old('cta_label', $banner->cta_label) }}" placeholder="Explore Now">
                        </div>
                        <div class="field">
                            <label for="cta_url">Button link</label>
                            <input id="cta_url" type="text" name="cta_url" maxlength="500" style="width:100%"
                                   value="{{ old('cta_url', $banner->cta_url) }}" placeholder="/properties?rera_only=1">
                        </div>
                    </div>

                    <div class="field">
                        <label for="image">Image</label>
                        @if($banner->image_url)
                            <img src="{{ $banner->image_url }}" alt=""
                                 style="display:block; width:220px; border-radius:10px; border:1px solid var(--border); margin-bottom:8px">
                        @endif
                        <input id="image" type="file" name="image" accept="image/*">
                        <div class="cell-sub" style="margin-top:4px">JPG or PNG, up to 4 MB. Wide images (16:9) work best.</div>
                    </div>
                </div>
            </div>

            <div>
                <div class="card">
                    <div class="card-header">Targeting</div>
                    <div class="card-body" style="display:grid; gap:16px">
                        <div class="field">
                            <label for="placement">Placement *</label>
                            <select id="placement" name="placement" style="width:100%">
                                @foreach(\App\Models\Banner::PLACEMENTS as $placement)
                                    <option value="{{ $placement }}" @selected(old('placement', $banner->placement) === $placement)>
                                        {{ ucwords(str_replace('_', ' ', $placement)) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <div class="field">
                            <label for="audience">Show on *</label>
                            <select id="audience" name="audience" style="width:100%">
                                <option value="all" @selected(old('audience', $banner->audience) === 'all')>Mobile app + Web site</option>
                                <option value="mobile" @selected(old('audience', $banner->audience) === 'mobile')>Mobile app only</option>
                                <option value="web" @selected(old('audience', $banner->audience) === 'web')>Web site only</option>
                            </select>
                        </div>

                        <div class="field">
                            <label for="sort_order">Sort order</label>
                            <input id="sort_order" type="number" name="sort_order" min="0" max="999" style="width:100%"
                                   value="{{ old('sort_order', $banner->sort_order ?? 0) }}">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Schedule</div>
                    <div class="card-body" style="display:grid; gap:16px">
                        <div class="field">
                            <label for="starts_at">Starts</label>
                            <input id="starts_at" type="datetime-local" name="starts_at" style="width:100%"
                                   value="{{ old('starts_at', $banner->starts_at?->format('Y-m-d\TH:i')) }}">
                        </div>
                        <div class="field">
                            <label for="ends_at">Ends</label>
                            <input id="ends_at" type="datetime-local" name="ends_at" style="width:100%"
                                   value="{{ old('ends_at', $banner->ends_at?->format('Y-m-d\TH:i')) }}">
                        </div>
                        <div class="cell-sub">Leave both empty to run the banner indefinitely.</div>

                        <label style="display:flex; align-items:center; gap:8px; font-size:13.5px; cursor:pointer">
                            <input type="checkbox" name="is_active" value="1"
                                   @checked(old('is_active', $banner->is_active ?? true))>
                            Active
                        </label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:11px">
                    {{ $banner->exists ? 'Save changes' : 'Create banner' }}
                </button>
            </div>
        </div>
    </form>
@endsection
