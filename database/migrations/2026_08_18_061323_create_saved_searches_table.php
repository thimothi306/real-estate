<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('saved_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->json('filters');
            $table->boolean('notify_on_match')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('saved_searches');
    }
};
