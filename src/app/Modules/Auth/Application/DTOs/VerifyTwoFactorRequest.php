<?php

namespace App\Modules\Auth\Application\DTOs;

use Illuminate\Foundation\Http\FormRequest;

class VerifyTwoFactorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'temp_token' => ['required', 'string'],
            'code'       => ['required', 'string', 'size:6'],
        ];
    }
}
