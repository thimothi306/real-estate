<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyHistory extends Model
{
    use HasFactory;

    protected $table = 'property_history';

    protected $fillable = ['property_id', 'event_type', 'meta', 'caused_by'];

    protected $casts = [
        'meta' => 'array',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function causedBy()
    {
        return $this->belongsTo(User::class, 'caused_by');
    }
}
