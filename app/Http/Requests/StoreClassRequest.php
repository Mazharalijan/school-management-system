<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Single-operator system
    }

    public function rules(): array
    {
        $classId = $this->route('class') ? $this->route('class')->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'numeric_value' => ['required', 'integer', 'min:1', 'max:12'],
            'code' => ['required', 'string', 'max:50', Rule::unique('school_classes', 'code')->ignore($classId)],
            'description' => ['nullable', 'string', 'max:500'],
            'default_section_name' => [$classId ? 'nullable' : 'required', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'room_number' => ['nullable', 'string', 'max:50'],
        ];
    }
}
