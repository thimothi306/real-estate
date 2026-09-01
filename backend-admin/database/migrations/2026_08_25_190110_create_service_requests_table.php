<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // requester
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->enum('status', [
                'open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled',
            ])->default('open')->index();
            $table->foreignId('accepted_quote_id')->nullable();
            $table->foreignId('assigned_partner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['service_category_id', 'status']);
            $table->index(['assigned_partner_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_requests');
    }
};
