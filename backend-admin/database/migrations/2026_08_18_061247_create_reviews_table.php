<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('city')->index();
            $table->string('locality')->nullable()->index();
            $table->enum('category', ['water_supply', 'internet', 'traffic', 'safety', 'schools', 'hospitals', 'maintenance'])->index();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('is_flagged')->default(false);
            $table->timestamps();

            $table->index(['city', 'locality', 'category']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};
