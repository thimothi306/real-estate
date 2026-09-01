@extends('admin.layouts.app')
@section('title', 'Payments')

@section('content')
    <div class="page-head">
        <div>
            <h1>Payments</h1>
            <p>Featured listings, subscriptions, and other platform revenue.</p>
        </div>
    </div>

    <div class="grid grid-3">
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--success-bg); color: var(--success)">₹</div>
            <div>
                <div class="kpi-label">Collected</div>
                <div class="kpi-value">₹{{ number_format($totals['collected']) }}</div>
            </div>
        </div>
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--warning-bg); color: var(--warning)">⏳</div>
            <div>
                <div class="kpi-label">Pending</div>
                <div class="kpi-value">₹{{ number_format($totals['pending']) }}</div>
            </div>
        </div>
        <div class="kpi">
            <div class="kpi-ico" style="background: var(--danger-bg); color: var(--danger)">⊘</div>
            <div>
                <div class="kpi-label">Failed attempts</div>
                <div class="kpi-value">{{ number_format($totals['failed']) }}</div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <form method="GET" class="filters">
                <div class="field">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="">All statuses</option>
                        @foreach(['pending', 'completed', 'failed', 'refunded'] as $status)
                            <option value="{{ $status }}" @selected(($filters['status'] ?? '') === $status)>{{ ucfirst($status) }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="purpose">Purpose</label>
                    <select id="purpose" name="purpose">
                        <option value="">All purposes</option>
                        @foreach(['featured_listing', 'subscription'] as $purpose)
                            <option value="{{ $purpose }}" @selected(($filters['purpose'] ?? '') === $purpose)>{{ ucwords(str_replace('_', ' ', $purpose)) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <button type="submit" class="btn btn-primary">Filter</button>
                    <a href="{{ route('admin.payments.index') }}" class="btn">Reset</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">{{ number_format($payments->total()) }} payments</div>

        @if($payments->isEmpty())
            <div class="empty">No payments match these filters.</div>
        @else
            <table>
                <thead>
                <tr>
                    <th>User</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Gateway ref</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                @foreach($payments as $payment)
                    <tr>
                        <td>
                            <div class="cell-strong">{{ $payment->user?->name ?? '—' }}</div>
                            <div class="cell-sub">{{ $payment->user?->email }}</div>
                        </td>
                        <td class="cell-sub">{{ ucwords(str_replace('_', ' ', $payment->purpose)) }}</td>
                        <td class="cell-strong">₹{{ number_format((float) $payment->amount, 2) }}</td>
                        <td>
                            <span class="badge-status st-{{ $payment->status }}">{{ ucfirst($payment->status) }}</span>
                            @if($payment->failure_reason)
                                <div class="cell-sub" title="{{ $payment->failure_reason }}">
                                    {{ \Illuminate\Support\Str::limit($payment->failure_reason, 30) }}
                                </div>
                            @endif
                        </td>
                        <td class="cell-sub">{{ $payment->gateway_order_id ?? '—' }}</td>
                        <td class="cell-sub">{{ $payment->created_at?->format('d M Y, g:i A') }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>

            <div class="pagination">{{ $payments->links() }}</div>
        @endif
    </div>
@endsection
