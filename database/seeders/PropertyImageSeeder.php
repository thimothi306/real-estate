<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Database\Seeder;

/**
 * Attaches the shared stock photo set (storage/app/public/property-images)
 * to every property that has no media yet, cycling through the pool so
 * listings don't all show the exact same single photo.
 */
class PropertyImageSeeder extends Seeder
{
    protected const IMAGE_COUNT = 10;

    public function run(): void
    {
        $properties = Property::doesntHave('media')->orderBy('id')->get();
        $attached = 0;

        foreach ($properties as $index => $property) {
            // Each listing gets 3 photos from the pool, offset per-property so
            // consecutive listings don't show an identical trio.
            for ($slot = 0; $slot < 3; $slot++) {
                $imageNumber = (($index + $slot) % self::IMAGE_COUNT) + 1;
                $filename = sprintf('estate-%02d.jpg', $imageNumber);
                $path = "property-images/{$filename}";

                PropertyMedia::create([
                    'property_id' => $property->id,
                    'type' => 'image',
                    'disk' => 'public',
                    'path' => $path,
                    'thumbnail_path' => $path,
                    'sort_order' => $slot,
                    'size_bytes' => null,
                ]);
            }

            $attached++;
        }

        $this->command?->info("Attached stock photos to {$attached} properties.");
    }
}
