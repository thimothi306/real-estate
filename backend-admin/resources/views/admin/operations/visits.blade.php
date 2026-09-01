@extends('admin.layouts.app')
@section('title', 'Visit Requests')

@section('content')
    <div class="page-head">
        <div>
            <h1>Visit Requests</h1>
            <p>Site visits booked by buyers and tenants.</p>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <form method="GET" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(['pending', 'confirmed', 'completed', 'cancelled'] as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>{{ ucfirst($status) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.visits.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($visits->total()) }} visit requests</div>

        @if($visits->isEmpty())
            <div class="empty">No visit requests match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Visitor</th>
                    <th>Property</th>
                    <th>Scheduled for</th>
                    <th>Status</th>
                    <th style="width:230px">Update</th>
                </tr>
                </thead>
                <tbody>
                @foreach($visits as $visit)
                    <tr>
                        <td>
                            <div class="cell-strong">{{ $visit->buyer?->name ?? 'Guest' }}</div>
                            <div class="cell-sub">{{ $visit->buyer?->phone }}</div>
                        </td>
                        <td>
                            @if($visit->property)
                                <a href="{{ route('admin.properties.show', $visit->property) }}">
                                    {{ \Illuminate\Support\Str::limit($visit->property->title, 30) }}
                                </a>
                                <div class="cell-sub">{{ collect([$visit->property->locality, $visit->property->city])->filter()->join(', ') }}</div>
                            @else
                                <span class="muted">—</span>
                            @endif
                        </td>
                        <td>
                            <div class="cell-strong">{{ $visit->scheduled_at?->format('d M Y') }}</div>
                            <div class="cell-sub">{{ $visit->scheduled_at?->format('g:i A') }}</div>
                        </td>
                        <td><span class="badge-status st-{{ $visit->status }}">{{ ucfirst($visit->status) }}</span></td>
                        <td>
                            <form method="POST" action="{{ route('admin.visits.update', $visit) }}" style="display:flex;gap:6px">
                                @csrf
                                <select name="status" class="btn btn-sm" style="min-width:auto">
                                    @foreach(['pending', 'confirmed', 'completed', 'cancelled'] as $status)
                                        <option value="{{ $status }}" @selected($visit->status === $status)>{{ ucfirst($status) }}</option>
                                    @endforeach
                                </select>
                                <button type="submit" class="btn btn-sm btn-primary">Save</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $visits->links() }}</div>
        @endif
    </div>
@endsection
