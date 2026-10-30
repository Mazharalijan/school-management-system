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
            'prepare_results' => ['nullable', 'boolean'],

            // Matrix structure (by student)
            'students' => ['nullable', 'array'],
            'students.*.student_id' => ['required_with:students', 'exists:students,id'],
            'students.*.teacher_remarks' => ['nullable', 'string', 'max:500'],
            'students.*.marks' => ['nullable', 'array'],

            // Flat structure (backwards compatible)
            'subject_id' => ['nullable', 'exists:subjects,id'],
            'marks' => ['nullable', 'array'],
            'marks.*.student_id' => ['required_with:marks', 'exists:students,id'],
            'marks.*.obtained_marks' => ['nullable', 'numeric', 'min:0'],
            'marks.*.total_marks' => ['nullable', 'numeric', 'min:1'],
            'marks.*.is_absent' => ['nullable', 'boolean'],
            'marks.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
