<?php

namespace App\Http\Requests\Property;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        // Self-service listing: posting your first property is what makes a
        // plain buyer/tenant an owner — mirrors the same pattern used for
        // Kavuri Connect providers (PartnerController::updateProfile).
        // Pre-defined listing roles (landlord/builder/agent) and admin are
        // untouched.
        if ($user && in_array($user->role, [User::ROLE_BUYER, User::ROLE_TENANT], true)) {
            $user->update(['role' => User::ROLE_OWNER]);
        }

        return $this->user()->can('create', \App\Models\Property::class);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'property_type' => ['required', Rule::in([
                'apartment', 'villa', 'plot', 'land', 'farmhouse', 'resort', 'wedding_venue',
                'hostel', 'pg', 'office_space', 'co_working_space', 'shop', 'commercial', 'warehouse',
            ])],
            'listing_type' => ['required', Rule::in(['sale', 'rent'])],
            'price' => ['required', 'numeric', 'min:0', 'max:999999999999'],
            'rent_price' => ['nullable', 'numeric', 'min:0'],
            'area_sqft' => ['nullable', 'numeric', 'min:0'],
            'plot_size_sqft' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'floor_no' => ['nullable', 'integer', 'min:0', 'max:200'],
            'total_floors' => ['nullable', 'integer', 'min:0', 'max:200'],
            'facing' => ['nullable', Rule::in([
                'east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west',
                'ocean_facing', 'park_facing', 'road_facing', 'garden_facing',
            ])],
            'furnishing_status' => ['nullable', Rule::in(['unfurnished', 'semi_furnished', 'fully_furnished'])],
            'category_details' => ['nullable', 'array'],
            'category_details.plot_purpose' => ['nullable', Rule::in(['residential', 'commercial', 'industrial', 'agricultural', 'farmhouse', 'venture_layout'])],
            'category_details.plot_approval' => ['nullable', Rule::in(['hmda', 'dtcp', 'municipal', 'gram_panchayat', 'non_approved'])],
            'category_details.plot_transaction' => ['nullable', Rule::in(['direct_sale', 'joint_development', 'investment_prelaunch'])],
            'category_details.plot_features' => ['nullable', 'array'],
            'category_details.plot_features.*' => [Rule::in(['gated_community', 'corner', 'highway_facing', 'villa_plot', 'land_parcel'])],
            'category_details.pg_occupancy' => ['nullable', Rule::in(['single', 'double', 'triple', 'four_plus'])],
            'category_details.pg_tenant_type' => ['nullable', Rule::in(['gents', 'ladies', 'students', 'professionals', 'unisex', 'couples'])],
            'category_details.pg_accommodation_type' => ['nullable', Rule::in(['pg_rooms', 'coliving_apartment', 'hostel', 'private_room', 'studio_apartment'])],
            'category_details.pg_tier' => ['nullable', Rule::in(['standard', 'premium_luxury'])],
            'category_details.pg_rent_model' => ['nullable', Rule::in(['monthly', 'daily_weekly', 'long_term_lease'])],
            'category_details.food_included' => ['nullable', 'boolean'],
            'category_details.pg_amenities' => ['nullable', 'array'],
            'category_details.pg_amenities.*' => [Rule::in(['ac', 'attached_washroom', 'washing_machine', 'wifi', 'food', 'housekeeping', 'gaming_zone'])],
            'has_balcony' => ['boolean'],
            'has_swimming_pool' => ['boolean'],
            'has_garden' => ['boolean'],
            'has_parking' => ['boolean'],
            'available_from' => ['nullable', 'date'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'locality' => ['nullable', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:10'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'rera_number' => ['nullable', 'string', 'max:50'],
            'is_rera_approved' => ['boolean'],
            'amenity_ids' => ['nullable', 'array'],
            'amenity_ids.*' => ['integer', 'exists:amenities,id'],
            'lifestyle_tag_ids' => ['nullable', 'array'],
            'lifestyle_tag_ids.*' => ['integer', 'exists:lifestyle_tags,id'],
        ];
    }
}
