<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class ProcessExamResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_session_id' => ['required', 'exists:exam_sessions,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'teacher_remarks' => ['nullable', 'array'],
            'teacher_remarks.*.student_id' => ['required', 'exists:students,id'],
            'teacher_remarks.*.remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}