<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\PropertyReport;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $weekStart = $now->copy()->subDays(7);
        $prevWeekStart = $now->copy()->subDays(14);

        return view('admin.dashboard', [
            'kpis' => $this->kpis($weekStart, $prevWeekStart),
            'series' => $this->overviewSeries(),
            'statusBreakdown' => $this->statusBreakdown(),
            'leadSources' => $this->leadSources(),
            'topLocations' => $this->topLocations(),
            'topAgents' => $this->topAgents(),
            'recentProperties' => $this->recentProperties(),
            'activity' => $this->recentActivity(),
            'alerts' => $this->systemAlerts(),
        ]);
    }

    /**
     * Headline numbers with a week-over-week delta. Each delta compares the
     * last 7 days against the 7 before that, so "vs last week" is literal.
     */
    protected function kpis(Carbon $weekStart, Carbon $prevWeekStart): array
    {
        $delta = function (int $current, int $previous): ?float {
            if ($previous === 0) {
                return $current > 0 ? 100.0 : null;
            }

            return round((($current - $previous) / $previous) * 100, 1);
        };

        $countIn = fn (string $model, Carbon $from, Carbon $to) => $model::whereBetween('created_at', [$from, $to])->count();

        $revenueTotal = (float) Payment::where('status', Payment::STATUS_COMPLETED)->sum('amount');
        $revenueThis = (float) Payment::where('status', Payment::STATUS_COMPLETED)
            ->whereBetween('created_at', [$weekStart, now()])->sum('amount');
        $revenuePrev = (float) Payment::where('status', Payment::STATUS_COMPLETED)
            ->whereBetween('created_at', [$prevWeekStart, $weekStart])->sum('amount');

        return [
            [
                'label' => 'Total Users', 'value' => number_format(User::where('role', '!=', User::ROLE_ADMIN)->count()),
                'icon' => '👥', 'bg' => 'var(--purple-bg)', 'fg' => 'var(--purple)',
                'delta' => $delta($countIn(User::class, $weekStart, $now = now()), $countIn(User::class, $prevWeekStart, $weekStart)),
            ],
            [
                'label' => 'Total Properties', 'value' => number_format(Property::count()),
                'icon' => '🏠', 'bg' => 'var(--info-bg)', 'fg' => 'var(--info)',
                'delta' => $delta($countIn(Property::class, $weekStart, $now), $countIn(Property::class, $prevWeekStart, $weekStart)),
            ],
            [
                'label' => 'Active Inquiries', 'value' => number_format(Lead::count()),
                'icon' => '💬', 'bg' => 'var(--success-bg)', 'fg' => 'var(--success)',
                'delta' => $delta($countIn(Lead::class, $weekStart, $now), $countIn(Lead::class, $prevWeekStart, $weekStart)),
            ],
            [
                'label' => 'Visit Requests', 'value' => number_format(Visit::count()),
                'icon' => '📅', 'bg' => 'var(--warning-bg)', 'fg' => 'var(--warning)',
                'delta' => $delta($countIn(Visit::class, $weekStart, $now), $countIn(Visit::class, $prevWeekStart, $weekStart)),
            ],
            [
                'label' => 'Total Revenue', 'value' => $this->money($revenueTotal),
                'icon' => '₹', 'bg' => 'var(--danger-bg)', 'fg' => 'var(--danger)',
                'delta' => $revenuePrev > 0 ? round((($revenueThis - $revenuePrev) / $revenuePrev) * 100, 1) : ($revenueThis > 0 ? 100.0 : null),
            ],
        ];
    }

    /** Indian-format short money: 24.58 L, 1.2 Cr. */
    protected function money(float $value): string
    {
        if ($value >= 10000000) {
            return '₹'.rtrim(rtrim(number_format($value / 10000000, 2), '0'), '.').' Cr';
        }
        if ($value >= 100000) {
            return '₹'.rtrim(rtrim(number_format($value / 100000, 2), '0'), '.').' L';
        }

        return '₹'.number_format($value);
    }

    /**
     * Daily counts for the last 7 days across four metrics. Grouped in SQL
     * per metric (4 queries total) rather than one query per day.
     */
    protected function overviewSeries(): array
    {
        $days = collect(range(6, 0))->map(fn ($back) => now()->subDays($back)->toDateString());

        $daily = function (string $model): array {
            return $model::query()
                ->where('created_at', '>=', now()->subDays(7)->startOfDay())
                ->select(DB::raw('DATE(created_at) as day'), DB::raw('count(*) as total'))
                ->groupBy('day')
                ->pluck('total', 'day')
                ->toArray();
        };

        $sets = [
            'Users' => ['data' => $daily(User::class), 'color' => 'var(--purple)'],
            'Properties' => ['data' => $daily(Property::class), 'color' => 'var(--info)'],
            'Inquiries' => ['data' => $daily(Lead::class), 'color' => 'var(--success)'],
            'Visits' => ['data' => $daily(Visit::class), 'color' => 'var(--warning)'],
        ];

        $result = [];
        foreach ($sets as $name => $set) {
            $result[] = [
                'name' => $name,
                'color' => $set['color'],
                'points' => $days->map(fn ($day) => (int) ($set['data'][$day] ?? 0))->all(),
            ];
        }

        return ['labels' => $days->map(fn ($d) => Carbon::parse($d)->format('M j'))->all(), 'sets' => $result];
    }

    protected function statusBreakdown(): array
    {
        $counts = Property::select('status', DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status');
        $total = max(1, $counts->sum());

        $palette = [
            'published' => 'var(--info)',
            'pending_review' => 'var(--warning)',
            'draft' => 'var(--faint)',
            'rejected' => 'var(--danger)',
            'sold' => 'var(--success)',
            'rented' => 'var(--purple)',
            'archived' => 'var(--muted)',
        ];

        $rows = [];
        foreach ($palette as $status => $color) {
            $value = (int) ($counts[$status] ?? 0);
            if ($value === 0) {
                continue;
            }
            $rows[] = [
                'label' => ucwords(str_replace('_', ' ', $status)),
                'value' => $value,
                'percent' => round($value / $total * 100, 1),
                'color' => $color,
            ];
        }

        return ['rows' => $rows, 'total' => $counts->sum()];
    }

    protected function leadSources(): array
    {
        $counts = Lead::select('type', DB::raw('count(*) as total'))->groupBy('type')->pluck('total', 'type');
        $total = max(1, $counts->sum());

        $palette = [
            'message' => 'var(--info)',
            'call' => 'var(--success)',
            'callback_request' => 'var(--warning)',
            'whatsapp' => 'var(--purple)',
        ];

        $rows = [];
        foreach ($counts as $type => $value) {
            $rows[] = [
                'label' => ucwords(str_replace('_', ' ', $type)),
                'value' => (int) $value,
                'percent' => round($value / $total * 100, 1),
                'color' => $palette[$type] ?? 'var(--faint)',
            ];
        }

        usort($rows, fn ($a, $b) => $b['value'] <=> $a['value']);

        return ['rows' => $rows, 'total' => $counts->sum()];
    }

    protected function topLocations(): array
    {
        return Lead::query()
            ->join('properties', 'leads.property_id', '=', 'properties.id')
            ->select('properties.locality', 'properties.city', DB::raw('count(*) as total'))
            ->whereNotNull('properties.locality')
            ->groupBy('properties.locality', 'properties.city')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => ['name' => $row->locality, 'city' => $row->city, 'total' => (int) $row->total])
            ->all();
    }

    /** Agents and builders ranked by inquiries received on their listings. */
    protected function topAgents(): array
    {
        return User::query()
            ->whereIn('users.role', [User::ROLE_AGENT, User::ROLE_BUILDER, User::ROLE_OWNER])
            ->join('properties', 'properties.owner_id', '=', 'users.id')
            ->leftJoin('leads', 'leads.property_id', '=', 'properties.id')
            ->select('users.id', 'users.name', 'users.role', DB::raw('count(leads.id) as inquiries'), DB::raw('count(distinct properties.id) as listings'))
            ->groupBy('users.id', 'users.name', 'users.role')
            ->orderByDesc('inquiries')
            ->limit(4)
            ->get()
            ->all();
    }

    protected function recentProperties()
    {
        return Property::with(['owner:id,name,role', 'coverMedia'])->latest()->limit(5)->get();
    }

    /** A merged, time-ordered feed from the events admins care about. */
    protected function recentActivity(): array
    {
        $events = [];

        foreach (Property::with('owner:id,name')->latest()->limit(4)->get() as $property) {
            $events[] = [
                'icon' => '🏠', 'bg' => 'var(--info-bg)',
                'text' => 'New property "'.$property->title.'" added',
                'sub' => 'by '.($property->owner->name ?? 'Unknown'),
                'at' => $property->created_at,
            ];
        }

        foreach (User::where('role', '!=', User::ROLE_ADMIN)->latest()->limit(3)->get() as $user) {
            $events[] = [
                'icon' => '👤', 'bg' => 'var(--purple-bg)',
                'text' => 'User '.$user->name.' registered',
                'sub' => ucwords(str_replace('_', ' ', $user->role)),
                'at' => $user->created_at,
            ];
        }

        foreach (Visit::with('property:id,title')->latest()->limit(3)->get() as $visit) {
            $events[] = [
                'icon' => '📅', 'bg' => 'var(--warning-bg)',
                'text' => 'Visit scheduled for "'.($visit->property->title ?? 'a property').'"',
                'sub' => optional($visit->scheduled_at)->format('d M, g:i A'),
                'at' => $visit->created_at,
            ];
        }

        foreach (Payment::where('status', Payment::STATUS_COMPLETED)->with('user:id,name')->latest()->limit(2)->get() as $payment) {
            $events[] = [
                'icon' => '₹', 'bg' => 'var(--success-bg)',
                'text' => 'Payment received from '.($payment->user->name ?? 'a user'),
                'sub' => '₹'.number_format((float) $payment->amount),
                'at' => $payment->created_at,
            ];
        }

        usort($events, fn ($a, $b) => ($b['at']?->timestamp ?? 0) <=> ($a['at']?->timestamp ?? 0));

        return array_slice($events, 0, 8);
    }

    protected function systemAlerts(): array
    {
        $alerts = [];

        $pending = Property::where('status', Property::STATUS_PENDING_REVIEW)->count();
        if ($pending > 0) {
            $alerts[] = ['tone' => 'warning', 'icon' => '⚠', 'text' => "{$pending} properties pending verification", 'url' => route('admin.verifications.index')];
        }

        $openReports = PropertyReport::where('status', 'pending')->count();
        if ($openReports > 0) {
            $alerts[] = ['tone' => 'danger', 'icon' => '🚩', 'text' => "{$openReports} listing reports need review", 'url' => route('admin.reports.index')];
        }

        $failedPayments = Payment::where('status', Payment::STATUS_FAILED)->count();
        if ($failedPayments > 0) {
            $alerts[] = ['tone' => 'danger', 'icon' => '⊘', 'text' => "{$failedPayments} payments failed", 'url' => route('admin.payments.index')];
        }

        $unverifiedPartners = \App\Models\PartnerProfile::where('is_verified', false)->count();
        if ($unverifiedPartners > 0) {
            $alerts[] = ['tone' => 'warning', 'icon' => '🤝', 'text' => "{$unverifiedPartners} partners awaiting verification", 'url' => route('admin.partners.index')];
        }

        if (empty($alerts)) {
            $alerts[] = ['tone' => 'success', 'icon' => '✓', 'text' => 'All clear — nothing needs attention', 'url' => null];
        }

        return $alerts;
    }
}
