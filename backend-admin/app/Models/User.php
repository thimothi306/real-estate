<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_BUYER = 'buyer';
    public const ROLE_OWNER = 'owner';
    public const ROLE_TENANT = 'tenant';
    public const ROLE_LANDLORD = 'landlord';
    public const ROLE_BUILDER = 'builder';
    public const ROLE_AGENT = 'agent';
    public const ROLE_INTERIOR_DESIGNER = 'interior_designer';
    public const ROLE_LOAN_PARTNER = 'loan_partner';
    public const ROLE_LEGAL_CONSULTANT = 'legal_consultant';
    public const ROLE_PROPERTY_MANAGER = 'property_manager';
    public const ROLE_RENTAL_MANAGER = 'rental_manager';
    public const ROLE_PACKERS_MOVERS = 'packers_movers';
    public const ROLE_GOVT_REGISTRATION_PARTNER = 'govt_registration_partner';
    // Generic self-service provider — anyone can become one via PartnerController::updateProfile,
    // unlike the roles above which represent pre-defined real-estate-transaction partner types.
    public const ROLE_SERVICE_PROVIDER = 'service_provider';
    public const ROLE_ADMIN = 'admin';

    /** Roles that fulfil service requests (see ServiceCategory::partner_roles). */
    public const PARTNER_ROLES = [
        self::ROLE_INTERIOR_DESIGNER,
        self::ROLE_LOAN_PARTNER,
        self::ROLE_LEGAL_CONSULTANT,
        self::ROLE_PROPERTY_MANAGER,
        self::ROLE_RENTAL_MANAGER,
        self::ROLE_PACKERS_MOVERS,
        self::ROLE_GOVT_REGISTRATION_PARTNER,
        self::ROLE_SERVICE_PROVIDER,
    ];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'avatar_url',
        'city',
        'state',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'failed_login_attempts',
        'locked_until',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'locked_until' => 'datetime',
        'password_changed_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function isPartner(): bool
    {
        return in_array($this->role, self::PARTNER_ROLES, true);
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'owner_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class, 'buyer_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'buyer_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function savedSearches()
    {
        return $this->hasMany(SavedSearch::class);
    }

    public function loginActivities()
    {
        return $this->hasMany(LoginActivity::class);
    }

    public function partnerProfile()
    {
        return $this->hasOne(PartnerProfile::class);
    }

    public function serviceRequests()
    {
        return $this->hasMany(ServiceRequest::class);
    }

    public function assignedServiceRequests()
    {
        return $this->hasMany(ServiceRequest::class, 'assigned_partner_id');
    }

    public function serviceQuotes()
    {
        return $this->hasMany(ServiceQuote::class, 'partner_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->where('ends_at', '>', now())->latestOfMany();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
