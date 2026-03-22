<?php

namespace App\Modules\Patients\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;

class CreatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['required', 'string', 'max:255'],
            'last_name'       => ['required', 'string', 'max:255'],
            'dni'             => ['nullable', 'string', 'max:20', 'unique:patients,dni'],
            'birth_date'      => ['nullable', 'date', 'before:today'],
            'gender'          => ['nullable', 'string', 'in:male,female,other'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'phone_secondary' => ['nullable', 'string', 'max:20'],
            'email'           => ['nullable', 'email'],
            'address'         => ['nullable', 'string', 'max:255'],
            'city'            => ['nullable', 'string', 'max:255'],
            'postal_code'     => ['nullable', 'string', 'max:10'],
            'province'        => ['nullable', 'string', 'max:255'],
            'allergies'       => ['nullable', 'string'],
            'medical_notes'   => ['nullable', 'string'],
        ];
    }
}
