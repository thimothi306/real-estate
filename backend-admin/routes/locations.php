<?php

use App\\Http\\Controllers\\Admin\\LocationController;
use Illuminate\\Support\\Facades\\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('admin.web')->group(function () {
        Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
        Route::get('locations/countries', [LocationController::class, 'getCountries'])->name('locations.countries');
        Route::get('locations/states/{countryId}', [LocationController::class, 'getStates'])->name('locations.states');
        Route::get('locations/cities/{stateId}', [LocationController::class, 'getCities'])->name('locations.cities');
        
        Route::post('locations/countries', [LocationController::class, 'storeCountry'])->name('locations.storeCountry');
        Route::post('locations/countries/{id}', [LocationController::class, 'updateCountry'])->name('locations.updateCountry');
        Route::delete('locations/countries/{id}', [LocationController::class, 'destroyCountry'])->name('locations.destroyCountry');
        
        Route::post('locations/states', [LocationController::class, 'storeState'])->name('locations.storeState');
        Route::post('locations/states/{id}', [LocationController::class, 'updateState'])->name('locations.updateState');
        Route::delete('locations/states/{id}', [LocationController::class, 'destroyState'])->name('locations.destroyState');
        
        Route::post('locations/cities', [LocationController::class, 'storeCity'])->name('locations.storeCity');
        Route::post('locations/cities/{id}', [LocationController::class, 'updateCity'])->name('locations.updateCity');
        Route::delete('locations/cities/{id}', [LocationController::class, 'destroyCity'])->name('locations.destroyCity');
    });
});
