<?php

namespace App\Observers;

use App\Models\Property;
use App\Models\PropertyHistory;

class PropertyObserver
{
    public function created(Property $property): void
    {
        PropertyHistory::create([
            'property_id' => $property->id,
            'event_type' => 'created',
            'caused_by' => $property->owner_id,
        ]);
    }

    public function updated(Property $property): void
    {
        $userId = request()->user('sanctum')?->id;

        if ($property->wasChanged('price')) {
            PropertyHistory::create([
                'property_id' => $property->id,
                'event_type' => 'price_changed',
                'meta' => ['from' => (float) $property->getOriginal('price'), 'to' => (float) $property->price],
                'caused_by' => $userId,
            ]);
        }

        if ($property->wasChanged('status')) {
            PropertyHistory::create([
                'property_id' => $property->id,
                'event_type' => 'status_changed',
                'meta' => ['from' => $property->getOriginal('status'), 'to' => $property->status],
                'caused_by' => $userId,
            ]);
        }
    }
}
