<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateTimetableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'working_days' => ['required', 'array', 'min:1'],
            'working_days.*' => ['string', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'periods_per_day' => ['required', 'integer', 'min:1', 'max:8'],
            'start_time' => ['required', 'date_format:H:i'],
            'period_duration_minutes' => ['required', 'integer', 'min:15', 'max:120'],
            'break_period' => ['nullable', 'integer', 'min:1', 'max:8'],
            'class_teacher_id' => ['nullable', 'exists:staff,id'],
            'is_full_time_teacher_class' => ['nullable', 'boolean'],

            // Allocation array per subject
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.subject_id' => ['required', 'exists:subjects,id'],
            'allocations.*.staff_id' => ['nullable', 'exists:staff,id'],
            'allocations.*.periods_per_week' => ['required', 'integer', 'min:1', 'max:30'],
            'allocations.*.room_number' => ['nullable', 'string', 'max:50'],
        ];
    }
}
