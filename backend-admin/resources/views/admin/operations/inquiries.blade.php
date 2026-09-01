@extends('admin.layouts.app')
@section('title', 'Inquiries')

@section('content')
    <div class="page-head">
        <div>
            <h1>Inquiries</h1>
            <p>Every enquiry raised from the mobile app and web site.</p>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <form method="GET" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(\App\Models\Lead::STATUSES as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>{{ ucwords(str_replace("_", " ", $status)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="type">Channel</label>
                    <select id="type" name="type">
                        <option value="">All channels</option>
                        @foreach(['call', 'message', 'callback_request', 'whatsapp'] as $type)
                            <option value="{{ $type }}" @selected(($filters['type'] ?? '') === $type)>{{ ucwords(str_replace('_', ' ', $type)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.inquiries.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($leads->total()) }} inquiries</div>

        @if($leads->isEmpty())
            <div class="empty">No inquiries match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>From</th>
                    <th>Property</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th style="width:230px">Update</th>
                </tr>
                </thead>
                <tbody>
                @foreach($leads as $lead)
                    <tr>
                        <td>
                            <div class="cell-strong">{{ $lead->buyer?->name ?? 'Guest' }}</div>
                            <div class="cell-sub">{{ $lead->buyer?->phone }}</div>
                        </td>
                        <td>
                            @if($lead->property)
                                <a href="{{ route('admin.properties.show', $lead->property) }}">
                                    {{ \Illuminate\Support\Str::limit($lead->property->title, 30) }}
                                </a>
                                <div class="cell-sub">{{ collect([$lead->property->locality, $lead->property->city])->filter()->join(', ') }}</div>
                            @else
                                <span class="muted">—</span>
                            @endif
                        </td>
                        <td class="cell-sub">{{ ucwords(str_replace('_', ' ', $lead->type)) }}</td>
                        <td><span class="badge-status st-{{ $lead->status }}">{{ ucfirst($lead->status) }}</span></td>
                        <td class="cell-sub">{{ $lead->created_at?->diffForHumans() }}</td>
                        <td>
                            <form method="POST" action="{{ route('admin.inquiries.update', $lead) }}" style="display:flex;gap:6px">
                                @csrf
                                <select name="status" class="btn btn-sm" style="min-width:auto">
                                    @foreach(\App\Models\Lead::STATUSES as $status)
                                        <option value="{{ $status }}" @selected($lead->status === $status)>{{ ucwords(str_replace("_", " ", $status)) }}</option>
                                    @endforeach
                                </select>
                                <button type="submit" class="btn btn-sm btn-primary">Save</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $leads->links() }}</div>
        @endif
    </div>
@endsection
