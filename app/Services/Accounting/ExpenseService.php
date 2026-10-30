<?php

namespace App\Services\Accounting;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseService
{
    /**
     * Get paginated expenses filtered by search, category, and date range.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getExpenses(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Expense::with(['category', 'creator'])
            ->when(! empty($filters['search']), function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('expense_no', 'like', "%{$search}%")
                        ->orWhere('paid_to', 'like', "%{$search}%")
                        ->orWhere('reference_no', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['category_id']), function ($query) use ($filters) {
                $query->where('expense_category_id', $filters['category_id']);
            })
            ->when(! empty($filters['payment_method']), function ($query) use ($filters) {
                $query->where('payment_method', $filters['payment_method']);
            })
            ->when(! empty($filters['start_date']) && ! empty($filters['end_date']), function ($query) use ($filters) {
                $query->whereBetween('expense_date', [$filters['start_date'], $filters['end_date']]);
            })
            ->orderByDesc('expense_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store a new expense record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createExpense(array $data, ?int $userId = null): Expense
    {
        $data['created_by'] = $userId;
        $data['status'] = $data['status'] ?? 'paid';

        return Expense::create($data);
    }

    /**
     * Update an existing expense record.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateExpense(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh(['category', 'creator']);
    }

    /**
     * Delete an expense record.
     */
    public function deleteExpense(Expense $expense): bool
    {
        return $expense->delete();
    }

    /**
     * Create a new expense category.
     *
     * @param  array<string, mixed>  $data
     */
    public function createCategory(array $data): ExpenseCategory
    {
        if (empty($data['code'])) {
            $slug = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $data['name']), 0, 8));
            $data['code'] = 'EXP-'.$slug;
        }

        return ExpenseCategory::create($data);
    }
}
