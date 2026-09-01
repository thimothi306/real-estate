<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'lender_name', 'logo_url', 'interest_rate_from', 'max_amount', 'max_tenure_years',
        'processing_fee_percent', 'highlight', 'apply_url', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
