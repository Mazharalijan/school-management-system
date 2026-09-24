<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IssueSalaryAdvanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'staff_id' => ['required', 'exists:staff,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'issued_date' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
