<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare inputs before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('cnic')) {
            $this->merge([
                'cnic' => trim($this->cnic),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Extract staff model or ID from route binding
        $staff = $this->route('staff');
        $staffId = $staff ? ($staff->id ?? $staff) : null;
        $userId = $staff && is_object($staff) ? $staff->user_id : null;

        return [
            // Personal Details
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'father_name' => ['required', 'string', 'max:100'],
            'cnic' => [
                'required',
                'string',
                'regex:/^\d{5}-\d{7}-\d{1}$/',
                Rule::unique('staff', 'cnic')
                    ->whereNull('deleted_at')
                    ->ignore($staffId),
            ],
            'gender' => ['required', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['required', 'date', 'before:today'],

            // Employment Details
            'designation' => ['required', 'string', 'max:100'],
            'joining_date' => ['required', 'date'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive', 'on_leave', 'resigned', 'terminated'])],

            // Academic & Diplomas
            'qualification' => ['required', 'string', 'max:100'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:150'],

            // Contact & Credentials
            'phone' => ['required', 'string', 'max:20'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('staff', 'email')
                    ->whereNull('deleted_at')
                    ->ignore($staffId),
                Rule::unique('users', 'email')
                    ->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'cnic.regex' => 'The CNIC must be a valid 13-digit number in the format XXXXX-XXXXXXX-X.',
            'cnic.unique' => 'This CNIC number is already registered to another staff member.',
            'email.unique' => 'This email address is already in use.',
            'date_of_birth.before' => 'Date of birth must be a valid date in the past.',
        ];
    }
}