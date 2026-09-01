<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = ['property_id', 'buyer_id', 'agent_id', 'type', 'status', 'note'];

    /** Mirrors the leads.status ENUM — keep the two in sync. */
    public const STATUSES = ['new', 'contacted', 'visit_scheduled', 'negotiating', 'closed', 'lost'];

    /** A lead that reached a successful outcome, for conversion reporting. */
    public const STATUS_WON = 'closed';

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
