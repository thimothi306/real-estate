<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\State;
use App\Support\Geo;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $countries = Geo::countries();
        $statesData = Geo::states();

        foreach ($countries as $countryName) {
            $country = Country::create([
                'name' => $countryName,
                // ISO code is not provided in Geo::countries(), so we leave it null or could implement a lookup
                'iso_code' => null, 
            ]);

            if (isset($statesData[$countryName])) {
                foreach ($statesData[$countryName] as $stateName) {
                    State::create([
                        'country_id' => $country->id,
                        'name' => $stateName,
                    ]);
                }
            }
        }
    }
}
