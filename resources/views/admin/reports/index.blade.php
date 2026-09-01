@extends('admin.layouts.app')
@section('title', 'Reported listings')

@section('content')
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('admin.reports.index') }}" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status" onchange="this.form.submit()">
                        @foreach(['pending', 'reviewed', 'dismissed', 'actioned'] as $option)
                            <option value="{{ $option }}" @selected($status === $option)>{{ ucfirst($option) }}</option>
                        @endforeach
                    </select>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($reports->total()) }} {{ $status }} report{{ $reports->total() === 1 ? '' : 's' }}</div>

        @if($reports->isEmpty())
            <div class="empty">No {{ $status }} reports.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Listing</th>
                    <th>Reason</th>
                    <th>Detail</th>
                    <th>Reported by</th>
                    <th>When</th>
                    <th style="width:60px"></th>
                    <th style="width:330px">Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($reports as $report)
                    <tr>
                        <td>
                            @if($report->property)
                                <a href="{{ route('admin.properties.show', $report->property) }}">{{ $report->property->title }}</a>
                            @else
                                <span class="muted">Deleted listing</span>
                            @endif
                        </td>
                        <td>{{ ucwords(str_replace('_', ' ', $report->reason)) }}</td>
                        <td class="muted">{{ $report->description ?: '—' }}</td>
                        <td class="muted">{{ $report->reporter?->name ?? '—' }}</td>
                        <td class="muted">{{ $report->created_at->diffForHumans() }}</td>
                        <td><a href="{{ route('admin.reports.show', $report) }}" class="btn btn-sm">View</a></td>
                        <td>
                            @if($report->status === 'pending')
                                <form method="POST" action="{{ route('admin.reports.resolve', $report) }}">
                                    @csrf
                                    <input type="text" name="admin_notes" placeholder="Internal note (optional)" style="margin-bottom:6px">
                                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:8px">
                                        <input type="checkbox" name="archive_listing" value="1" style="width:auto">
                                        Also archive this listing
                                    </label>
                                    <div class="actions">
                                        <button type="submit" name="status" value="actioned" class="btn btn-sm btn-danger">Action</button>
                                        <button type="submit" name="status" value="dismissed" class="btn btn-sm">Dismiss</button>
                                    </div>
                                </form>
                            @else
                                <span class="badge-status st-{{ $report->status }}">{{ ucfirst($report->status) }}</span>
                                @if($report->admin_notes)
                                    <div class="muted" style="font-size:12px;margin-top:4px">{{ $report->admin_notes }}</div>
                                @endif
                            @endif
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $reports->links() }}</div>
        @endif
    </div>
@endsection
