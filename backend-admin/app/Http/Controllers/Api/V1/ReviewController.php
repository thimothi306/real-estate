<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index']);
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'city' => ['required', 'string', 'max:100'],
            'locality' => ['nullable', 'string', 'max:120'],
        ]);

        $reviews = Review::where('city', $data['city'])
            ->when($data['locality'] ?? null, fn ($q, $locality) => $q->where('locality', $locality))
            ->where('is_flagged', false)
            ->with('user:id,name,avatar_url')
            ->latest()
            ->paginate(20);

        $summary = Review::where('city', $data['city'])
            ->when($data['locality'] ?? null, fn ($q, $locality) => $q->where('locality', $locality))
            ->selectRaw('category, avg(rating) as avg_rating, count(*) as total')
            ->groupBy('category')
            ->get();

        return $this->success([
            'reviews' => $reviews->items(),
            'summary' => $summary,
        ], 'OK', 200, ['total' => $reviews->total()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'city' => ['required', 'string', 'max:100'],
            'locality' => ['nullable', 'string', 'max:120'],
            'category' => ['required', Rule::in(['water_supply', 'internet', 'traffic', 'safety', 'schools', 'hospitals', 'maintenance'])],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = Review::create($data + ['user_id' => $request->user()->id]);

        return $this->success($review, 'Review submitted.', 201);
    }
}
