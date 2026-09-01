<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceQuote extends Model
{
    use HasFactory;

    protected $fillable = ['service_request_id', 'partner_id', 'amount', 'message', 'status', 'valid_until'];

    protected $casts = [
        'amount' => 'decimal:2',
        'valid_until' => 'date',
    ];

    public function request()
    {
        return $this->belongsTo(ServiceRequest::class, 'service_request_id');
    }

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }
}
