<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('partner_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_profile_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['id_proof', 'address_proof', 'other'])->default('id_proof');
            // Private by default — unlike PropertyMedia (public disk, meant to be
            // browsable), an ID document must never be reachable via a public URL.
            $table->string('disk')->default('local');
            $table->string('path');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('partner_documents');
    }
};
