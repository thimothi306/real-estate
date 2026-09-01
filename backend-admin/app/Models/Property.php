<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_SOLD = 'sold';
    public const STATUS_RENTED = 'rented';
    public const STATUS_ARCHIVED = 'archived';

    protected $attributes = [
        'has_balcony' => false,
        'has_swimming_pool' => false,
        'has_garden' => false,
        'has_parking' => false,
        'is_rera_approved' => false,
        'is_featured' => false,
        'views_count' => 0,
        'leads_count' => 0,
        'country' => 'India',
    ];

    protected $fillable = [
        'owner_id', 'title', 'slug', 'description',
        'property_type', 'listing_type', 'status',
        'price', 'rent_price', 'area_sqft', 'plot_size_sqft',
        'bedrooms', 'bathrooms', 'floor_no', 'total_floors',
        'facing', 'furnishing_status',
        'has_balcony', 'has_swimming_pool', 'has_garden', 'has_parking',
        'available_from',
        'address_line', 'locality', 'city', 'state', 'country', 'pincode',
        'latitude', 'longitude',
        'rera_number', 'is_rera_approved',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'rent_price' => 'decimal:2',
        'area_sqft' => 'decimal:2',
        'plot_size_sqft' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'has_balcony' => 'boolean',
        'has_swimming_pool' => 'boolean',
        'has_garden' => 'boolean',
        'has_parking' => 'boolean',
        'is_rera_approved' => 'boolean',
        'is_featured' => 'boolean',
        'available_from' => 'date',
        'featured_until' => 'datetime',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Property $property) {
            $property->uuid = $property->uuid ?: (string) Str::uuid();
            if (empty($property->slug)) {
                $property->slug = Str::slug($property->title).'-'.Str::random(6);
            }
        });
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function media()
    {
        return $this->hasMany(PropertyMedia::class)->orderBy('sort_order');
    }

    /**
     * The single lowest-sort_order image, resolved per-property via SQL
     * aggregation (Eloquent's ofMany) rather than a naive ->limit(1) on the
     * eager-load query, which applies the limit to the whole result set
     * instead of per parent and silently starves every property but one.
     */
    public function coverMedia()
    {
        return $this->hasOne(PropertyMedia::class)->ofMany(
            ['sort_order' => 'min'],
            fn ($query) => $query->where('type', 'image')
        );
    }

    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function verifications()
    {
        return $this->hasMany(PropertyVerification::class);
    }

    public function score()
    {
        return $this->hasOne(PropertyScore::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function favoritedBy()
    {
        return $this->hasMany(Favorite::class);
    }

    public function history()
    {
        return $this->hasMany(PropertyHistory::class)->latest();
    }

    public function lifestyleTags()
    {
        return $this->belongsToMany(LifestyleTag::class, 'lifestyle_tag_property');
    }

    public function availabilityBlocks()
    {
        return $this->hasMany(AvailabilityBlock::class);
    }

    public function reports()
    {
        return $this->hasMany(PropertyReport::class);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }
}
