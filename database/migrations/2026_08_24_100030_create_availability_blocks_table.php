<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Date-range availability for bookable listings (farmhouses, resorts,
     * wedding venues, PGs) — separate from `visits` (a one-time property
     * viewing) and `leads` (a contact request). A block is either the owner
     * marking dates unavailable, or a buyer's booking request occupying dates.
     */
    public function up()
    {
        Schema::create('availability_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['blocked', 'pending', 'confirmed', 'cancelled'])->default('pending')->index();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'start_date', 'end_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('availability_blocks');
    }
};
