<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\State;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function index()
    {
        return view('admin.locations.index');
    }
    public function getCountries(): JsonResponse
    {
        return response()->json(Country::with('states')->get());
    }

    public function storeCountry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:countries,name',
            'iso_code' => 'nullable|string|max:3',
        ]);

        $country = Country::create($validated);
        return response()->json(['message' => 'Country created successfully', 'data' => $country], 201);
    }

    public function updateCountry(Request $request, $id): JsonResponse
    {
        $country = Country::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|unique:countries,name,' . $id,
            'iso_code' => 'nullable|string|max:3',
        ]);

        $country->update($validated);
        return response()->json(['message' => 'Country updated successfully', 'data' => $country]);
    }

    public function destroyCountry($id): JsonResponse
    {
        Country::findOrFail($id)->delete();
        return response()->json(['message' => 'Country and its associated states/cities deleted successfully']);
    }

    /**
     * Handle State Management
     */
    public function getStates($countryId): JsonResponse
    {
        return response()->json(State::where('country_id', $countryId)->with('cities')->get());
    }

    public function storeState(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'name' => 'required|string',
        ]);

        // Ensure uniqueness within the country
        $exists = State::where('country_id', $request->country_id)
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'State already exists in this country'], 422);
        }

        $state = State::create($validated);
        return response()->json(['message' => 'State created successfully', 'data' => $state], 201);
    }

    public function updateState(Request $request, $id): JsonResponse
    {
        $state = State::findOrFail($id);
        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'name' => 'required|string',
        ]);

        $state->update($validated);
        return response()->json(['message' => 'State updated successfully', 'data' => $state]);
    }

    public function destroyState($id): JsonResponse
    {
        State::findOrFail($id)->delete();
        return response()->json(['message' => 'State and its associated cities deleted successfully']);
    }

    /**
     * Handle City Management
     */
    public function getCities($stateId): JsonResponse
    {
        return response()->json(City::where('state_id', $stateId)->get());
    }

    public function storeCity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state_id' => 'required|exists:states,id',
            'name' => 'required|string',
        ]);

        $exists = City::where('state_id', $request->state_id)
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'City already exists in this state'], 422);
        }

        $city = City::create($validated);
        return response()->json(['message' => 'City created successfully', 'data' => $city], 201);
    }

    public function updateCity(Request $request, $id): JsonResponse
    {
        $city = City::findOrFail($id);
        $validated = $request->validate([
            'state_id' => 'required|exists:states,id',
            'name' => 'required|string',
        ]);

        $city->update($validated);
        return response()->json(['message' => 'City updated successfully', 'data' => $city]);
    }

    public function destroyCity($id): JsonResponse
    {
        City::findOrFail($id)->delete();
        return response()->json(['message' => 'City deleted successfully']);
    }
}
