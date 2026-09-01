@extends('admin.layouts.app')
@section('title', 'Listings')

@section('content')
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('admin.properties.index') }}" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(['pending_review', 'published', 'draft', 'rejected', 'sold', 'rented', 'archived'] as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>
                                {{ ucwords(str_replace('_', ' ', $status)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="city">City</label>
                    <select id="city" name="city">
                        <option value="">All cities</option>
                        @foreach($cities as $city)
                            <option value="{{ $city }}" @selected(($filters['city'] ?? '') === $city)>{{ $city }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="q">Title contains</label>
                    <input id="q" type="text" name="q" value="{{ $filters['q'] ?? '' }}" placeholder="Search title…">
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.properties.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            {{ number_format($properties->total()) }} listing{{ $properties->total() === 1 ? '' : 's' }}
        </div>

        @if($properties->isEmpty())
            <div class="empty">No listings match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                @foreach($properties as $property)
                    <tr>
                        <td>
                            @if($property->coverMedia)
                                <img src="{{ $property->coverMedia->url }}" alt="" class="thumb">
                            @else
                                <div class="thumb thumb-empty">—</div>
                            @endif
                        </td>
                        <td>{{ $property->title }}</td>
                        <td class="muted">{{ $property->owner?->name ?? '—' }}</td>
                        <td class="muted">{{ ucwords(str_replace('_', ' ', $property->property_type)) }}</td>
                        <td class="muted">{{ $property->city }}</td>
                        <td>₹{{ number_format($property->price) }}</td>
                        <td><span class="badge-status st-{{ $property->status }}">{{ ucwords(str_replace('_', ' ', $property->status)) }}</span></td>
                        <td class="muted">{{ $property->created_at->format('d M Y') }}</td>
                        <td><a href="{{ route('admin.properties.show', $property) }}" class="btn btn-sm">Open</a></td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $properties->links() }}</div>
        @endif
    </div>
@endsection
