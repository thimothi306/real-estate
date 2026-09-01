<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LifestyleTag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'icon'];

    public function properties()
    {
        return $this->belongsToMany(Property::class, 'lifestyle_tag_property');
    }
}
