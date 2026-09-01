<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100'],
            // Note: using 'email:rfc' only (no ':dns') — a DNS-validated rule performs a live
            // lookup per request, which adds latency and an external dependency to a hot path.
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^\+?[1-9]\d{9,14}$/', 'unique:users,phone'],
            // Note: intentionally not using Password::uncompromised() — it makes an external
            // HaveIBeenPwned API call per request, adding latency and an external dependency.
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role' => ['required', Rule::in([
                User::ROLE_BUYER, User::ROLE_OWNER, User::ROLE_TENANT, User::ROLE_LANDLORD,
                User::ROLE_BUILDER, User::ROLE_AGENT, User::ROLE_INTERIOR_DESIGNER,
                User::ROLE_LOAN_PARTNER, User::ROLE_LEGAL_CONSULTANT, User::ROLE_PROPERTY_MANAGER,
                User::ROLE_RENTAL_MANAGER, User::ROLE_PACKERS_MOVERS, User::ROLE_GOVT_REGISTRATION_PARTNER,
            ])],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid phone number in international format.',
        ];
    }
}
