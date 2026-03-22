<?php

namespace App\Modules\Patients\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['sometimes', 'string', 'max:255'],
            'last_name'       => ['sometimes', 'string', 'max:255'],
            'dni'             => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('patients')->ignore($this->route('patient'))],
            'birth_date'      => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender'          => ['sometimes', 'nullable', 'string', 'in:male,female,other'],
            'phone'           => ['sometimes', 'nullable', 'string', 'max:20'],
            'phone_secondary' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email'           => ['sometimes', 'nullable', 'email'],
            'address'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'city'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'postal_code'     => ['sometimes', 'nullable', 'string', 'max:10'],
            'province'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'allergies'       => ['sometimes', 'nullable', 'string'],
            'medical_notes'   => ['sometimes', 'nullable', 'string'],
            'is_active'       => ['sometimes', 'boolean'],
        ];
    }
}
