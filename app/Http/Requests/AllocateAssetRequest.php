<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AllocateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'allocation_target' => 'required|string|in:location,staff',
            'staff_id' => ['required_if:allocation_target,staff|nullable|exists:staff,id'],
            'assigned_location' => ['nullable', 'required_if:allocation_target,location', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'allocated_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
