<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('partner_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->text('bio')->nullable();
            $table->json('cities_served')->nullable();
            $table->string('years_experience')->nullable();
            $table->boolean('is_verified')->default(false)->index();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->unsignedInteger('total_completed')->default(0);
            $table->decimal('rating_avg', 3, 2)->nullable();
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamps();
        });

        // A partner may serve more than one category (e.g. a firm doing both
        // legal verification and registration assistance).
        Schema::create('partner_profile_service_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['partner_profile_id', 'service_category_id'], 'partner_category_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('partner_profile_service_category');
        Schema::dropIfExists('partner_profiles');
    }
};
