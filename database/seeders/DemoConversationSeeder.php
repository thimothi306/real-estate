<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Gives the Chat tab realistic threads to show. Each demo buyer holds a
 * short exchange with the owner of a published listing.
 */
class DemoConversationSeeder extends Seeder
{
    protected const SCRIPTS = [
        [
            ['from' => 'buyer', 'body' => 'Hello, I saw your listing and I am interested. Is it still available?'],
            ['from' => 'owner', 'body' => 'Hello! Yes, it is available. Thanks for your interest in my property.'],
            ['from' => 'buyer', 'body' => 'Great. Is it available for immediate possession?'],
            ['from' => 'owner', 'body' => 'Yes, it is vacant. We can schedule a visit this weekend if that suits you.'],
            ['from' => 'buyer', 'body' => 'Saturday 11 AM works for me.'],
        ],
        [
            ['from' => 'buyer', 'body' => 'Hi, is the price negotiable?'],
            ['from' => 'owner', 'body' => 'There is some room for a serious buyer. Would you like to see it first?'],
            ['from' => 'buyer', 'body' => 'Yes please. Is parking included?'],
            ['from' => 'owner', 'body' => 'Covered parking for one car is included in the price.'],
        ],
        [
            ['from' => 'buyer', 'body' => 'Hello, what are the maintenance charges per month?'],
            ['from' => 'owner', 'body' => 'Around ₹3,500 a month, which covers security, water and common-area upkeep.'],
        ],
    ];

    public function run(): void
    {
        $buyers = $this->seedBuyers();
        $properties = Property::published()->whereNotNull('owner_id')->take(3)->get();

        if ($properties->isEmpty()) {
            $this->command?->warn('No published properties — skipping demo conversations.');

            return;
        }

        $created = 0;

        foreach ($properties as $index => $property) {
            $buyer = $buyers[$index % count($buyers)];

            // Never seed a thread where the buyer is also the owner.
            if ($buyer->id === $property->owner_id) {
                continue;
            }

            $conversation = Conversation::firstOrCreate(
                ['property_id' => $property->id, 'buyer_id' => $buyer->id, 'owner_id' => $property->owner_id],
                ['last_message_at' => now()]
            );

            if ($conversation->messages()->exists()) {
                continue;
            }

            $script = self::SCRIPTS[$index % count(self::SCRIPTS)];
            $sentAt = now()->subHours(count($script));

            foreach ($script as $line) {
                $senderId = $line['from'] === 'buyer' ? $buyer->id : $property->owner_id;

                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $senderId,
                    'body' => $line['body'],
                    // Everything but the owner's last word is already read.
                    'read_at' => $line['from'] === 'buyer' ? $sentAt : null,
                    'created_at' => $sentAt,
                    'updated_at' => $sentAt,
                ]);

                $sentAt = $sentAt->copy()->addMinutes(random_int(3, 40));
            }

            $conversation->update(['last_message_at' => $sentAt]);
            $created++;
        }

        $this->command?->info("Seeded {$created} demo conversations.");
    }

    /** @return User[] */
    protected function seedBuyers(): array
    {
        $people = [
            ['name' => 'Rohan Kumar', 'email' => 'rohan@demo.kavuriestates.com', 'phone' => '+919700000001'],
            ['name' => 'Kavya Rao', 'email' => 'kavya@demo.kavuriestates.com', 'phone' => '+919700000002'],
            ['name' => 'Imran Shaikh', 'email' => 'imran@demo.kavuriestates.com', 'phone' => '+919700000003'],
        ];

        return array_map(fn ($person) => User::updateOrCreate(
            ['email' => $person['email']],
            [
                'name' => $person['name'],
                'phone' => $person['phone'],
                'password' => Hash::make('Demo@12345'),
                'role' => User::ROLE_BUYER,
                'status' => 'active',
                'city' => 'Hyderabad',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        ), $people);
    }
}
