<?php

namespace App\Services;

use App\Models\Property;
use App\Models\SavedSearch;
use App\Notifications\NewMatchingPropertyNotification;

class SavedSearchMatchService
{
    /**
     * Runs synchronously on publish for the MVP — the saved_searches table is
     * small at this stage. Move this to a queued job (dispatched from the
     * same call site) once the table grows large enough that this noticeably
     * slows down the admin approve request.
     */
    public function notifyMatches(Property $property): int
    {
        $matches = SavedSearch::where('notify_on_match', true)
            ->with('user')
            ->get()
            ->filter(fn (SavedSearch $search) => $this->matches($property, $search->filters));

        foreach ($matches as $search) {
            $search->user?->notify(new NewMatchingPropertyNotification($property));
        }

        return $matches->count();
    }

    protected function matches(Property $property, array $filters): bool
    {
        if (! empty($filters['city']) && strcasecmp($filters['city'], $property->city) !== 0) {
            return false;
        }

        if (! empty($filters['property_type']) && $filters['property_type'] !== $property->property_type) {
            return false;
        }

        if (! empty($filters['listing_type']) && $filters['listing_type'] !== $property->listing_type) {
            return false;
        }

        if (! empty($filters['min_price']) && $property->price < $filters['min_price']) {
            return false;
        }

        if (! empty($filters['max_price']) && $property->price > $filters['max_price']) {
            return false;
        }

        if (! empty($filters['bedrooms']) && (int) $property->bedrooms !== (int) $filters['bedrooms']) {
            return false;
        }

        return true;
    }
}
