<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['image', 'video', 'drone_video', 'floor_plan', 'virtual_tour_360'])->default('image');
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->boolean('ai_processed')->default(false);
            $table->timestamps();

            $table->index(['property_id', 'type', 'sort_order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_media');
    }
};
