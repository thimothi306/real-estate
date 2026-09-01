@extends('admin.layouts.app')
@section('title', 'Review listing')

@section('content')
    <div class="card">
        <div class="card-header">
            <div>
                {{ $property->title }}
                <span class="badge-status st-{{ $property->status }}" style="margin-left:8px">
                    {{ ucwords(str_replace('_', ' ', $property->status)) }}
                </span>
            </div>
            <a href="{{ route('admin.properties.index') }}" class="btn btn-sm">Back to listings</a>
        </div>
        <div class="card-body">
            @if($property->rejection_reason)
                <div class="alert alert-danger">
                    <strong>Rejection reason:</strong> {{ $property->rejection_reason }}
                </div>
            @endif

            <table>
                <tbody>
                <tr><th style="width:210px">Owner</th><td>{{ $property->owner?->name }} <span class="muted">({{ $property->owner?->phone }})</span></td></tr>
                <tr><th>Type</th><td>{{ ucwords(str_replace('_', ' ', $property->property_type)) }} — for {{ $property->listing_type }}</td></tr>
                <tr><th>Price</th><td>₹{{ number_format($property->price) }}</td></tr>
                @if($property->rent_price)
                    <tr><th>Rent</th><td>₹{{ number_format($property->rent_price) }}</td></tr>
                @endif
                <tr><th>Location</th><td>{{ collect([$property->address_line, $property->locality, $property->city, $property->state, $property->pincode])->filter()->implode(', ') }}</td></tr>
                <tr><th>Size</th><td>{{ $property->area_sqft ? number_format($property->area_sqft).' sq ft' : '—' }}</td></tr>
                <tr><th>Bedrooms / Bathrooms</th><td>{{ $property->bedrooms ?? '—' }} / {{ $property->bathrooms ?? '—' }}</td></tr>
                <tr><th>Facing</th><td>{{ $property->facing ? ucwords(str_replace('_', ' ', $property->facing)) : '—' }}</td></tr>
                <tr><th>Furnishing</th><td>{{ $property->furnishing_status ? ucwords(str_replace('_', ' ', $property->furnishing_status)) : '—' }}</td></tr>
                <tr><th>RERA</th><td>{{ $property->is_rera_approved ? ($property->rera_number ?: 'Approved') : 'Not approved' }}</td></tr>
                <tr><th>Amenities</th><td>{{ $property->amenities->pluck('name')->implode(', ') ?: '—' }}</td></tr>
                <tr><th>Description</th><td>{{ $property->description ?: '—' }}</td></tr>
                <tr><th>Views / Leads</th><td>{{ number_format($property->views_count) }} / {{ number_format($property->leads_count) }}</td></tr>
                <tr><th>Submitted</th><td>{{ $property->updated_at->format('d M Y, H:i') }}</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    @if($property->media->isNotEmpty())
        <div class="card">
            <div class="card-header">Media ({{ $property->media->count() }})</div>
            <div class="card-body">
                <div style="display:flex;flex-wrap:wrap;gap:10px">
                    @foreach($property->media as $item)
                        <div style="width:170px">
                            @if($item->type === 'image')
                                <a href="{{ $item->url }}" target="_blank" rel="noopener">
                                    <img src="{{ $item->url }}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">
                                </a>
                            @else
                                <a href="{{ $item->url }}" target="_blank" rel="noopener" class="btn btn-sm" style="display:block;text-align:center">
                                    {{ ucwords(str_replace('_', ' ', $item->type)) }}
                                </a>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    @endif

    @if($property->reports->isNotEmpty())
        <div class="card">
            <div class="card-header">Reports on this listing ({{ $property->reports->count() }})</div>
            <table>
                <thead><tr><th>Reason</th><th>Detail</th><th>Reported by</th><th>Status</th><th>When</th></tr></thead>
                <tbody>
                @foreach($property->reports as $report)
                    <tr>
                        <td>{{ ucwords(str_replace('_', ' ', $report->reason)) }}</td>
                        <td class="muted">{{ $report->description ?: '—' }}</td>
                        <td class="muted">{{ $report->reporter?->name ?? '—' }}</td>
                        <td><span class="badge-status st-{{ $report->status }}">{{ ucfirst($report->status) }}</span></td>
                        <td class="muted">{{ $report->created_at->diffForHumans() }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    @endif

    <div class="card">
        <div class="card-header">Verification badges</div>
        <div class="card-body">
            @if($property->verifications->isNotEmpty())
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
                    @foreach($property->verifications as $verification)
                        <span class="badge-status st-published" style="display:inline-flex;align-items:center;gap:8px">
                            {{ ucwords(str_replace('_', ' ', $verification->badge_type)) }}
                            <form method="POST" action="{{ route('admin.properties.verification.destroy', [$property, $verification]) }}" class="inline">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm" style="padding:0 5px;line-height:1.4">×</button>
                            </form>
                        </span>
                    @endforeach
                </div>
            @else
                <p class="muted" style="margin-top:0">No badges applied yet.</p>
            @endif

            <form method="POST" action="{{ route('admin.properties.verify', $property) }}" class="filters">
                @csrf
                <div class="field">
                    <label for="badge_type">Add badge</label>
                    <select id="badge_type" name="badge_type" required>
                        @foreach(['document_verified', 'owner_verified', 'video_verified', 'gps_verified', 'government_record_checked'] as $badge)
                            <option value="{{ $badge }}">{{ ucwords(str_replace('_', ' ', $badge)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div><button type="submit" class="btn">Apply badge</button></div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">Moderation</div>
        <div class="card-body">
            @if($property->status === 'pending_review')
                <form method="POST" action="{{ route('admin.properties.approve', $property) }}" class="inline">
                    @csrf
                    <button type="submit" class="btn btn-success">Approve &amp; publish</button>
                </form>

                <form method="POST" action="{{ route('admin.properties.reject', $property) }}" style="margin-top:16px">
                    @csrf
                    <label for="reason" style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:4px">Rejection reason (sent to the owner)</label>
                    <textarea id="reason" name="reason" rows="2" required placeholder="Explain what needs fixing…" style="max-width:520px"></textarea>
                    <div style="margin-top:8px">
                        <button type="submit" class="btn btn-danger">Reject listing</button>
                    </div>
                </form>
            @elseif($property->status === 'published')
                <p class="muted" style="margin-top:0">This listing is live. Archiving removes it from public search immediately.</p>
                <form method="POST" action="{{ route('admin.properties.archive', $property) }}" class="inline"
                      onsubmit="return confirm('Archive this listing? It will no longer appear in public search.')">
                    @csrf
                    <button type="submit" class="btn btn-danger">Archive listing</button>
                </form>
            @else
                <p class="muted" style="margin:0">
                    No moderation actions available for a listing with status
                    &ldquo;{{ ucwords(str_replace('_', ' ', $property->status)) }}&rdquo;.
                </p>
            @endif
        </div>
    </div>
@endsection
