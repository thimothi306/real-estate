<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('property_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->enum('event_type', [
                'created', 'price_changed', 'status_changed', 'ownership_changed', 'renovated',
            ])->index();
            // Free-form so one table covers every event type without a dozen nullable columns:
            // price_changed -> {"from": 100, "to": 90}, status_changed -> {"from": "draft", "to": "published"}
            $table->json('meta')->nullable();
            $table->foreignId('caused_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['property_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('property_history');
    }
};
