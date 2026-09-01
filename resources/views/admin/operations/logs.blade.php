@extends('admin.layouts.app')
@section('title', 'System Logs')

@section('content')
    <div class="page-head">
        <div>
            <h1>System Logs</h1>
            <p>Authentication events across the mobile app, web site, and this panel.</p>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <form method="GET" class="filters">
                <div class="field">
                    <label for="event">Event</label>
                    <select id="event" name="event">
                        <option value="">All events</option>
                        @foreach(['login', 'failed_login', 'logout', 'password_reset'] as $event)
                            <option value="{{ $event }}" @selected(($filters['event'] ?? '') === $event)>
                                {{ ucwords(str_replace('_', ' ', $event)) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.logs.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($activities->total()) }} log entries</div>

        @if($activities->isEmpty())
            <div class="empty">No log entries match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Event</th>
                    <th>User</th>
                    <th>Identifier used</th>
                    <th>IP address</th>
                    <th>Device</th>
                    <th>When</th>
                </tr>
                </thead>
                <tbody>
                @foreach($activities as $activity)
                    <tr>
                        <td>
                            <span class="badge-status {{ $activity->event === 'failed_login' ? 'st-rejected' : 'st-published' }}">
                                {{ ucwords(str_replace('_', ' ', $activity->event)) }}
                            </span>
                        </td>
                        <td>
                            <div class="cell-strong">{{ $activity->user?->name ?? 'Unknown' }}</div>
                            <div class="cell-sub">{{ $activity->user?->role ? ucwords(str_replace('_', ' ', $activity->user->role)) : '' }}</div>
                        </td>
                        <td class="cell-sub">{{ $activity->identifier }}</td>
                        <td class="cell-sub">{{ $activity->ip_address ?? '—' }}</td>
                        <td class="cell-sub" title="{{ $activity->user_agent }}">
                            {{ \Illuminate\Support\Str::limit($activity->user_agent ?? '—', 34) }}
                        </td>
                        <td class="cell-sub">{{ $activity->created_at?->format('d M Y, g:i A') }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $activities->links() }}</div>
        @endif
    </div>
@endsection
