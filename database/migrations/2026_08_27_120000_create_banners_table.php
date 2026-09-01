<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-controlled promotional slots surfaced in the mobile app and on the
 * web site. `placement` decides where it renders; `audience` limits it to a
 * single surface when a banner only makes sense in one place.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('subtitle', 200)->nullable();
            $table->string('image_path')->nullable();
            $table->string('cta_label', 60)->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->enum('placement', ['home_hero', 'home_strip', 'search_inline', 'detail_footer'])->default('home_strip');
            $table->enum('audience', ['all', 'mobile', 'web'])->default('all');
            $table->boolean('is_active')->default(true);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedInteger('impressions')->default(0);
            $table->unsignedInteger('clicks')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'placement', 'audience']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('banners');
    }
};
