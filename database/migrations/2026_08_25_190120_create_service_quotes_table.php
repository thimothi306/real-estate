<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])->default('pending')->index();
            $table->date('valid_until')->nullable();
            $table->timestamps();

            // A partner submits at most one live quote per request — resubmitting updates it.
            $table->unique(['service_request_id', 'partner_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_quotes');
    }
};
