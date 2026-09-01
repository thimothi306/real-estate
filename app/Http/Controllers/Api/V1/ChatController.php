<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /** Every conversation this user is part of, on either side, newest activity first. */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::query()
            ->where(fn ($q) => $q->where('buyer_id', $userId)->orWhere('owner_id', $userId))
            ->with(['property.coverMedia', 'buyer:id,name,avatar_url', 'owner:id,name,avatar_url', 'messages'])
            // Unread = messages in this thread from the *other* person that I haven't read.
            ->withCount(['messages as unread_count' => fn ($q) => $q->whereNull('read_at')->where('sender_id', '!=', $userId)])
            ->orderByDesc('last_message_at')
            ->paginate(30);

        return $this->success(
            ConversationResource::collection($conversations->items()),
            'OK',
            200,
            ['total' => $conversations->total()]
        );
    }

    /**
     * Open (or reuse) the thread between the signed-in buyer and a property's
     * owner. Idempotent — tapping "Contact Owner" twice reuses one thread.
     */
    public function startForProperty(Request $request, Property $property)
    {
        $user = $request->user();

        abort_if($property->owner_id === $user->id, 422, 'You cannot start a conversation on your own listing.');

        $conversation = Conversation::firstOrCreate(
            ['property_id' => $property->id, 'buyer_id' => $user->id, 'owner_id' => $property->owner_id],
            ['last_message_at' => now()]
        );

        $conversation->load(['property.coverMedia', 'buyer:id,name,avatar_url', 'owner:id,name,avatar_url', 'messages']);

        return $this->success(new ConversationResource($conversation), 'OK', $conversation->wasRecentlyCreated ? 201 : 200);
    }

    /** Full thread. Opening it marks the other side's messages as read. */
    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403, 'This conversation is not yours.');

        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->update(['read_at' => now()]);

        $conversation->load(['property.coverMedia', 'buyer:id,name,avatar_url', 'owner:id,name,avatar_url', 'messages.sender:id,name']);

        return $this->success(new ConversationResource($conversation));
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        abort_unless($conversation->isParticipant($user), 403, 'This conversation is not yours.');

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = DB::transaction(function () use ($conversation, $user, $data) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => $data['body'],
            ]);

            // Keeps the chat list ordering correct without an N+1 on messages.
            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        return $this->success(new MessageResource($message), 'Message sent.', 201);
    }

    /** Badge count for the Chat tab. */
    public function unreadCount(Request $request)
    {
        $userId = $request->user()->id;

        $count = Message::whereNull('read_at')
            ->where('sender_id', '!=', $userId)
            ->whereHas('conversation', fn ($q) => $q->where('buyer_id', $userId)->orWhere('owner_id', $userId))
            ->count();

        return $this->success(['unread_count' => $count]);
    }
}
