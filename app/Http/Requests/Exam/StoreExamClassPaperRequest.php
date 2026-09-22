<?php

namespace App\Http\Requests\Exam;

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
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'paper_title' => ['required', 'string', 'max:255'],
            'total_marks' => ['required', 'integer', 'min:1'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'instructions' => ['nullable', 'string'],
            'exam_schedule_id' => ['nullable', 'exists:exam_schedules,id'],
            'total_copies_needed' => ['nullable', 'integer', 'min:0'],
            'print_status' => ['nullable', 'string', 'in:pending,printed,queued'],
        ];
    }
}
