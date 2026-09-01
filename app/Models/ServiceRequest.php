<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'open';
    public const STATUS_QUOTED = 'quoted';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id', 'service_category_id', 'property_id', 'title', 'description',
        'budget_min', 'budget_max', 'status', 'accepted_quote_id', 'assigned_partner_id', 'completed_at',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function quotes()
    {
        return $this->hasMany(ServiceQuote::class);
    }

    public function acceptedQuote()
    {
        return $this->belongsTo(ServiceQuote::class, 'accepted_quote_id');
    }

    public function assignedPartner()
    {
        return $this->belongsTo(User::class, 'assigned_partner_id');
    }

    public function review()
    {
        return $this->hasOne(PartnerReview::class);
    }
}
