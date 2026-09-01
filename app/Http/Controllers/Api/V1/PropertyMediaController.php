<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyMediaResource;
use App\Models\Property;
use App\Services\DuplicateDetectionService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PropertyMediaController extends Controller
{
    use ApiResponse;

    public function __construct(protected DuplicateDetectionService $duplicateDetection)
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $request->validate([
            'files' => ['required', 'array', 'max:20'],
            'files.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov', 'max:51200'], // 50MB cap
            'type' => ['required', 'in:image,video,drone_video,floor_plan,virtual_tour_360'],
        ]);

        $media = DB::transaction(function () use ($request, $property) {
            $nextOrder = $property->media()->max('sort_order') + 1;
            $created = [];

            foreach ($request->file('files') as $file) {
                $hash = $this->duplicateDetection->hashFile($file);
                $path = $file->store("properties/{$property->uuid}", 'public');

                $item = $property->media()->create([
                    'type' => $request->input('type'),
                    'disk' => 'public',
                    'path' => $path,
                    'content_hash' => $hash,
                    'sort_order' => $nextOrder++,
                    'size_bytes' => $file->getSize(),
                ]);

                $this->duplicateDetection->checkAndFlag($item, $hash);

                $created[] = $item;
            }

            return $created;
        });

        return $this->success(PropertyMediaResource::collection($media), 'Media uploaded.', 201);
    }

    public function destroy(Request $request, Property $property, int $mediaId)
    {
        $this->authorize('update', $property);

        $media = $property->media()->findOrFail($mediaId);
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return $this->success(null, 'Media removed.');
    }

    public function reorder(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:property_media,id'],
        ]);

        DB::transaction(function () use ($data, $property) {
            foreach ($data['order'] as $index => $mediaId) {
                $property->media()->where('id', $mediaId)->update(['sort_order' => $index]);
            }
        });

        return $this->success(null, 'Media order updated.');
    }
}
