<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_name' => ['required', 'string', 'max:255'],
            'school_tagline' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg', 'max:2048'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'current_session_year' => ['required', 'string', 'max:50'],
            'currency_symbol' => ['required', 'string', 'max:10'],
            'currency_code' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'string', 'max:100'],
            'date_format' => ['required', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:30'],
            'alt_phone' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:150'],
            'website' => ['nullable', 'url', 'max:150'],
            'address' => ['required', 'string', 'max:500'],
            'invoice_prefix' => ['required', 'string', 'max:20'],
            'receipt_footer_note' => ['nullable', 'string', 'max:500'],
        ];
    }
}