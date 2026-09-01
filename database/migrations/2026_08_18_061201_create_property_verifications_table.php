<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->enum('badge_type', [
                'document_verified', 'owner_verified', 'video_verified',
                'gps_verified', 'government_record_checked',
            ]);
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['property_id', 'badge_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_verifications');
    }
};
