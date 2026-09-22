<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'guardian_email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'admission_date' => ['required', 'date'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'section_id' => ['required', 'exists:sections,id'],
            'roll_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}