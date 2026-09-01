@extends('admin.layouts.app')
@section('title', 'Service Requests')

@section('content')
    <div class="page-head">
        <div>
            <h1>Service Requests</h1>
            <p>Interior design, legal, loans, movers and the other partner verticals.</p>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <form method="GET" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(['open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'] as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>
                                {{ ucwords(str_replace('_', ' ', $status)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.services.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($requests->total()) }} service requests</div>

        @if($requests->isEmpty())
            <div class="empty">No service requests match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Request</th>
                    <th>Category</th>
                    <th>Raised by</th>
                    <th>Budget</th>
                    <th>Quotes</th>
                    <th>Assigned to</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                @foreach($requests as $request)
                    <tr>
                        <td class="cell-strong">{{ \Illuminate\Support\Str::limit($request->title, 34) }}</td>
                        <td class="cell-sub">{{ $request->category?->name ?? '—' }}</td>
                        <td class="cell-sub">{{ $request->requester?->name ?? '—' }}</td>
                        <td class="cell-sub">
                            @if($request->budget_min || $request->budget_max)
                                ₹{{ number_format((float) $request->budget_min) }} – ₹{{ number_format((float) $request->budget_max) }}
                            @else
                                <span class="muted">Not stated</span>
                            @endif
                        </td>
                        <td class="cell-strong">{{ $request->quotes_count }}</td>
                        <td class="cell-sub">{{ $request->assignedPartner?->name ?? '—' }}</td>
                        <td>
                            <span class="badge-status st-{{ $request->status }}">
                                {{ ucwords(str_replace('_', ' ', $request->status)) }}
                            </span>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $requests->links() }}</div>
        @endif
    </div>
@endsection
