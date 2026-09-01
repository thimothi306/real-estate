<?php

namespace App\Http\Requests\Property;

use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends StorePropertyRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('property'));
    }

    public function rules(): array
    {
        $rules = parent::rules();

        // On update, every field becomes optional ("sometimes") since it's a partial edit.
        foreach ($rules as $field => $fieldRules) {
            array_unshift($rules[$field], 'sometimes');
        }

        return $rules;
    }
}
