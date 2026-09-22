<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Strip non-digit characters if present for CNIC validation checking if needed, 
        // or standardize CNIC format before validation.
        if ($this->has('cnic')) {
            $this->merge([
                'cnic' => trim($this->cnic),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            // Personal Details
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'father_name' => ['required', 'string', 'max:100'],
            'cnic' => [
                'required',
                'string',
                'regex:/^\d{5}-\d{7}-\d{1}$/',
                Rule::unique('staff', 'cnic')->whereNull('deleted_at'),
            ],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['required', 'date', 'before:today'],

            // Employment Details
            'designation' => ['required', 'string', 'max:100'],
            'joining_date' => ['required', 'date'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'on_leave', 'resigned', 'terminated'])],

            // Academic & Diplomas
            'qualification' => ['required', 'string', 'max:100'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:150'],

            // Contact & Address
            'phone' => ['required', 'string', 'max:20'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('staff', 'email')->whereNull('deleted_at'),
                Rule::unique('users', 'email'),
            ],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'cnic.regex' => 'The CNIC must be a valid 13-digit number in the format XXXXX-XXXXXXX-X.',
            'cnic.unique' => 'This CNIC number is already registered.',
        ];
    }
}