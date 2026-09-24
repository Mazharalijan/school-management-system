<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get the student model or ID from the route parameter
        $studentId = $this->route('student') ? $this->route('student')->id ?? $this->route('student') : null;

        return [
            // Student Personal Details
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'blood_group' => ['nullable', 'string', 'max:5', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'graduated', 'suspended'])],

            // Guardian Information
            'guardian_name' => ['required', 'string', 'max:100'],
            'guardian_relation' => ['required', 'string', 'max:50'],
            'guardian_phone' => ['required', 'string', 'max:20'],
            'guardian_email' => ['nullable', 'email', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],

            // Academic Placement
            'school_class_id' => ['required', 'integer', Rule::exists('school_classes', 'id')],
            'section_id' => [
                'required',
                'integer',
                Rule::exists('sections', 'id')->where(function ($query) {
                    return $query->where('school_class_id', $this->school_class_id);
                }),
            ],
            'roll_number' => [
                'nullable',
                'string',
                'max:30',
                // Enforces unique roll number within the same class and section, ignoring current student
                Rule::unique('student_enrollments', 'roll_number')
                    ->where(function ($query) {
                        return $query->where('school_class_id', $this->school_class_id)
                            ->where('section_id', $this->section_id)
                            ->where('status', 'active');
                    })
                    ->ignore($studentId, 'student_id'),
            ],
            'session_year' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'section_id.exists' => 'The selected section is invalid for the chosen class.',
            'roll_number.unique' => 'This roll number is already assigned to another student in this class section.',
            'date_of_birth.before' => 'Date of birth must be a valid date in the past.',
        ];
    }

    /**
     * Prepare inputs before validation.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('session_year') || empty($this->session_year)) {
            $this->merge([
                'session_year' => date('Y'),
            ]);
        }
    }
}
