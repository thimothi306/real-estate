<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('lifestyle_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('lifestyle_tag_property', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lifestyle_tag_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['property_id', 'lifestyle_tag_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('lifestyle_tag_property');
        Schema::dropIfExists('lifestyle_tags');
    }
};
