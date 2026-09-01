<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            'Swimming Pool' => 'Recreation',
            'Garden' => 'Recreation',
            'Covered Parking' => 'Convenience',
            'Power Backup' => 'Utility',
            'Lift' => 'Utility',
            'Gymnasium' => 'Recreation',
            'Clubhouse' => 'Recreation',
            'Security / CCTV' => 'Safety',
            'Children\'s Play Area' => 'Recreation',
            'Modular Kitchen' => 'Interior',
            'Water Supply (24x7)' => 'Utility',
            'Gas Pipeline' => 'Utility',
            'Rainwater Harvesting' => 'Utility',
            'Pet Friendly' => 'Lifestyle',
            'Wi-Fi Ready' => 'Utility',
            'Intercom' => 'Safety',
            'Fire Safety' => 'Safety',
            'Visitor Parking' => 'Convenience',
            'Servant Room' => 'Interior',
            'Solar Panels' => 'Utility',
        ];

        foreach ($amenities as $name => $category) {
            Amenity::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'category' => $category]
            );
        }
    }
}
