<?php

namespace Database\Seeders;

use App\Models\LifestyleTag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LifestyleTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Family Friendly', 'Pet Friendly', 'Bachelor Friendly', 'Luxury Living',
            'Weekend Home', 'Retirement Home', 'Startup Office', 'Hotel Investment', 'Warehouse',
        ];

        foreach ($tags as $name) {
            LifestyleTag::updateOrCreate(['slug' => Str::slug($name)], ['name' => $name]);
        }
    }
}
