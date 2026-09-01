<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement("
            ALTER TABLE users MODIFY COLUMN role ENUM(
                'buyer', 'owner', 'tenant', 'landlord', 'builder',
                'agent', 'interior_designer', 'loan_partner', 'legal_consultant',
                'property_manager', 'rental_manager', 'packers_movers',
                'govt_registration_partner', 'admin'
            ) NOT NULL DEFAULT 'buyer'
        ");
    }

    public function down()
    {
        DB::statement("
            ALTER TABLE users MODIFY COLUMN role ENUM(
                'buyer', 'owner', 'tenant', 'landlord', 'builder',
                'agent', 'interior_designer', 'loan_partner', 'legal_consultant',
                'property_manager', 'packers_movers', 'govt_registration_partner', 'admin'
            ) NOT NULL DEFAULT 'buyer'
        ");
    }
};
