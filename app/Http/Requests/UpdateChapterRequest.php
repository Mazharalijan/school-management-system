<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id'   => ['sometimes', 'required', 'exists:subjects,id'],
            'chapter_name' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}