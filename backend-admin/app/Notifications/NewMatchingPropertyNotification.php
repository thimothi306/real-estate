<?php

namespace App\Notifications;

use App\Models\Property;
use Illuminate\Notifications\Notification;

class NewMatchingPropertyNotification extends Notification
{
    public function __construct(protected Property $property)
    {
    }

    public function via($notifiable): array
    {
        // 'database' only for the MVP — a push channel (FCM) can be added
        // here once device tokens are actually being sent to, not just stored.
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'saved_search_match',
            'property_id' => $this->property->id,
            'property_slug' => $this->property->slug,
            'title' => $this->property->title,
            'price' => (float) $this->property->price,
            'city' => $this->property->city,
            'message' => "New property matches your saved search: {$this->property->title}",
        ];
    }
}
