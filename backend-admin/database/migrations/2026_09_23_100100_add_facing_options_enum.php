<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement("
            ALTER TABLE properties MODIFY COLUMN facing ENUM(
                'east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west',
                'ocean_facing', 'park_facing', 'road_facing', 'garden_facing'
            ) NULL
        ");
    }

    public function down()
    {
        DB::statement("
            ALTER TABLE properties MODIFY COLUMN facing ENUM(
                'east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west'
            ) NULL
        ");
    }
};
