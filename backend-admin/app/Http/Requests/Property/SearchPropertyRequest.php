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
            'facing' => ['nullable', Rule::in([
                'east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west',
                'ocean_facing', 'park_facing', 'road_facing', 'garden_facing',
            ])],
            'plot_purpose' => ['nullable', Rule::in(['residential', 'commercial', 'industrial', 'agricultural', 'farmhouse', 'venture_layout'])],
            'plot_approval' => ['nullable', Rule::in(['hmda', 'dtcp', 'municipal', 'gram_panchayat', 'non_approved'])],
            'plot_transaction' => ['nullable', Rule::in(['direct_sale', 'joint_development', 'investment_prelaunch'])],
            'plot_feature' => ['nullable', Rule::in(['gated_community', 'corner', 'highway_facing', 'villa_plot', 'land_parcel'])],
            'pg_occupancy' => ['nullable', Rule::in(['single', 'double', 'triple', 'four_plus'])],
            'pg_tenant_type' => ['nullable', Rule::in(['gents', 'ladies', 'students', 'professionals', 'unisex', 'couples'])],
            'pg_accommodation_type' => ['nullable', Rule::in(['pg_rooms', 'coliving_apartment', 'hostel', 'private_room', 'studio_apartment'])],
            'pg_tier' => ['nullable', Rule::in(['standard', 'premium_luxury'])],
            'pg_rent_model' => ['nullable', Rule::in(['monthly', 'daily_weekly', 'long_term_lease'])],
            'food_included' => ['nullable', 'boolean'],
            'pg_amenities' => ['nullable', 'array'],
            'pg_amenities.*' => [Rule::in(['ac', 'attached_washroom', 'washing_machine', 'wifi', 'food', 'housekeeping', 'gaming_zone'])],
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
