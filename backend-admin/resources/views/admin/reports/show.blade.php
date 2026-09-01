@extends('admin.layouts.app')
@section('title', 'Report #'.$report->id)

@section('content')
    <div class="page-head">
        <div>
            <h1>Report #{{ $report->id }}</h1>
            <p>{{ ucwords(str_replace('_', ' ', $report->reason)) }} · filed {{ $report->created_at->diffForHumans() }}</p>
        </div>
        <div class="spacer"></div>
        <a href="{{ route('admin.reports.index', ['status' => $report->status]) }}" class="btn">← Back to reports</a>
    </div>

    <div class="grid grid-2-1">
        <div>
            {{-- The reported listing --}}
            <div class="card">
                <div class="card-header">
                    Reported listing
                    <span class="spacer"></span>
                    <span class="badge-status st-{{ $report->status }}">{{ ucfirst($report->status) }}</span>
                </div>
                <div class="card-body">
                    @if($report->property)
                        <div style="display:flex; gap:16px">
                            @if($report->property->coverMedia)
                                <img src="{{ $report->property->coverMedia->url }}" alt=""
                                     style="width:120px;height:90px;border-radius:10px;object-fit:cover;border:1px solid var(--border);flex-shrink:0">
                            @else
                                <div class="thumb thumb-empty" style="width:120px;height:90px;border-radius:10px;flex-shrink:0">🏠</div>
                            @endif

                            <div style="flex:1">
                                <a href="{{ route('admin.properties.show', $report->property) }}" style="font-size:16px;font-weight:700">
                                    {{ $report->property->title }}
                                </a>
                                <div class="cell-sub" style="margin-top:4px">
                                    {{ collect([$report->property->locality, $report->property->city])->filter()->join(', ') }}
                                    · ₹{{ number_format($report->property->price) }}
                                </div>
                                <div style="margin-top:8px">
                                    <span class="badge-status st-{{ $report->property->status }}">
                                        {{ ucwords(str_replace('_', ' ', $report->property->status)) }}
                                    </span>
                                    @foreach($report->property->verifications as $badge)
                                        <span class="badge-status st-verified" style="margin-left:4px">
                                            {{ ucwords(str_replace('_', ' ', $badge->badge_type)) }}
                                        </span>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @else
                        <p class="muted">This listing has since been deleted.</p>
                    @endif
                </div>
            </div>

            {{-- The complaint itself --}}
            <div class="card">
                <div class="card-header">Complaint</div>
                <div class="card-body">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:14px">
                        <div>
                            <div class="cell-sub">Reason</div>
                            <div class="cell-strong">{{ ucwords(str_replace('_', ' ', $report->reason)) }}</div>
                        </div>
                        <div>
                            <div class="cell-sub">Reported by</div>
                            <div class="cell-strong">
                                {{ $report->reporter?->name ?? 'Unknown' }}
                                @if($report->reporter?->phone)
                                    <span class="muted" style="font-weight:400"> · {{ $report->reporter->phone }}</span>
                                @endif
                            </div>
                        </div>
                    </div>

                    @if($report->description)
                        <div class="cell-sub">Details given by the reporter</div>
                        <p style="margin:6px 0 0; font-size:13.5px">{{ $report->description }}</p>
                    @endif

                    @if($report->status !== 'pending')
                        <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border)">
                            <div class="cell-sub">
                                Resolved by {{ $report->reviewer?->name ?? 'an admin' }}
                                · {{ $report->reviewed_at?->diffForHumans() }}
                            </div>
                            @if($report->admin_notes)
                                <p style="margin:6px 0 0; font-size:13.5px">{{ $report->admin_notes }}</p>
                            @endif
                        </div>
                    @endif
                </div>
            </div>

            {{-- Take action --}}
            @if($report->status === 'pending')
                <div class="card">
                    <div class="card-header">Resolve this report</div>
                    <div class="card-body">
                        <form method="POST" action="{{ route('admin.reports.resolve', $report) }}">
                            @csrf
                            <div class="field" style="margin-bottom:12px">
                                <label for="admin_notes">Internal note (optional)</label>
                                <input id="admin_notes" type="text" name="admin_notes" style="width:100%"
                                       placeholder="What did you check, and why?">
                            </div>
                            @if($report->property)
                                <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:14px;cursor:pointer">
                                    <input type="checkbox" name="archive_listing" value="1" style="width:auto">
                                    Also archive this listing
                                </label>
                            @endif
                            <div style="display:flex; gap:10px">
                                <button type="submit" name="status" value="actioned" class="btn btn-danger">Take action</button>
                                <button type="submit" name="status" value="dismissed" class="btn">Dismiss</button>
                            </div>
                        </form>
                    </div>
                </div>
            @endif
        </div>

        {{-- Owner's track record --}}
        <div>
            @if($owner && $ownerStats)
                <div class="card">
                    <div class="card-header">
                        Listing owner
                        <span class="spacer"></span>
                        <a href="{{ route('admin.users.index', ['q' => $owner->email]) }}">View user →</a>
                    </div>
                    <div class="card-body">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
                            <span class="avatar-sm" style="width:40px;height:40px;font-size:15px">
                                {{ strtoupper(substr($owner->name, 0, 1)) }}
                            </span>
                            <div>
                                <div class="cell-strong" style="font-size:14.5px">{{ $owner->name }}</div>
                                <div class="cell-sub">{{ ucwords(str_replace('_', ' ', $owner->role)) }} · joined {{ $owner->created_at->format('d M Y') }}</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
                            <div class="kpi" style="padding:12px">
                                <div>
                                    <div class="kpi-label">Total listings</div>
                                    <div class="kpi-value" style="font-size:18px">{{ $ownerStats['listings_total'] }}</div>
                                    <div class="cell-sub">{{ $ownerStats['listings_published'] }} published</div>
                                </div>
                            </div>
                            <div class="kpi" style="padding:12px">
                                <div>
                                    <div class="kpi-label">Revenue brought</div>
                                    <div class="kpi-value" style="font-size:18px">₹{{ number_format($ownerStats['revenue']) }}</div>
                                    <div class="cell-sub">lifetime</div>
                                </div>
                            </div>
                            <div class="kpi" style="padding:12px">
                                <div>
                                    <div class="kpi-label">Inquiries received</div>
                                    <div class="kpi-value" style="font-size:18px">{{ $ownerStats['leads_received'] }}</div>
                                </div>
                            </div>
                            <div class="kpi" style="padding:12px">
                                <div>
                                    <div class="kpi-label">Prior reports</div>
                                    <div class="kpi-value" style="font-size:18px; color: {{ $ownerStats['prior_reports'] > 0 ? 'var(--danger)' : 'var(--success)' }}">
                                        {{ $ownerStats['prior_reports'] }}
                                    </div>
                                    <div class="cell-sub">against their listings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                @if($ownerStats['other_listings']->isNotEmpty())
                    <div class="card">
                        <div class="card-header">Other listings by this owner</div>
                        <table>
                            <tbody>
                            @foreach($ownerStats['other_listings'] as $listing)
                                <tr>
                                    <td style="width:52px">
                                        @if($listing->coverMedia)
                                            <img src="{{ $listing->coverMedia->url }}" alt="" class="thumb">
                                        @else
                                            <div class="thumb thumb-empty">🏠</div>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.properties.show', $listing) }}" style="font-weight:600; font-size:13px">
                                            {{ \Illuminate\Support\Str::limit($listing->title, 28) }}
                                        </a>
                                        <div class="cell-sub">{{ $listing->city }}</div>
                                    </td>
                                    <td style="text-align:right">
                                        <span class="badge-status st-{{ $listing->status }}">
                                            {{ ucwords(str_replace('_', ' ', $listing->status)) }}
                                        </span>
                                    </td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            @else
                <div class="card">
                    <div class="empty">No owner information available for this listing.</div>
                </div>
            @endif
        </div>
    </div>
@endsection
