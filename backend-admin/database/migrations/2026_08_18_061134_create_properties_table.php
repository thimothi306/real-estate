<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->enum('property_type', [
                'apartment', 'villa', 'plot', 'farmhouse', 'resort', 'wedding_venue',
                'hostel', 'office_space', 'shop', 'commercial', 'warehouse',
            ])->index();
            $table->enum('listing_type', ['sale', 'rent'])->index();
            $table->enum('status', ['draft', 'pending_review', 'published', 'rejected', 'sold', 'rented', 'archived'])
                ->default('draft')->index();

            $table->decimal('price', 14, 2)->index();
            $table->decimal('rent_price', 14, 2)->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->decimal('plot_size_sqft', 10, 2)->nullable();
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->unsignedTinyInteger('floor_no')->nullable();
            $table->unsignedTinyInteger('total_floors')->nullable();
            $table->enum('facing', ['east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west'])->nullable();
            $table->enum('furnishing_status', ['unfurnished', 'semi_furnished', 'fully_furnished'])->nullable();
            $table->boolean('has_balcony')->default(false);
            $table->boolean('has_swimming_pool')->default(false);
            $table->boolean('has_garden')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->date('available_from')->nullable();

            $table->string('address_line')->nullable();
            $table->string('locality')->nullable();
            $table->string('city')->index();
            $table->string('state')->index();
            $table->string('country')->default('India');
            $table->string('pincode', 10)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('rera_number')->nullable();
            $table->boolean('is_rera_approved')->default(false);
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('featured_until')->nullable();

            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('leads_count')->default(0);

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->fullText(['title', 'description']);
            $table->index(['city', 'property_type', 'listing_type', 'status']);
            $table->index(['price', 'status']);
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
