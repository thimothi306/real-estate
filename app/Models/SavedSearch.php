<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedSearch extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'filters', 'notify_on_match'];

    protected $casts = [
        'filters' => 'array',
        'notify_on_match' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
