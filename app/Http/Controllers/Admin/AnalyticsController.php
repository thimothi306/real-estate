<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        return view('admin.analytics.index', [
            'byCity' => $this->byCity(),
            'byType' => $this->byType(),
            'byRole' => $this->byRole(),
            'priceBands' => $this->priceBands(),
            'revenueByPurpose' => $this->revenueByPurpose(),
            'conversion' => $this->conversionFunnel(),
        ]);
    }

    protected function byCity(): array
    {
        return Property::select('city', DB::raw('count(*) as total'), DB::raw('avg(price) as avg_price'))
            ->published()
            ->groupBy('city')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($r) => ['name' => $r->city, 'total' => (int) $r->total, 'avg_price' => (float) $r->avg_price])
            ->all();
    }

    protected function byType(): array
    {
        return Property::select('property_type', DB::raw('count(*) as total'))
            ->published()
            ->groupBy('property_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['name' => ucwords(str_replace('_', ' ', $r->property_type)), 'total' => (int) $r->total])
            ->all();
    }

    protected function byRole(): array
    {
        return User::select('role', DB::raw('count(*) as total'))
            ->where('role', '!=', User::ROLE_ADMIN)
            ->groupBy('role')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['name' => ucwords(str_replace('_', ' ', $r->role)), 'total' => (int) $r->total])
            ->all();
    }

    /** Distribution across the price bands Indian buyers actually search in. */
    protected function priceBands(): array
    {
        $bands = [
            ['label' => 'Under ₹50 L', 'min' => 0, 'max' => 5000000],
            ['label' => '₹50 L – ₹1 Cr', 'min' => 5000000, 'max' => 10000000],
            ['label' => '₹1 – 2 Cr', 'min' => 10000000, 'max' => 20000000],
            ['label' => '₹2 – 5 Cr', 'min' => 20000000, 'max' => 50000000],
            ['label' => 'Above ₹5 Cr', 'min' => 50000000, 'max' => PHP_INT_MAX],
        ];

        return collect($bands)->map(fn ($band) => [
            'name' => $band['label'],
            'total' => Property::published()
                ->where('price', '>=', $band['min'])
                ->when($band['max'] !== PHP_INT_MAX, fn ($q) => $q->where('price', '<', $band['max']))
                ->count(),
        ])->all();
    }

    protected function revenueByPurpose(): array
    {
        return Payment::select('purpose', DB::raw('sum(amount) as total'), DB::raw('count(*) as payments'))
            ->where('status', 'completed')
            ->groupBy('purpose')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'name' => ucwords(str_replace('_', ' ', $r->purpose)),
                'total' => (float) $r->total,
                'payments' => (int) $r->payments,
            ])
            ->all();
    }

    /** Listing → inquiry → conversion, as raw counts plus a rate. */
    protected function conversionFunnel(): array
    {
        $published = Property::published()->count();
        $withLeads = Lead::distinct('property_id')->count('property_id');
        // 'closed' is the won state in the leads ENUM; there is no 'converted'.
        $converted = Lead::where('status', Lead::STATUS_WON)->count();
        $totalLeads = Lead::count();

        return [
            'published' => $published,
            'with_leads' => $withLeads,
            'total_leads' => $totalLeads,
            'converted' => $converted,
            'lead_rate' => $published > 0 ? round($withLeads / $published * 100, 1) : 0.0,
            'conversion_rate' => $totalLeads > 0 ? round($converted / $totalLeads * 100, 1) : 0.0,
        ];
    }
}
