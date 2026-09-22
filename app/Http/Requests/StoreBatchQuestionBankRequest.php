<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBatchQuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic_cards' => ['required', 'array', 'min:1'],
            'topic_cards.*.school_class_id' => ['required', 'exists:school_classes,id'],
            'topic_cards.*.subject_id' => ['required', 'exists:subjects,id'],
            'topic_cards.*.chapter_id' => ['nullable', 'exists:chapters,id'],
            'topic_cards.*.topic_id' => ['nullable', 'exists:topics,id'],
            'topic_cards.*.questions' => ['required', 'array', 'min:1'],
            'topic_cards.*.questions.*.question_type' => ['required', Rule::in(['mcq', 'short', 'long', 'letter', 'essay'])],
            'topic_cards.*.questions.*.question' => ['required', 'string'],
            'topic_cards.*.questions.*.default_marks' => ['required', 'numeric', 'min:0.01', 'max:999.99'],
        ];
    }
}
