<?php

namespace App\Modules\Appointments\Application\DTOs;

use App\Shared\Domain\AppointmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'starts_at' => ['sometimes', 'date'],
            'ends_at'   => ['sometimes', 'date', 'after:starts_at'],
            'status'    => ['sometimes', Rule::enum(AppointmentStatus::class)],
            'notes'     => ['sometimes', 'nullable', 'string'],
        ];
    }
}
