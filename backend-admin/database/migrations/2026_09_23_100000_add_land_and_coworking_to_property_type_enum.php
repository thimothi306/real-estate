<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement("
            ALTER TABLE properties MODIFY COLUMN property_type ENUM(
                'apartment', 'villa', 'plot', 'land', 'farmhouse', 'resort', 'wedding_venue',
                'hostel', 'pg', 'office_space', 'co_working_space', 'shop', 'commercial', 'warehouse'
            ) NOT NULL
        ");
    }

    public function down()
    {
        DB::statement("
            ALTER TABLE properties MODIFY COLUMN property_type ENUM(
                'apartment', 'villa', 'plot', 'farmhouse', 'resort', 'wedding_venue',
                'hostel', 'pg', 'office_space', 'shop', 'commercial', 'warehouse'
            ) NOT NULL
        ");
    }
};
