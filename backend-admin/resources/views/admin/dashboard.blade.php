@extends('admin.layouts.app')
@section('title', 'Dashboard')

@section('content')
    <div class="page-head">
        <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {{ auth()->user()->name ?? 'Admin' }}! Here's what's happening with Kavuri Estates.</p>
        </div>
        <div class="spacer"></div>
        <span class="btn">📅 Last 7 days</span>
    </div>

    {{-- KPI row --}}
    <div class="grid grid-5">
        @foreach($kpis as $kpi)
            <div class="kpi">
                <div class="kpi-ico" style="background: {{ $kpi['bg'] }}; color: {{ $kpi['fg'] }}">{{ $kpi['icon'] }}</div>
                <div style="min-width:0">
                    <div class="kpi-label">{{ $kpi['label'] }}</div>
                    <div class="kpi-value">{{ $kpi['value'] }}</div>
                    @if($kpi['delta'] !== null)
                        <div class="kpi-delta {{ $kpi['delta'] >= 0 ? 'up' : 'down' }}">
                            {{ $kpi['delta'] >= 0 ? '↑' : '↓' }} {{ abs($kpi['delta']) }}%
                            <span>vs last week</span>
                        </div>
                    @else
                        <div class="kpi-delta"><span>no prior data</span></div>
                    @endif
                </div>
            </div>
        @endforeach
    </div>

    {{-- Analytics + status + activity --}}
    <div class="grid grid-3-1">
        <div style="display:grid; grid-template-columns: 1.6fr 1fr; gap:18px;">
            {{-- Overview line chart --}}
            <div class="card" style="margin:0">
                <div class="card-header">
                    Overview Analytics
                    <span class="spacer"></span>
                    <span class="muted" style="font-size:12px">Last 7 days</span>
                </div>
                <div class="card-body">
                    @php
                        $sets = $series['sets'];
                        $peak = max(1, collect($sets)->flatMap(fn ($s) => $s['points'])->max());
                        $w = 100; $h = 42; // viewBox units
                    @endphp

                    <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:14px;">
                        @foreach($sets as $set)
                            <span class="legend-row" style="gap:6px">
                                <span class="legend-dot" style="background: {{ $set['color'] }}"></span>
                                <span class="legend-name">{{ $set['name'] }}</span>
                            </span>
                        @endforeach
                    </div>

                    <svg viewBox="0 0 {{ $w }} {{ $h }}" preserveAspectRatio="none"
                         style="width:100%; height:210px; overflow:visible" role="img"
                         aria-label="Daily users, properties, inquiries and visits over the last 7 days">
                        {{-- horizontal gridlines --}}
                        @for($g = 0; $g <= 4; $g++)
                            <line x1="0" y1="{{ $h * $g / 4 }}" x2="{{ $w }}" y2="{{ $h * $g / 4 }}"
                                  stroke="var(--border)" stroke-width="0.25" />
                        @endfor

                        @foreach($sets as $set)
                            @php
                                $pts = [];
                                $count = max(1, count($set['points']) - 1);
                                foreach ($set['points'] as $i => $value) {
                                    $x = $i / $count * $w;
                                    $y = $h - ($value / $peak * ($h - 3)) - 1.5;
                                    $pts[] = round($x, 2).','.round($y, 2);
                                }
                            @endphp
                            <polyline points="{{ implode(' ', $pts) }}" fill="none"
                                      stroke="{{ $set['color'] }}" stroke-width="0.7"
                                      stroke-linejoin="round" stroke-linecap="round"
                                      vector-effect="non-scaling-stroke" />
                            @foreach($set['points'] as $i => $value)
                                <circle cx="{{ round($i / $count * $w, 2) }}"
                                        cy="{{ round($h - ($value / $peak * ($h - 3)) - 1.5, 2) }}"
                                        r="0.7" fill="{{ $set['color'] }}" />
                            @endforeach
                        @endforeach
                    </svg>

                    <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:var(--muted)">
                        @foreach($series['labels'] as $label)
                            <span>{{ $label }}</span>
                        @endforeach
                    </div>
                </div>
            </div>

            {{-- Property status donut --}}
            <div class="card" style="margin:0">
                <div class="card-header">Property Status</div>
                <div class="card-body">
                    @php
                        $radius = 15.9155; $circumference = 2 * M_PI * $radius; $offset = 0;
                    @endphp
                    <div style="display:flex; justify-content:center; margin-bottom:16px">
                        <div class="donut">
                            <svg viewBox="0 0 42 42" style="width:100%; height:100%; transform: rotate(-90deg)">
                                <circle cx="21" cy="21" r="{{ $radius }}" fill="none" stroke="var(--surface-alt)" stroke-width="5" />
                                @foreach($statusBreakdown['rows'] as $row)
                                    @php
                                        $dash = $row['percent'] / 100 * $circumference;
                                        $thisOffset = $offset;
                                        $offset += $dash;
                                    @endphp
                                    <circle cx="21" cy="21" r="{{ $radius }}" fill="none"
                                            stroke="{{ $row['color'] }}" stroke-width="5"
                                            stroke-dasharray="{{ round($dash, 3) }} {{ round($circumference - $dash, 3) }}"
                                            stroke-dashoffset="{{ round(-$thisOffset, 3) }}" />
                                @endforeach
                            </svg>
                            <div class="donut-center">
                                <span class="donut-total">{{ number_format($statusBreakdown['total']) }}</span>
                                <span class="donut-caption">Total</span>
                            </div>
                        </div>
                    </div>

                    <div class="legend">
                        @foreach($statusBreakdown['rows'] as $row)
                            <div class="legend-row">
                                <span class="legend-dot" style="background: {{ $row['color'] }}"></span>
                                <span class="legend-name">{{ $row['label'] }}</span>
                                <span class="legend-val">{{ number_format($row['value']) }} ({{ $row['percent'] }}%)</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        {{-- Recent activity --}}
        <div class="card" style="margin:0">
            <div class="card-header">
                Recent Activity
                <span class="spacer"></span>
                <a href="{{ route('admin.logs.index') }}">View All</a>
            </div>
            <div class="feed">
                @forelse($activity as $event)
                    <div class="feed-item">
                        <div class="feed-ico" style="background: {{ $event['bg'] }}">{{ $event['icon'] }}</div>
                        <div class="feed-text">
                            {{ $event['text'] }}
                            <small>{{ $event['sub'] }}</small>
                        </div>
                        <div class="feed-time">{{ $event['at']?->diffForHumans(null, true) }}</div>
                    </div>
                @empty
                    <div class="empty">No activity yet.</div>
                @endforelse
            </div>
        </div>
    </div>

    {{-- Recent properties + alerts/quick actions --}}
    <div class="grid grid-3-1">
        <div class="card" style="margin:0">
            <div class="card-header">
                Recent Properties
                <span class="spacer"></span>
                <a href="{{ route('admin.properties.index') }}">View All</a>
            </div>
            @if($recentProperties->isEmpty())
                <div class="empty">No properties yet.</div>
            @else
                <table>
                    <thead>
                    <tr>
                        <th style="width:60px"></th>
                        <th>Property</th>
                        <th>Owner / Agent</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th style="width:70px"></th>
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($recentProperties as $property)
                        <tr>
                            <td>
                                @if($property->coverMedia)
                                    <img src="{{ $property->coverMedia->url }}" alt="" class="thumb">
                                @else
                                    <div class="thumb thumb-empty">🏠</div>
                                @endif
                            </td>
                            <td class="cell-strong">{{ \Illuminate\Support\Str::limit($property->title, 32) }}</td>
                            <td class="cell-sub">{{ $property->owner?->name ?? '—' }}</td>
                            <td class="cell-sub">{{ collect([$property->locality, $property->city])->filter()->join(', ') }}</td>
                            <td class="cell-strong">₹{{ number_format($property->price) }}</td>
                            <td>
                                <span class="badge-status st-{{ $property->status }}">
                                    {{ ucwords(str_replace('_', ' ', $property->status)) }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('admin.properties.show', $property) }}" class="btn btn-sm btn-icon" title="View">👁</a>
                            </td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div>
            <div class="card">
                <div class="card-header">System Alerts</div>
                <div class="feed">
                    @foreach($alerts as $alert)
                        @php
                            $tone = ['warning' => ['var(--warning-bg)', 'var(--warning)'], 'danger' => ['var(--danger-bg)', 'var(--danger)'], 'success' => ['var(--success-bg)', 'var(--success)']][$alert['tone']];
                        @endphp
                        <div class="feed-item">
                            <div class="feed-ico" style="background: {{ $tone[0] }}; color: {{ $tone[1] }}">{{ $alert['icon'] }}</div>
                            <div class="feed-text">
                                @if($alert['url'])
                                    <a href="{{ $alert['url'] }}">{{ $alert['text'] }}</a>
                                @else
                                    {{ $alert['text'] }}
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>

            <div class="card">
                <div class="card-header">Quick Actions</div>
                <div class="card-body">
                    <div class="qa-grid">
                        <a href="{{ route('admin.properties.index') }}" class="qa"><span class="qa-ico">🏠</span><span>Properties</span></a>
                        <a href="{{ route('admin.users.index') }}" class="qa"><span class="qa-ico">👤</span><span>Users</span></a>
                        <a href="{{ route('admin.banners.create') }}" class="qa"><span class="qa-ico">🖼</span><span>Add Banner</span></a>
                        <a href="{{ route('admin.verifications.index') }}" class="qa"><span class="qa-ico">✔</span><span>Verify</span></a>
                        <a href="{{ route('admin.payments.index') }}" class="qa"><span class="qa-ico">₹</span><span>Payments</span></a>
                        <a href="{{ route('admin.analytics.index') }}" class="qa"><span class="qa-ico">📊</span><span>Analytics</span></a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Bottom row: locations, agents, sources --}}
    <div class="grid grid-3">
        <div class="card" style="margin:0">
            <div class="card-header">
                Top Locations by Inquiries
                <span class="spacer"></span>
                <a href="{{ route('admin.inquiries.index') }}">View All</a>
            </div>
            <div class="card-body">
                @php $maxLoc = max(1, collect($topLocations)->max('total') ?? 1); @endphp
                @forelse($topLocations as $location)
                    <div class="bar-row">
                        <span class="bar-name" title="{{ $location['city'] }}">{{ $location['name'] }}</span>
                        <span class="bar-track">
                            <span class="bar-fill" style="width: {{ $location['total'] / $maxLoc * 100 }}%; background: var(--purple)"></span>
                        </span>
                        <span class="bar-val">{{ number_format($location['total']) }}</span>
                    </div>
                @empty
                    <p class="muted" style="margin:0">No inquiries recorded yet.</p>
                @endforelse
            </div>
        </div>

        <div class="card" style="margin:0">
            <div class="card-header">
                Top Performing Agents
                <span class="spacer"></span>
                <a href="{{ route('admin.users.index') }}">View All</a>
            </div>
            <div class="card-body">
                @forelse($topAgents as $index => $agent)
                    <div style="display:flex; align-items:center; gap:11px; margin-bottom:13px">
                        <span class="rank">{{ $index + 1 }}</span>
                        <span class="avatar-sm">{{ strtoupper(substr($agent->name, 0, 1)) }}</span>
                        <div style="flex:1; min-width:0">
                            <div class="cell-strong" style="font-size:13px">{{ $agent->name }}</div>
                            <div class="cell-sub">{{ $agent->inquiries }} inquiries</div>
                        </div>
                        <span class="badge-status st-published">{{ $agent->listings }} listings</span>
                    </div>
                @empty
                    <p class="muted" style="margin:0">No agent activity yet.</p>
                @endforelse
            </div>
        </div>

        <div class="card" style="margin:0">
            <div class="card-header">Inquiries by Source</div>
            <div class="card-body">
                @if(empty($leadSources['rows']))
                    <p class="muted" style="margin:0">No inquiries recorded yet.</p>
                @else
                    @php $offset2 = 0; @endphp
                    <div class="donut-wrap">
                        <div class="donut" style="width:140px;height:140px">
                            <svg viewBox="0 0 42 42" style="width:100%;height:100%;transform:rotate(-90deg)">
                                <circle cx="21" cy="21" r="{{ $radius }}" fill="none" stroke="var(--surface-alt)" stroke-width="5" />
                                @foreach($leadSources['rows'] as $row)
                                    @php
                                        $dash2 = $row['percent'] / 100 * $circumference;
                                        $thisOffset2 = $offset2;
                                        $offset2 += $dash2;
                                    @endphp
                                    <circle cx="21" cy="21" r="{{ $radius }}" fill="none"
                                            stroke="{{ $row['color'] }}" stroke-width="5"
                                            stroke-dasharray="{{ round($dash2, 3) }} {{ round($circumference - $dash2, 3) }}"
                                            stroke-dashoffset="{{ round(-$thisOffset2, 3) }}" />
                                @endforeach
                            </svg>
                            <div class="donut-center">
                                <span class="donut-total">{{ number_format($leadSources['total']) }}</span>
                                <span class="donut-caption">Total</span>
                            </div>
                        </div>
                        <div class="legend" style="flex:1; min-width:130px">
                            @foreach($leadSources['rows'] as $row)
                                <div class="legend-row">
                                    <span class="legend-dot" style="background: {{ $row['color'] }}"></span>
                                    <span class="legend-name">{{ $row['label'] }}</span>
                                    <span class="legend-val">{{ $row['percent'] }}%</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection
