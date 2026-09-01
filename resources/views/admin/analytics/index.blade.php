@extends('admin.layouts.app')
@section('title', 'Analytics')

@php
    /** Reusable horizontal-bar block so every panel reads the same. */
    $barList = function (array $rows, string $color, string $suffix = '') {
        $max = max(1, collect($rows)->max('total') ?: 1);
        $out = '';
        foreach ($rows as $row) {
            $width = $row['total'] / $max * 100;
            $out .= '<div class="bar-row">'
                .'<span class="bar-name">'.e($row['name']).'</span>'
                .'<span class="bar-track"><span class="bar-fill" style="width:'.$width.'%; background:'.$color.'"></span></span>'
                .'<span class="bar-val">'.number_format($row['total']).$suffix.'</span>'
                .'</div>';
        }

        return $out ?: '<p class="muted" style="margin:0">No data yet.</p>';
    };
@endphp

@section('content')
    <div class="page-head">
        <div>
            <h1>Analytics</h1>
            <p>How listings, users, and revenue are distributed across the platform.</p>
        </div>
    </div>

    {{-- Conversion funnel --}}
    <div class="grid grid-4">
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--info-bg); color: var(--info)">🏠</div>
            <div>
                <div class="kpi-label">Published listings</div>
                <div class="kpi-value">{{ number_format($conversion['published']) }}</div>
            </div>
        </div>
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--purple-bg); color: var(--purple)">💬</div>
            <div>
                <div class="kpi-label">Listings with inquiries</div>
                <div class="kpi-value">{{ number_format($conversion['with_leads']) }}</div>
                <div class="kpi-delta up">{{ $conversion['lead_rate'] }}% <span>of published</span></div>
            </div>
        </div>
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--warning-bg); color: var(--warning)">📨</div>
            <div>
                <div class="kpi-label">Total inquiries</div>
                <div class="kpi-value">{{ number_format($conversion['total_leads']) }}</div>
            </div>
        </div>
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--success-bg); color: var(--success)">✓</div>
            <div>
                <div class="kpi-label">Converted</div>
                <div class="kpi-value">{{ number_format($conversion['converted']) }}</div>
                <div class="kpi-delta up">{{ $conversion['conversion_rate'] }}% <span>of inquiries</span></div>
            </div>
        </div>
    </div>

    <div class="grid grid-2">
        <div class="card" style="margin:0">
            <div class="card-header">Listings by City</div>
            <div class="card-body">
                @php
                    $cityRows = collect($byCity)->map(fn ($c) => ['name' => $c['name'], 'total' => $c['total']])->all();
                @endphp
                {!! $barList($cityRows, 'var(--info)') !!}
            </div>
        </div>

        <div class="card" style="margin:0">
            <div class="card-header">Listings by Property Type</div>
            <div class="card-body">
                {!! $barList($byType, 'var(--purple)') !!}
            </div>
        </div>
    </div>

    <div class="grid grid-2">
        <div class="card" style="margin:0">
            <div class="card-header">Price Distribution</div>
            <div class="card-body">
                {!! $barList($priceBands, 'var(--gold)') !!}
            </div>
        </div>

        <div class="card" style="margin:0">
            <div class="card-header">Users by Role</div>
            <div class="card-body">
                {!! $barList($byRole, 'var(--success)') !!}
            </div>
        </div>
    </div>

    <div class="grid grid-2">
        <div class="card" style="margin:0">
            <div class="card-header">Average Price by City</div>
            @if(empty($byCity))
                <div class="empty">No published listings yet.</div>
            @else
                <table>
                    <thead>
                    <tr><th>City</th><th>Listings</th><th>Average price</th></tr>
                    </thead>
                    <tbody>
                    @foreach($byCity as $city)
                        <tr>
                            <td class="cell-strong">{{ $city['name'] }}</td>
                            <td class="cell-sub">{{ number_format($city['total']) }}</td>
                            <td class="cell-strong">₹{{ number_format($city['avg_price']) }}</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="card" style="margin:0">
            <div class="card-header">Revenue by Purpose</div>
            @if(empty($revenueByPurpose))
                <div class="empty">No completed payments yet.</div>
            @else
                <table>
                    <thead>
                    <tr><th>Purpose</th><th>Payments</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                    @foreach($revenueByPurpose as $row)
                        <tr>
                            <td class="cell-strong">{{ $row['name'] }}</td>
                            <td class="cell-sub">{{ number_format($row['payments']) }}</td>
                            <td class="cell-strong">₹{{ number_format($row['total'], 2) }}</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    </div>
@endsection
