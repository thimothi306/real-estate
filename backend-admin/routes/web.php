<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\OperationsController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PropertyController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Admin Panel
|--------------------------------------------------------------------------
| Server-rendered admin panel (Blade). The mobile app and public web app
| use routes/api.php instead; this panel talks to the models directly.
*/

Route::redirect('/', '/admin');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('login', [LoginController::class, 'login'])->name('login.submit')->middleware('throttle:login');

    Route::middleware('admin.web')->group(function () {
        Route::post('logout', [LoginController::class, 'logout'])->name('logout');

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('properties', [PropertyController::class, 'index'])->name('properties.index');
        Route::get('properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
        Route::post('properties/{property}/approve', [PropertyController::class, 'approve'])->name('properties.approve');
        Route::post('properties/{property}/reject', [PropertyController::class, 'reject'])->name('properties.reject');
        Route::post('properties/{property}/archive', [PropertyController::class, 'archive'])->name('properties.archive');
        Route::post('properties/{property}/verify', [PropertyController::class, 'verify'])->name('properties.verify');
        Route::delete('properties/{property}/verification/{verification}', [PropertyController::class, 'removeVerification'])
            ->name('properties.verification.destroy');

        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
        Route::post('reports/{report}/resolve', [ReportController::class, 'resolve'])->name('reports.resolve');

        Route::get('duplicates', [ReportController::class, 'duplicates'])->name('duplicates.index');
        Route::post('duplicates/{flag}/resolve', [ReportController::class, 'resolveDuplicate'])->name('duplicates.resolve');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate');

        Route::get('partners', [PartnerController::class, 'index'])->name('partners.index');
        Route::post('partners/{partner}/verify', [PartnerController::class, 'verify'])->name('partners.verify');
        Route::get('partners/documents/{document}/download', [PartnerController::class, 'downloadDocument'])->name('partners.documents.download');
        Route::post('partners/documents/{document}/review', [PartnerController::class, 'reviewDocument'])->name('partners.documents.review');

        // ---- Transactions ----
        Route::get('inquiries', [OperationsController::class, 'inquiries'])->name('inquiries.index');
        Route::post('inquiries/{lead}', [OperationsController::class, 'updateInquiry'])->name('inquiries.update');
        Route::get('visits', [OperationsController::class, 'visits'])->name('visits.index');
        Route::post('visits/{visit}', [OperationsController::class, 'updateVisit'])->name('visits.update');
        Route::get('payments', [OperationsController::class, 'payments'])->name('payments.index');

        // ---- Verification & services ----
        Route::get('verifications', [OperationsController::class, 'verifications'])->name('verifications.index');
        Route::get('services', [OperationsController::class, 'services'])->name('services.index');

        // ---- Marketing: banners shown in the mobile app and web site ----
        Route::get('banners', [BannerController::class, 'index'])->name('banners.index');
        Route::get('banners/create', [BannerController::class, 'create'])->name('banners.create');
        Route::post('banners', [BannerController::class, 'store'])->name('banners.store');
        Route::get('banners/{banner}/edit', [BannerController::class, 'edit'])->name('banners.edit');
        Route::post('banners/{banner}', [BannerController::class, 'update'])->name('banners.update');
        Route::post('banners/{banner}/toggle', [BannerController::class, 'toggle'])->name('banners.toggle');
        Route::delete('banners/{banner}', [BannerController::class, 'destroy'])->name('banners.destroy');

        // ---- Reporting ----
        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('logs', [OperationsController::class, 'logs'])->name('logs.index');
    });
});
