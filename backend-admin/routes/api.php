<?php

use App\Http\Controllers\Api\V1\Admin\AdminPartnerController;
use App\Http\Controllers\Api\V1\Admin\AdminPropertyController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\AmenityController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\DeviceTokenController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\LifestyleTagController;
use App\Http\Controllers\Api\V1\GeoController;
use App\Http\Controllers\Api\V1\LoanOfferController;
use App\Http\Controllers\Api\V1\PropertyRequirementController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PartnerController;
use App\Http\Controllers\Api\V1\PartnerReviewController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\PropertyMediaController;
use App\Http\Controllers\Api\V1\PropertyReportController;
use App\Http\Controllers\Api\V1\RecentlyViewedController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SavedSearchController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceQuoteController;
use App\Http\Controllers\Api\V1\ServiceRequestController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\VisitController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| All routes are prefixed with /api/v1 and return a consistent JSON
| envelope: { success, message, data, meta? } — see App\Traits\ApiResponse.
*/

Route::prefix('v1')->group(function () {

    Route::get('health', [HealthController::class, 'index']);

    // ---- Auth (public, tightly rate-limited to resist brute force) ----
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
        Route::post('otp/send', [AuthController::class, 'sendOtp'])->middleware('throttle:otp');
        Route::post('otp/verify-registration', [AuthController::class, 'verifyRegistrationOtp'])->middleware('throttle:otp');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:otp');
        Route::post('password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:otp');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAllDevices']);
        });
    });

    // ---- Amenities (public, cached) ----
    Route::get('amenities', [AmenityController::class, 'index']);

    // ---- Lifestyle tags (public, cached) ----
    Route::get('lifestyle-tags', [LifestyleTagController::class, 'index']);

    // ---- Locations (public, cached) ----
    Route::get('locations/cities', [LocationController::class, 'cities']);
    Route::get('locations/localities', [LocationController::class, 'localities']);

    // ---- Geo (public, static data) — country/state cascading selector ----
    Route::get('geo/countries', [GeoController::class, 'countries']);
    Route::get('geo/states', [GeoController::class, 'states']);

    // ---- Community reviews (public read) ----
    Route::get('reviews', [ReviewController::class, 'index']);

    // ---- Service marketplace: categories, partner directory, plans (public) ----
    Route::get('service-categories', [ServiceCategoryController::class, 'index']);
    Route::get('partners', [PartnerController::class, 'directory']);
    Route::get('partners/{userId}', [PartnerController::class, 'show']);
    Route::get('subscription-plans', [SubscriptionPlanController::class, 'index']);

    // ---- Properties (public reads) ----
    // NOTE: /properties/compare must be registered before /properties/{slug}
    // or the {slug} wildcard would swallow "compare" as a slug value.
    Route::get('properties', [PropertyController::class, 'index']);
    Route::get('properties/compare', [PropertyController::class, 'compare']);
    Route::get('properties/category-counts', [PropertyController::class, 'categoryCounts']);
    Route::get('properties/{slug}', [PropertyController::class, 'show']);
    Route::get('properties/{property}/timeline', [PropertyController::class, 'timeline']);
    Route::get('properties/{property}/similar', [PropertyController::class, 'similar']);
    Route::get('properties/{property}/insights', [PropertyController::class, 'insights']);
    Route::get('properties/{property}/availability', [BookingController::class, 'availability']);

    // ---- Banners: admin-controlled content for the app and web site ----
    Route::get('banners', [BannerController::class, 'index']);
    Route::post('banners/{banner}/click', [BannerController::class, 'trackClick']);

    // ---- Home loans (public: browsable before sign-in) ----
    Route::get('loan-offers', [LoanOfferController::class, 'index']);
    Route::post('loan-offers/emi', [LoanOfferController::class, 'calculateEmi']);

    // ---- Buyer requirement capture ("Tell us what you need") — public lead-gen form ----
    Route::post('property-requirements', [PropertyRequirementController::class, 'store']);

    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::post('profile/change-password', [ProfileController::class, 'changePassword']);

        // Properties (owner/admin actions)
        Route::post('properties', [PropertyController::class, 'store']);
        Route::get('my/properties', [PropertyController::class, 'myProperties']);
        Route::put('properties/{property}', [PropertyController::class, 'update']);
        Route::delete('properties/{property}', [PropertyController::class, 'destroy']);
        Route::post('properties/{property}/submit-for-review', [PropertyController::class, 'submitForReview']);

        Route::post('properties/{property}/media', [PropertyMediaController::class, 'store']);
        Route::delete('properties/{property}/media/{mediaId}', [PropertyMediaController::class, 'destroy']);
        Route::post('properties/{property}/media/reorder', [PropertyMediaController::class, 'reorder']);

        Route::post('properties/{property}/favorite', [FavoriteController::class, 'store']);
        Route::delete('properties/{property}/favorite', [FavoriteController::class, 'destroy']);
        Route::get('favorites', [FavoriteController::class, 'index']);

        Route::post('properties/{property}/leads', [LeadController::class, 'store']);
        Route::get('my/leads', [LeadController::class, 'myLeads']);
        Route::get('properties/{property}/leads', [LeadController::class, 'propertyLeads']);

        Route::post('properties/{property}/visits', [VisitController::class, 'store']);
        Route::get('my/visits', [VisitController::class, 'myVisits']);
        Route::patch('visits/{visit}/status', [VisitController::class, 'updateStatus']);

        Route::post('properties/{property}/report', [PropertyReportController::class, 'store']);

        Route::post('reviews', [ReviewController::class, 'store']);

        // Saved searches
        Route::get('saved-searches', [SavedSearchController::class, 'index']);
        Route::post('saved-searches', [SavedSearchController::class, 'store']);
        Route::delete('saved-searches/{savedSearch}', [SavedSearchController::class, 'destroy']);

        // Chat between a buyer and a property owner
        Route::get('conversations', [ChatController::class, 'index']);
        Route::get('conversations/unread-count', [ChatController::class, 'unreadCount']);
        Route::post('properties/{property}/conversation', [ChatController::class, 'startForProperty']);
        Route::get('conversations/{conversation}', [ChatController::class, 'show']);
        Route::post('conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Device tokens (push notification registration)
        Route::post('devices', [DeviceTokenController::class, 'store']);
        Route::delete('devices', [DeviceTokenController::class, 'destroy']);

        // Recently viewed
        Route::get('my/recently-viewed', [RecentlyViewedController::class, 'index']);

        // Bookings (date-range, for farmhouses/resorts/venues/PGs)
        Route::post('properties/{property}/bookings', [BookingController::class, 'store']);
        Route::post('properties/{property}/bookings/block', [BookingController::class, 'blockDates']);
        Route::get('properties/{property}/bookings', [BookingController::class, 'propertyBookings']);
        Route::get('my/bookings', [BookingController::class, 'myBookings']);
        Route::patch('bookings/{booking}/status', [BookingController::class, 'updateStatus']);

        // Service requests (buyer/owner side)
        Route::post('service-requests', [ServiceRequestController::class, 'store']);
        Route::get('my/service-requests', [ServiceRequestController::class, 'myRequests']);
        Route::get('service-requests/{serviceRequest}', [ServiceRequestController::class, 'show']);
        Route::post('service-requests/{serviceRequest}/cancel', [ServiceRequestController::class, 'cancel']);
        Route::post('service-requests/{serviceRequest}/review', [PartnerReviewController::class, 'store']);

        // Service quotes (partner side)
        Route::get('my/service-queue', [ServiceRequestController::class, 'queue']);
        Route::post('service-requests/{serviceRequest}/quotes', [ServiceQuoteController::class, 'store']);
        Route::get('my/quotes', [ServiceQuoteController::class, 'myQuotes']);
        Route::post('quotes/{quote}/withdraw', [ServiceQuoteController::class, 'withdraw']);
        Route::post('quotes/{quote}/accept', [ServiceQuoteController::class, 'accept']);
        Route::patch('service-requests/{serviceRequest}/status', [ServiceQuoteController::class, 'updateStatus']);

        // Partner profile
        Route::get('my/partner-profile', [PartnerController::class, 'myProfile']);
        Route::put('my/partner-profile', [PartnerController::class, 'updateProfile']);
        Route::post('my/partner-profile/documents', [PartnerController::class, 'uploadDocument']);
        Route::get('my/partner-profile/documents', [PartnerController::class, 'myDocuments']);

        // Payments
        Route::post('properties/{property}/feature', [PaymentController::class, 'purchaseFeaturedListing']);
        Route::post('subscription-plans/{plan}/subscribe', [PaymentController::class, 'subscribe']);
        Route::post('payments/verify', [PaymentController::class, 'verify']);
        Route::get('my/payments', [PaymentController::class, 'myPayments']);
        Route::get('my/subscription', [PaymentController::class, 'mySubscription']);
    });

    // ---- Admin (role-gated) ----
    Route::prefix('admin')->group(function () {
        Route::get('properties/pending', [AdminPropertyController::class, 'pending']);
        Route::post('properties/{property}/approve', [AdminPropertyController::class, 'approve']);
        Route::post('properties/{property}/reject', [AdminPropertyController::class, 'reject']);
        Route::post('properties/{property}/verify', [AdminPropertyController::class, 'verify']);

        Route::get('reports', [AdminReportController::class, 'index']);
        Route::post('reports/{report}/resolve', [AdminReportController::class, 'resolve']);
        Route::get('duplicate-flags', [AdminReportController::class, 'duplicateFlags']);
        Route::post('duplicate-flags/{flag}/resolve', [AdminReportController::class, 'resolveDuplicateFlag']);

        Route::get('users', [AdminUserController::class, 'index']);
        Route::post('users/{user}/suspend', [AdminUserController::class, 'suspend']);
        Route::post('users/{user}/reactivate', [AdminUserController::class, 'reactivate']);

        Route::get('partners/pending', [AdminPartnerController::class, 'pending']);
        Route::post('partners/{partnerProfile}/verify', [AdminPartnerController::class, 'verify']);
        Route::get('partners/{partnerProfile}/documents', [AdminPartnerController::class, 'documents']);
        Route::get('partners/documents/{document}/download', [AdminPartnerController::class, 'downloadDocument']);
        Route::post('partners/documents/{document}/review', [AdminPartnerController::class, 'reviewDocument']);
    });
});
