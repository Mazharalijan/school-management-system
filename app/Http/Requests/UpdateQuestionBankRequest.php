<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => ['sometimes', 'required', 'exists:school_classes,id'],
            'subject_id'      => ['sometimes', 'required', 'exists:subjects,id'],
            'chapter_id'      => ['nullable', 'exists:chapters,id'],
            'topic_id'        => ['nullable', 'exists:topics,id'],
            'question_type'   => ['sometimes', 'required', Rule::in(['mcq', 'short', 'long', 'letter', 'essay'])],
            'question'        => ['sometimes', 'required', 'string'],
            'default_marks'   => ['sometimes', 'required', 'numeric', 'min:0.01', 'max:999.99'],
        ];
    }
}