<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['call', 'message', 'callback_request', 'whatsapp'])->default('message');
            $table->enum('status', ['new', 'contacted', 'visit_scheduled', 'negotiating', 'closed', 'lost'])->default('new')->index();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'buyer_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leads');
    }
};
