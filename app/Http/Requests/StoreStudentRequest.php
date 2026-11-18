<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'gender' => ['required', 'in:male,female,other'],
            'date_of_birth' => ['required', 'date'],
            'blood_group' => ['nullable', 'in:A+,A-,B+,B-,O+,O-,AB+,AB-'],
            'guardian_name' => ['required', 'string', 'max:150'],
            'guardian_relation' => ['required', 'string', 'max:50'],
            'guardian_phone' => ['required', 'string', 'max:20'],
            'father_cnic' => ['nullable', 'string', 'max:25'],
            'guardian_email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'admission_date' => ['nullable', 'date'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'section_id' => ['required', 'exists:sections,id'],
            'roll_number' => [
                'nullable',
                'string',
                'max:20',
                function ($attribute, $value, $fail) {
                    if (blank($value)) {
                        return;
                    }

                    $sectionId = $this->input('section_id');
                    if (! $sectionId) {
                        return;
                    }

                    $exists = DB::table('students')
                        ->join('student_enrollments', 'students.id', '=', 'student_enrollments.student_id')
                        ->where('student_enrollments.section_id', $sectionId)
                        ->where('student_enrollments.is_current', true)
                        ->where('students.roll_number', $value)
                        ->whereNull('students.deleted_at')
                        ->whereNull('student_enrollments.deleted_at')
                        ->exists();

                    if ($exists) {
                        $fail('This roll number is already assigned to another student in this section.');
                    }
                },
            ],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'background_color' => ['nullable', 'string', 'max:30'],
        ];
    }

    /**
     * Prepare inputs before validation.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('admission_date') || empty($this->admission_date)) {
            $this->merge([
                'admission_date' => date('Y-m-d'),
            ]);
        }
    }
}
