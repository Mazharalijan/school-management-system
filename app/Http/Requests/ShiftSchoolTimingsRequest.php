<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShiftSchoolTimingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'old_start_time' => 'required',
            'new_start_time' => 'required',
            'old_end_time'   => 'required',
            'new_end_time'   => 'required',
            'delta_minutes'  => 'required',
        ];
    }
}