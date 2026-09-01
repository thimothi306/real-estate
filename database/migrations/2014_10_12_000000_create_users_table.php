<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone', 20)->unique();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', [
                'buyer', 'owner', 'tenant', 'landlord', 'builder',
                'agent', 'interior_designer', 'loan_partner', 'legal_consultant',
                'property_manager', 'admin',
            ])->default('buyer')->index();
            $table->enum('status', ['active', 'suspended', 'pending', 'deleted'])->default('active')->index();
            $table->string('avatar_url')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();

            // Security / auth hardening
            $table->unsignedInteger('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->string('two_factor_secret')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['role', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
