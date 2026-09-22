<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sectionId = $this->route('section') ? $this->route('section')->id : null;
        $classId = $this->input('school_class_id');

        return [
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('sections')->where(function ($query) use ($classId) {
                    return $query->where('school_class_id', $classId);
                })->ignore($sectionId),
            ],
            'capacity' => ['required', 'integer', 'min:1', 'max:200'],
            'room_number' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }
}