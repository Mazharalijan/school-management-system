<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chapter_id' => ['sometimes', 'required', 'exists:chapters,id'],
            'topic_name' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
