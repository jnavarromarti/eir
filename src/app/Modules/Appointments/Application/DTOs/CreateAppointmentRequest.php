<?php

namespace App\Modules\Appointments\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'      => ['required', 'uuid', 'exists:patients,id'],
            'practitioner_id' => ['required', 'uuid', 'exists:users,id'],
            'service_id'      => ['required', 'uuid', 'exists:services,id'],
            'starts_at'       => ['required', 'date', 'after:now'],
            'ends_at'         => ['required', 'date', 'after:starts_at'],
            'notes'           => ['nullable', 'string'],
        ];
    }
}
