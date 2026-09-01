<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the livability signals shown on the Property Insights screen —
 * sunlight, noise, commute time, and nearby infrastructure — alongside the
 * financial scores that already live on this table.
 */
return new class extends Migration
{
    public function up()
    {
        Schema::table('property_scores', function (Blueprint $table) {
            $table->enum('sunlight_rating', ['poor', 'average', 'good', 'excellent'])->nullable()->after('property_id');
            $table->enum('noise_level', ['low', 'moderate', 'high'])->nullable()->after('sunlight_rating');
            $table->unsignedSmallInteger('commute_minutes')->nullable()->after('noise_level');
            $table->string('commute_landmark', 120)->nullable()->after('commute_minutes');
            $table->string('future_infrastructure', 180)->nullable()->after('commute_landmark');
            $table->decimal('rental_yield_percent', 4, 2)->nullable()->after('future_infrastructure');
        });
    }

    public function down()
    {
        Schema::table('property_scores', function (Blueprint $table) {
            $table->dropColumn([
                'sunlight_rating',
                'noise_level',
                'commute_minutes',
                'commute_landmark',
                'future_infrastructure',
                'rental_yield_percent',
            ]);
        });
    }
};
