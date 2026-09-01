@extends('admin.layouts.app')
@section('title', 'Verifications')

@section('content')
    <div class="page-head">
        <div>
            <h1>Verification Queue</h1>
            <p>Listings waiting on an approve or reject decision before they go live.</p>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($pending->total()) }} awaiting review</div>

        @if($pending->isEmpty())
            <div class="empty">🎉 Nothing in the queue — every listing has been reviewed.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th style="width:60px"></th>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Badges</th>
                    <th>Waiting</th>
                    <th style="width:90px"></th>
                </tr>
                </thead>
                <tbody>
                @foreach($pending as $property)
                    <tr>
                        <td>
                            @if($property->coverMedia)
                                <img src="{{ $property->coverMedia->url }}" alt="" class="thumb">
                            @else
                                <div class="thumb thumb-empty">🏠</div>
                            @endif
                        </td>
                        <td class="cell-strong">{{ \Illuminate\Support\Str::limit($property->title, 34) }}</td>
                        <td>
                            <div class="cell-sub">{{ $property->owner?->name }}</div>
                            <div class="cell-sub">{{ $property->owner?->phone }}</div>
                        </td>
                        <td class="cell-sub">{{ collect([$property->locality, $property->city])->filter()->join(', ') }}</td>
                        <td class="cell-strong">₹{{ number_format($property->price) }}</td>
                        <td>
                            @forelse($property->verifications as $badge)
                                <span class="badge-status st-verified" style="margin:1px">
                                    {{ ucwords(str_replace('_', ' ', $badge->badge_type)) }}
                                </span>
                            @empty
                                <span class="muted" style="font-size:12px">None yet</span>
                            @endforelse
                        </td>
                        <td class="cell-sub">{{ $property->created_at?->diffForHumans(null, true) }}</td>
                        <td>
                            <a href="{{ route('admin.properties.show', $property) }}" class="btn btn-sm btn-primary">Review</a>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $pending->links() }}</div>
        @endif
    </div>
@endsection
