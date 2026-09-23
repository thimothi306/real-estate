<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'property_type' => ['nullable', Rule::in([
                'apartment', 'villa', 'plot', 'land', 'farmhouse', 'resort', 'wedding_venue',
                'hostel', 'pg', 'office_space', 'co_working_space', 'shop', 'commercial', 'warehouse',
            ])],
            'listing_type' => ['nullable', Rule::in(['sale', 'rent'])],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'area_min' => ['nullable', 'numeric', 'min:0'],
            'area_max' => ['nullable', 'numeric', 'min:0', 'gte:area_min'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'furnishing_status' => ['nullable', Rule::in(['unfurnished', 'semi_furnished', 'fully_furnished'])],
            'rera_only' => ['nullable', 'boolean'],
            'lifestyle_tag' => ['nullable', 'string', 'max:100'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:0', 'max:200'],
            'sort' => ['nullable', Rule::in(['newest', 'price_asc', 'price_desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
