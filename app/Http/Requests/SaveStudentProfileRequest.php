<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'session_year' => ['required', 'string', 'max:20'],
            'base_monthly_fee' => ['required', 'numeric', 'min:0'],
            'monthly_discount' => ['nullable', 'numeric', 'min:0', 'lte:base_monthly_fee'],
            'waive_admission_fee' => ['nullable', 'boolean'],
            'discount_reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
