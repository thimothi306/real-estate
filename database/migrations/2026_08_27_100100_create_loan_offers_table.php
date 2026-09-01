<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('loan_offers', function (Blueprint $table) {
            $table->id();
            $table->string('lender_name', 120);
            $table->string('logo_url')->nullable();
            $table->decimal('interest_rate_from', 4, 2);
            $table->decimal('max_amount', 14, 2);
            $table->unsignedSmallInteger('max_tenure_years')->default(30);
            $table->decimal('processing_fee_percent', 4, 2)->nullable();
            $table->string('highlight', 160)->nullable();
            $table->string('apply_url')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('loan_offers');
    }
};
