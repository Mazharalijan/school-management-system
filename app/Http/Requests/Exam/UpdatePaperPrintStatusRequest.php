<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaperPrintStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'print_status' => ['required', 'in:pending,queued,printed'],
            'total_copies_printed' => ['required_if:print_status,printed', 'integer', 'min:0'],
        ];
    }
}
