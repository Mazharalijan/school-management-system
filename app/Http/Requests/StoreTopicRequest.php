<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chapter_id' => ['required', 'exists:chapters,id'],
            'topic_name' => ['required', 'string', 'max:255'],
        ];
    }
}