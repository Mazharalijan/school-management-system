<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class StoreBulkStudentMarksRequest extends FormRequest
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
            'subject_id' => ['required', 'exists:subjects,id'],
            'marks' => ['required', 'array', 'min:1'],
            'marks.*.student_id' => ['required', 'exists:students,id'],
            'marks.*.obtained_marks' => ['required_if:marks.*.is_absent,false', 'nullable', 'numeric', 'min:0'],
            'marks.*.total_marks' => ['required', 'numeric', 'min:1'],
            'marks.*.is_absent' => ['boolean'],
            'marks.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}