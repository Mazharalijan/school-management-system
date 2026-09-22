<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamClassPaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paper_title'          => ['sometimes', 'required', 'string', 'max:255'],
            'school_class_id'      => ['sometimes', 'required', 'exists:school_classes,id'],
            'subject_id'           => ['sometimes', 'required', 'exists:subjects,id'],
            'exam_schedule_id'     => ['nullable', 'exists:exam_schedules,id'],
            'total_marks'          => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999.99'],
            'duration_minutes'     => ['sometimes', 'required', 'integer', 'min:1', 'max:1440'],
            'instructions'         => ['nullable', 'string'],
            'print_status'         => ['nullable', 'in:pending,queued,printed'],
            'total_copies_needed'  => ['nullable', 'integer', 'min:0'],
            'total_copies_printed' => ['nullable', 'integer', 'min:0'],
        ];
    }
}