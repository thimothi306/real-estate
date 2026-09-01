<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyListResource;
use App\Models\Favorite;
use App\Models\Property;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $favorites = Property::query()
            ->whereHas('favoritedBy', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['coverMedia'])
            ->paginate(20);

        return $this->success(
            PropertyListResource::collection($favorites->items()),
            'OK',
            200,
            ['total' => $favorites->total()]
        );
    }

    public function store(Request $request, Property $property)
    {
        Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'property_id' => $property->id,
        ]);

        return $this->success(null, 'Added to favorites.', 201);
    }

    public function destroy(Request $request, Property $property)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('property_id', $property->id)
            ->delete();

        return $this->success(null, 'Removed from favorites.');
    }
}
