<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_duplicate_flags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('matched_property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('property_media')->cascadeOnDelete();
            $table->foreignId('matched_media_id')->constrained('property_media')->cascadeOnDelete();
            $table->string('content_hash', 64)->index();
            $table->enum('status', ['pending', 'confirmed', 'dismissed'])->default('pending')->index();
            $table->timestamps();

            $table->unique(['media_id', 'matched_media_id'], 'dup_flag_media_pair_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_duplicate_flags');
    }
};
