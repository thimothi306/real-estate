<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->enum('urgency', ['immediate', 'today', 'tomorrow', 'this_week'])
                ->default('this_week')
                ->after('budget_max');
            // Free-text location — full structured address/landmark/map-pin is
            // deferred; requests tied to a property already carry a full address.
            $table->string('location')->nullable()->after('urgency');
        });
    }

    public function down()
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['urgency', 'location']);
        });
    }
};
