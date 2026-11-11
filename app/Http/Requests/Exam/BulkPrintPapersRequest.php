<?php

namespace App\Http\Requests\Exam;

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
            'paper_ids' => ['required', 'array'],
            'paper_ids.*' => ['exists:exam_class_papers,id'],
        ];
    }
}
