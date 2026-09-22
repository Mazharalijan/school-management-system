<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'required|exists:school_classes,id',
            'session_year' => 'required|string',
            'fees' => 'required|array|min:1',
            'fees.*.fee_head_id' => 'required|exists:fee_heads,id',
            'fees.*.amount' => 'required|numeric|min:0',
        ];
    }
}