<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^\+?[1-9]\d{9,14}$/'],
            'code' => ['required', 'digits:6'],
            'purpose' => ['required', Rule::in(['registration', 'login', 'password_reset', 'phone_change'])],
        ];
    }
}
