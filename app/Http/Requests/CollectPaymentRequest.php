<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CollectPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'amount_paid' => 'required|numeric|gt:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'transaction_reference' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:500',
        ];
    }
}
