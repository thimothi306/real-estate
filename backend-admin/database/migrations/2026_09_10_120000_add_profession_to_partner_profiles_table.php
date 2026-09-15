<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('partner_profiles', function (Blueprint $table) {
            // Distinct from business_name (company/display name) — e.g. "Plumber",
            // shown as the headline trade on a self-service provider's profile.
            $table->string('profession')->nullable()->after('user_id');
        });
    }

    public function down()
    {
        Schema::table('partner_profiles', function (Blueprint $table) {
            $table->dropColumn('profession');
        });
    }
};
