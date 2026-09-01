<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('investment_score')->nullable();
            $table->unsignedTinyInteger('rental_score')->nullable();
            $table->unsignedTinyInteger('growth_score')->nullable();
            $table->decimal('risk_percent', 5, 2)->nullable();
            $table->enum('demand_level', ['low', 'medium', 'high', 'very_high'])->nullable();
            $table->enum('liquidity_level', ['low', 'medium', 'high', 'very_high'])->nullable();
            $table->decimal('estimated_market_price', 14, 2)->nullable();
            $table->decimal('estimated_rental_value', 14, 2)->nullable();
            $table->unsignedInteger('expected_selling_days')->nullable();
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_scores');
    }
};
