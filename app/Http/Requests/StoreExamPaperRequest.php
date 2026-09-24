<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamClassPaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_title' => ['required', 'string', 'max:255'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'exam_schedule_id' => ['nullable', 'exists:exam_schedules,id'],
            'total_marks' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'instructions' => ['nullable', 'string'],
            'total_copies_needed' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'school_class_id.required' => 'Please select a valid school class.',
            'subject_id.required' => 'Please select a subject.',
            'paper_title.required' => 'The paper title is required.',
        ];
    }
}
