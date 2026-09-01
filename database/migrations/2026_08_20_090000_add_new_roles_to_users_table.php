<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MySQL ENUM columns can't have a value appended — ALTER must restate
     * the full value list. Doctrine DBAL (used by Schema::table + ->change())
     * doesn't model MySQL enums either, so this goes through raw SQL.
     */
    public function up()
    {
        DB::statement("
            ALTER TABLE users MODIFY COLUMN role ENUM(
                'buyer', 'owner', 'tenant', 'landlord', 'builder',
                'agent', 'interior_designer', 'loan_partner', 'legal_consultant',
                'property_manager', 'packers_movers', 'govt_registration_partner', 'admin'
            ) NOT NULL DEFAULT 'buyer'
        ");
    }

    public function down()
    {
        DB::statement("
            ALTER TABLE users MODIFY COLUMN role ENUM(
                'buyer', 'owner', 'tenant', 'landlord', 'builder',
                'agent', 'interior_designer', 'loan_partner', 'legal_consultant',
                'property_manager', 'admin'
            ) NOT NULL DEFAULT 'buyer'
        ");
    }
};
