<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExamPaperSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_class_paper_id'  => ['sometimes', 'required', 'exists:exam_class_papers,id'],
            'section_name'         => ['sometimes', 'required', 'in:A,B,C,D'],
            'title'                => ['sometimes', 'required', 'string', 'max:255'],
            'total_marks'          => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999.99'],
            'total_questions'      => ['nullable', 'integer', 'min:0'],
            'question_type'   => ['required', Rule::in(['mcq', 'short', 'long', 'letter', 'essay'])],
            'order'                => ['nullable', 'integer', 'min:1'],
            
            // Checked Questions Array validation
            'question_ids'         => ['nullable', 'array'],
            'question_ids.*'       => ['integer', 'exists:question_banks,id'],
        ];
    }
}