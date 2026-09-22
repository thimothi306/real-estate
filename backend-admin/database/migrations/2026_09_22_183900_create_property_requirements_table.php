<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('city')->nullable();
            $table->string('property_type')->nullable();
            $table->enum('listing_type', ['sale', 'rent'])->nullable();
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->text('message')->nullable();
            // Mirrors Lead::STATUSES loosely — this is a much simpler
            // lead-capture form (no matching/notification), just enough to
            // track manual follow-up in the admin panel.
            $table->string('status')->default('new')->index();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_requirements');
    }
};
