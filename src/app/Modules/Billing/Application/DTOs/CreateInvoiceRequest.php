<?php

namespace App\Modules\Billing\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;

class CreateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'uuid', 'exists:patients,id'],
            'notes'             => ['nullable', 'string'],
            'reference_clinic'  => ['nullable', 'string', 'max:255'],

            'lines'                => ['required', 'array', 'min:1'],
            'lines.*.service_id'   => ['nullable', 'uuid', 'exists:services,id'],
            'lines.*.appointment_id' => ['nullable', 'uuid', 'exists:appointments,id'],
            'lines.*.description'  => ['required', 'string', 'max:255'],
            'lines.*.quantity'     => ['required', 'integer', 'min:1'],
            'lines.*.unit_price'   => ['required', 'numeric', 'min:0'],
        ];
    }
}
