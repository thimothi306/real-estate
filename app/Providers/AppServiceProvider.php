<?php

namespace App\Providers;

use App\Models\Lead;
use App\Models\PartnerProfile;
use App\Models\Property;
use App\Models\PropertyDuplicateFlag;
use App\Models\PropertyReport;
use App\Models\Visit;
use App\Observers\PropertyObserver;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Property::observe(PropertyObserver::class);

        // Default pagination views are Tailwind-based; the admin panel ships
        // its own plain CSS, so use the framework-agnostic simple views.
        Paginator::useBootstrapFour();

        // Sidebar badge counts for the admin panel layout.
        View::composer('admin.layouts.app', function ($view) {
            // Sidebar badge counts. Kept to cheap indexed COUNTs so every
            // admin page render stays fast.
            $view->with([
                'pendingCount' => Property::where('status', Property::STATUS_PENDING_REVIEW)->count(),
                'pendingPropertyCount' => Property::where('status', Property::STATUS_PENDING_REVIEW)->count(),
                'reportCount' => PropertyReport::where('status', 'pending')->count(),
                'openReportCount' => PropertyReport::where('status', 'pending')->count(),
                'duplicateCount' => PropertyDuplicateFlag::where('status', 'pending')->count(),
                'pendingPartnerCount' => PartnerProfile::where('is_verified', false)->count(),
                'newLeadCount' => Lead::where('status', 'new')->count(),
                'pendingVisitCount' => Visit::where('status', 'pending')->count(),
            ]);
        });
    }
}
