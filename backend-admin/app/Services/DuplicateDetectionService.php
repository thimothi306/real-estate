<?php

namespace App\Services;

use App\Models\PropertyDuplicateFlag;
use App\Models\PropertyMedia;
use Illuminate\Http\UploadedFile;

class DuplicateDetectionService
{
    /**
     * Exact-match duplicate detection via file content hash. This catches the
     * common case in the vision doc's "duplicate listings" problem — the same
     * photo(s) re-uploaded under a different listing (often the same broker or
     * owner re-posting, or a scraped listing). It will not catch a re-compressed
     * or cropped copy of the same photo — that needs perceptual hashing / a
     * vision model, which is intentionally out of scope for the MVP.
     */
    public function hashFile(UploadedFile $file): string
    {
        return hash_file('sha256', $file->getRealPath());
    }

    /**
     * Checks whether this hash already exists on another property's media and,
     * if so, records a flag for admin review. Returns the flag if one was created.
     */
    public function checkAndFlag(PropertyMedia $newMedia, string $hash): ?PropertyDuplicateFlag
    {
        $existing = PropertyMedia::where('content_hash', $hash)
            ->where('property_id', '!=', $newMedia->property_id)
            ->first();

        if (! $existing) {
            return null;
        }

        return PropertyDuplicateFlag::firstOrCreate([
            'media_id' => $newMedia->id,
            'matched_media_id' => $existing->id,
        ], [
            'property_id' => $newMedia->property_id,
            'matched_property_id' => $existing->property_id,
            'content_hash' => $hash,
            'status' => 'pending',
        ]);
    }
}
