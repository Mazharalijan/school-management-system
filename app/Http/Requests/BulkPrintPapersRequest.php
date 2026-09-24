<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkPrintPapersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_ids' => ['required', 'array', 'min:1'],
            'paper_ids.*' => ['integer', 'exists:exam_class_papers,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'paper_ids.required' => 'Please select at least one paper for bulk printing.',
        ];
    }
}
