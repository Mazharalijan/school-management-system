<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentPromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_class_id' => ['required', 'exists:school_classes,id'],
            'target_class_id' => ['required', 'exists:school_classes,id'],
            'target_section_id' => ['nullable', 'exists:sections,id'],
            'target_session_year' => ['required', 'string', 'max:50'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['exists:students,id'],
            'fee_strategy' => ['required', 'in:class_default,custom'],
            'base_monthly_fee' => ['nullable', 'numeric', 'min:0'],
            'admission_fee' => ['nullable', 'numeric', 'min:0'],
            'waive_admission_fee' => ['nullable', 'boolean'],
            'discount_strategy' => ['required', 'in:keep_existing,reset_zero,custom'],
            'custom_discount' => ['nullable', 'numeric', 'min:0'],
            'custom_discount_reason' => ['nullable', 'string', 'max:255'],
            'individual_overrides' => ['nullable', 'array'],
        ];
    }
}
