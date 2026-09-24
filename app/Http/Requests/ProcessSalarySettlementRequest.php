<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProcessSalarySettlementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'staff_id' => ['required', 'exists:staff,id'],
            'settlement_type' => ['required', 'in:monthly,resignation_prorated'],
            'month_year' => ['required', 'string'],
            'payment_date' => ['required', 'date'],
            'unpaid_leaves' => ['nullable', 'integer', 'min:0'],
            'apply_leave_cutoff' => ['required', 'boolean'],
            'payment_method' => ['required', 'in:cash,bank_transfer,cheque'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
