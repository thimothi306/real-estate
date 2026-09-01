<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailabilityBlock extends Model
{
    use HasFactory;

    protected $fillable = ['property_id', 'booked_by', 'start_date', 'end_date', 'status', 'note'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by');
    }

    /** Overlap check: two date ranges intersect unless one ends before the other starts. */
    public function scopeOverlapping($query, string $startDate, string $endDate)
    {
        return $query->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate)
            ->whereIn('status', ['blocked', 'pending', 'confirmed']);
    }
}
