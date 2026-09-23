@extends('admin.layouts.app')
@section('title', 'Service partners')

@section('content')
    <div class="card">
        <div class="card-body">
            <form method="GET" action="{{ route('admin.partners.index') }}" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status" onchange="this.form.submit()">
                        @foreach(['pending', 'verified'] as $option)
                            <option value="{{ $option }}" @selected($status === $option)>{{ ucfirst($option) }}</option>
                        @endforeach
                    </select>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($partners->total()) }} {{ $status }} partner{{ $partners->total() === 1 ? '' : 's' }}</div>

        @if($partners->isEmpty())
            <div class="empty">No {{ $status }} partner profiles.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>Business</th>
                    <th>Account</th>
                    <th>Role</th>
                    <th>Categories</th>
                    <th>Rating</th>
                    <th>Documents</th>
                    <th style="width:140px">Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($partners as $partner)
                    <tr>
                        <td>
                            {{ $partner->business_name }}
                            @if($partner->bio)
                                <div class="muted" style="font-size:12px;margin-top:2px">{{ \Illuminate\Support\Str::limit($partner->bio, 80) }}</div>
                            @endif
                        </td>
                        <td class="muted">{{ $partner->user->name }} · {{ $partner->user->phone }}</td>
                        <td class="muted">{{ ucwords(str_replace('_', ' ', $partner->user->role)) }}</td>
                        <td class="muted">{{ $partner->categories->pluck('name')->join(', ') ?: '—' }}</td>
                        <td class="muted">
                            @if($partner->rating_count)
                                {{ number_format($partner->rating_avg, 1) }} ★ ({{ $partner->rating_count }}) · {{ $partner->total_completed }} done
                            @else
                                No reviews yet
                            @endif
                        </td>
                        <td>
                            @if($partner->documents->isEmpty())
                                <span class="muted">None uploaded</span>
                            @else
                                @foreach($partner->documents as $document)
                                    <div style="margin-bottom:6px;white-space:nowrap">
                                        <a href="{{ route('admin.partners.documents.download', $document) }}" target="_blank">{{ ucwords(str_replace('_', ' ', $document->type)) }}</a>
                                        @if($document->status === 'pending')
                                            <span class="badge-status st-pending">Pending</span>
                                            <form method="POST" action="{{ route('admin.partners.documents.review', $document) }}" style="display:inline">
                                                @csrf
                                                <input type="hidden" name="status" value="approved">
                                                <button type="submit" class="btn btn-sm btn-success">Approve</button>
                                            </form>
                                            <button type="button" class="btn btn-sm btn-danger" onclick="document.getElementById('reject-{{ $document->id }}').style.display='inline'">Reject</button>
                                            <form id="reject-{{ $document->id }}" method="POST" action="{{ route('admin.partners.documents.review', $document) }}" style="display:none">
                                                @csrf
                                                <input type="hidden" name="status" value="rejected">
                                                <input type="text" name="rejection_reason" placeholder="Reason" required style="width:120px">
                                                <button type="submit" class="btn btn-sm btn-danger">Confirm</button>
                                            </form>
                                        @elseif($document->status === 'approved')
                                            <span class="badge-status st-active">Approved</span>
                                        @else
                                            <span class="badge-status st-rejected" title="{{ $document->rejection_reason }}">Rejected</span>
                                        @endif
                                    </div>
                                @endforeach
                            @endif
                        </td>
                        <td>
                            @if(!$partner->is_verified)
                                <form method="POST" action="{{ route('admin.partners.verify', $partner) }}">
                                    @csrf
                                    <button type="submit" class="btn btn-sm btn-success">Verify</button>
                                </form>
                            @else
                                <span class="badge-status st-active">Verified</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $partners->links() }}</div>
        @endif
    </div>
@endsection
