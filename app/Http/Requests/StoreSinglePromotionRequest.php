<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSinglePromotionRequest extends FormRequest
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
            'base_monthly_fee' => ['nullable', 'numeric', 'min:0'],
            'admission_fee' => ['nullable', 'numeric', 'min:0'],
            'waive_admission_fee' => ['nullable', 'boolean'],
            'monthly_discount' => ['nullable', 'numeric', 'min:0'],
            'discount_reason' => ['nullable', 'string', 'max:255'],
            'promotion_type' => ['nullable', 'string', 'in:promote,skip,retain'],
        ];
    }
}
