<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('login_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('identifier')->nullable();
            $table->enum('event', ['login_success', 'login_failed', 'logout', 'otp_sent', 'otp_failed', 'account_locked', 'password_reset'])->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'event']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('login_activities');
    }
};
