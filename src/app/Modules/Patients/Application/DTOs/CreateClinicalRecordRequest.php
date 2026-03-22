<?php

namespace App\Modules\Patients\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;

class CreateClinicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'specialty_id'  => ['required', 'uuid', 'exists:specialties,id'],
            'reason'        => ['nullable', 'string'],
            'diagnosis'     => ['nullable', 'string'],
            'treatment'     => ['nullable', 'string'],
            'observations'  => ['nullable', 'string'],
            'custom_fields' => ['nullable', 'array'],
        ];
    }
}
