@extends('admin.layouts.app')
@section('title', 'Banners')

@section('content')
    <div class="page-head">
        <div>
            <h1>Banners</h1>
            <p>Promotional slots rendered inside the mobile app and on the web site.</p>
        </div>
        <div class="spacer"></div>
        <a href="{{ route('admin.banners.create') }}" class="btn btn-gold">+ New banner</a>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($banners->total()) }} banners</div>

        @if($banners->isEmpty())
            <div class="empty">
                No banners yet.
                <div style="margin-top:12px">
                    <a href="{{ route('admin.banners.create') }}" class="btn btn-primary">Create your first banner</a>
                </div>
            </div>
        @else
            <table>
                <thead>
                <tr>
                    <th style="width:74px"></th>
                    <th>Title</th>
                    <th>Placement</th>
                    <th>Audience</th>
                    <th>Schedule</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th style="width:180px"></th>
                </tr>
                </thead>
                <tbody>
                @foreach($banners as $banner)
                    <tr>
                        <td>
                            @if($banner->image_url)
                                <img src="{{ $banner->image_url }}" alt="" class="thumb" style="width:64px;height:40px">
                            @else
                                <div class="thumb thumb-empty" style="width:64px;height:40px">🖼</div>
                            @endif
                        </td>
                        <td>
                            <div class="cell-strong">{{ $banner->title }}</div>
                            @if($banner->subtitle)
                                <div class="cell-sub">{{ \Illuminate\Support\Str::limit($banner->subtitle, 40) }}</div>
                            @endif
                        </td>
                        <td class="cell-sub">{{ ucwords(str_replace('_', ' ', $banner->placement)) }}</td>
                        <td>
                            <span class="badge-status {{ $banner->audience === 'all' ? 'st-published' : 'st-draft' }}">
                                {{ $banner->audience === 'all' ? 'App + Web' : ucfirst($banner->audience) }}
                            </span>
                        </td>
                        <td class="cell-sub">
                            @if($banner->starts_at || $banner->ends_at)
                                {{ $banner->starts_at?->format('d M') ?? 'Now' }} → {{ $banner->ends_at?->format('d M Y') ?? 'Always' }}
                            @else
                                Always on
                            @endif
                        </td>
                        <td class="cell-sub">
                            {{ number_format($banner->impressions) }} views · {{ number_format($banner->clicks) }} clicks
                        </td>
                        <td>
                            <span class="badge-status {{ $banner->is_active ? 'st-published' : 'st-draft' }}">
                                {{ $banner->is_active ? 'Live' : 'Paused' }}
                            </span>
                        </td>
                        <td style="white-space:nowrap">
                            <a href="{{ route('admin.banners.edit', $banner) }}" class="btn btn-sm">Edit</a>

                            <form method="POST" action="{{ route('admin.banners.toggle', $banner) }}" style="display:inline">
                                @csrf
                                <button type="submit" class="btn btn-sm">{{ $banner->is_active ? 'Pause' : 'Activate' }}</button>
                            </form>

                            <form method="POST" action="{{ route('admin.banners.destroy', $banner) }}" style="display:inline"
                                  onsubmit="return confirm('Delete this banner? It will disappear from the app and site immediately.')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $banners->links() }}</div>
        @endif
    </div>
@endsection
