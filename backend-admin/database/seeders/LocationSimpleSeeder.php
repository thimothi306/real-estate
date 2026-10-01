<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\State;

class LocationSimpleSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'India' => ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'],
            'United States' => ['California', 'Texas', 'Florida', 'New York'],
            'United Kingdom' => ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            'Canada' => ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
            'Australia' => ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
        ];

        foreach ($data as $countryName => $states) {
            $country = Country::create([
                'name' => $countryName,
                'iso_code' => null,
            ]);

            foreach ($states as $stateName) {
                State::create([
                    'country_id' => $country->id,
                    'name' => $stateName,
                ]);
            }
        }
    }
}

