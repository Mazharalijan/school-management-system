<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:inventory_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'asset_code' => ['required', 'string', 'max:100', 'unique:inventory_items,asset_code'],
            'type' => ['required', 'in:fixed_asset,consumable'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'total_price' => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}