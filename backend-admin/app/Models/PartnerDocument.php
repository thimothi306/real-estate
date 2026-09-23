<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_profile_id', 'type', 'disk', 'path', 'status',
        'reviewed_by', 'reviewed_at', 'rejection_reason',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function partnerProfile()
    {
        return $this->belongsTo(PartnerProfile::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
