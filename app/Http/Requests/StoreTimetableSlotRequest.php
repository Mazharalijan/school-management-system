<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimetableSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id'      => 'nullable|exists:sections,id',
            'subject_id'      => 'nullable|exists:subjects,id',
            'staff_id'        => 'nullable|exists:staff,id',
            'day_of_week'     => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'period_number'   => 'required|integer|min:1|max:12',
            'start_time'      => 'nullable|date_format:H:i,H:i:s,h:i A',
            'end_time'        => 'nullable|date_format:H:i,H:i:s,h:i A',
            'room_number'     => 'nullable|string|max:50',
            'academic_year'   => 'nullable|string|max:20',
        ];
    }
}