<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateInvoicesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'nullable|exists:school_classes,id', // null means all classes
            'session_year' => 'required|string',
            'month' => 'required|string',
            'month_order' => 'required|integer|between:1,12',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'include_one_time' => 'boolean',
        ];
    }
}