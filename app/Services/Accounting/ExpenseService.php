<?php

namespace App\Services\Accounting;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FeePayment;
use App\Models\StaffSalaryAdvance;
use App\Models\StaffSalarySettlement;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as LengthAwarePaginatorContract;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseService
{
    /**
     * Get unified financial transactions ledger combining Fee Collections (Inflow),
     * Operating Expenses (Outflow), Staff Payroll (Outflow), and Salary Advances (Outflow).
     *
     * @param  array<string, mixed>  $filters
     * @return array{paginator: LengthAwarePaginatorContract, summary: array<string, mixed>}
     */
    public function getFinancialLedger(array $filters = [], int $perPage = 15): array
    {
        $startDate = ! empty($filters['start_date']) ? $filters['start_date'] : null;
        $endDate = ! empty($filters['end_date']) ? $filters['end_date'] : null;
        $search = ! empty($filters['search']) ? trim($filters['search']) : null;
        $type = ! empty($filters['type']) ? $filters['type'] : 'all'; // 'all' | 'incoming' | 'outgoing' | 'operating' | 'payroll'
        $categoryId = ! empty($filters['category_id']) ? $filters['category_id'] : null;
        $paymentMethod = ! empty($filters['payment_method']) ? $filters['payment_method'] : null;

        $records = [];

        // 1. Inflow: Student Fee Collections
        if (($type === 'all' || $type === 'incoming') && empty($categoryId)) {
            $feeQuery = FeePayment::with(['student.current_enrollment.school_class', 'receiver'])
                ->when($startDate && $endDate, fn ($q) => $q->whereBetween('payment_date', [$startDate, $endDate]))
                ->when(! empty($paymentMethod), fn ($q) => $q->where('payment_method', $paymentMethod))
                ->when(! empty($search), function ($q) use ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('receipt_no', 'like', "%{$search}%")
                            ->orWhere('transaction_reference', 'like', "%{$search}%")
                            ->orWhere('note', 'like', "%{$search}%")
                            ->orWhereHas('student', function ($sq) use ($search) {
                                $sq->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%")
                                    ->orWhere('admission_number', 'like', "%{$search}%");
                            });
                    });
                });

            foreach ($feeQuery->get() as $fee) {
                $student = $fee->student;
                $className = $student?->current_enrollment?->school_class?->name;

                $records[] = [
                    'id' => 'fee_'.$fee->id,
                    'source_id' => $fee->id,
                    'source_type' => 'fee_payment',
                    'voucher_no' => $fee->receipt_no,
                    'direction' => 'in',
                    'type_label' => 'Fee Receipt',
                    'title' => 'Fee Collection: '.($student ? $student->full_name.($className ? " ({$className})" : '') : 'Student Fee'),
                    'category' => [
                        'id' => 'fee_collection',
                        'name' => 'Fee Collection',
                        'badge_color' => 'emerald',
                    ],
                    'party' => $student ? $student->full_name : 'Student',
                    'party_subtitle' => $student ? 'Adm: '.$student->admission_number.($className ? ' • '.$className : '') : null,
                    'date' => $fee->payment_date ? Carbon::parse($fee->payment_date)->format('Y-m-d') : null,
                    'payment_method' => $fee->payment_method ?? 'cash',
                    'reference_no' => $fee->transaction_reference,
                    'notes' => $fee->note,
                    'amount' => (float) $fee->amount_paid,
                    'signed_amount' => (float) $fee->amount_paid,
                    'recorded_by' => $fee->receiver?->name ?? 'Accounts Admin',
                    'can_edit' => false,
                ];
            }
        }

        // 2. Outflow: Operating Expenses
        if ($type === 'all' || $type === 'outgoing' || $type === 'operating') {
            $expenseQuery = Expense::with(['category', 'creator'])
                ->when($startDate && $endDate, fn ($q) => $q->whereBetween('expense_date', [$startDate, $endDate]))
                ->when(! empty($categoryId), fn ($q) => $q->where('expense_category_id', $categoryId))
                ->when(! empty($paymentMethod), fn ($q) => $q->where('payment_method', $paymentMethod))
                ->when(! empty($search), function ($q) use ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('title', 'like', "%{$search}%")
                            ->orWhere('expense_no', 'like', "%{$search}%")
                            ->orWhere('paid_to', 'like', "%{$search}%")
                            ->orWhere('reference_no', 'like', "%{$search}%")
                            ->orWhere('notes', 'like', "%{$search}%");
                    });
                });

            foreach ($expenseQuery->get() as $exp) {
                $records[] = [
                    'id' => 'exp_'.$exp->id,
                    'source_id' => $exp->id,
                    'source_type' => 'expense',
                    'voucher_no' => $exp->expense_no,
                    'direction' => 'out',
                    'type_label' => 'Operating Expense',
                    'title' => $exp->title,
                    'category' => [
                        'id' => $exp->expense_category_id,
                        'name' => $exp->category?->name ?? 'General Expense',
                        'badge_color' => 'rose',
                    ],
                    'party' => $exp->paid_to ?: 'Vendor / Payee',
                    'party_subtitle' => $exp->reference_no ? 'Ref: '.$exp->reference_no : null,
                    'date' => $exp->expense_date ? Carbon::parse($exp->expense_date)->format('Y-m-d') : null,
                    'payment_method' => $exp->payment_method ?? 'cash',
                    'reference_no' => $exp->reference_no,
                    'notes' => $exp->notes,
                    'amount' => (float) $exp->amount,
                    'signed_amount' => -((float) $exp->amount),
                    'recorded_by' => $exp->creator?->name ?? 'Finance Admin',
                    'can_edit' => true,
                    'raw' => [
                        'id' => $exp->id,
                        'expense_no' => $exp->expense_no,
                        'expense_category_id' => $exp->expense_category_id,
                        'title' => $exp->title,
                        'amount' => $exp->amount,
                        'expense_date' => $exp->expense_date ? Carbon::parse($exp->expense_date)->format('Y-m-d') : null,
                        'payment_method' => $exp->payment_method,
                        'reference_no' => $exp->reference_no,
                        'paid_to' => $exp->paid_to,
                        'notes' => $exp->notes,
                        'status' => $exp->status,
                    ],
                ];
            }
        }

        // 3. Outflow: Staff Payroll Settlements
        if (($type === 'all' || $type === 'outgoing' || $type === 'payroll') && empty($categoryId)) {
            $settlementQuery = StaffSalarySettlement::with(['staff', 'processor'])
                ->when($startDate && $endDate, fn ($q) => $q->whereBetween('payment_date', [$startDate, $endDate]))
                ->when(! empty($paymentMethod), fn ($q) => $q->where('payment_method', $paymentMethod))
                ->when(! empty($search), function ($q) use ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('voucher_no', 'like', "%{$search}%")
                            ->orWhere('reference_no', 'like', "%{$search}%")
                            ->orWhere('notes', 'like', "%{$search}%")
                            ->orWhere('month_year', 'like', "%{$search}%")
                            ->orWhereHas('staff', function ($sq) use ($search) {
                                $sq->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%")
                                    ->orWhere('employee_id', 'like', "%{$search}%");
                            });
                    });
                });

            foreach ($settlementQuery->get() as $sal) {
                $staff = $sal->staff;

                $records[] = [
                    'id' => 'sal_'.$sal->id,
                    'source_id' => $sal->id,
                    'source_type' => 'salary_settlement',
                    'voucher_no' => $sal->voucher_no,
                    'direction' => 'out',
                    'type_label' => 'Staff Payroll',
                    'title' => 'Payroll Settlement: '.($staff ? "{$staff->full_name} ({$sal->month_year})" : "Staff Salary ({$sal->month_year})"),
                    'category' => [
                        'id' => 'staff_payroll',
                        'name' => 'Staff Payroll',
                        'badge_color' => 'purple',
                    ],
                    'party' => $staff ? $staff->full_name : 'Staff Member',
                    'party_subtitle' => $staff ? ($staff->designation ?? 'Faculty').' • Emp #'.$staff->employee_id : null,
                    'date' => $sal->payment_date ? Carbon::parse($sal->payment_date)->format('Y-m-d') : null,
                    'payment_method' => $sal->payment_method ?? 'bank_transfer',
                    'reference_no' => $sal->reference_no,
                    'notes' => $sal->notes,
                    'amount' => (float) $sal->net_paid,
                    'signed_amount' => -((float) $sal->net_paid),
                    'recorded_by' => $sal->processor?->name ?? 'Payroll Dept',
                    'can_edit' => false,
                ];
            }

            // 4. Outflow: Staff Salary Advances
            if (empty($paymentMethod) || $paymentMethod === 'cash') {
                $advanceQuery = StaffSalaryAdvance::with(['staff', 'issuer'])
                    ->when($startDate && $endDate, fn ($q) => $q->whereBetween('issued_date', [$startDate, $endDate]))
                    ->when(! empty($search), function ($q) use ($search) {
                        $q->where(function ($sub) use ($search) {
                            $sub->where('reason', 'like', "%{$search}%")
                                ->orWhereHas('staff', function ($sq) use ($search) {
                                    $sq->where('first_name', 'like', "%{$search}%")
                                        ->orWhere('last_name', 'like', "%{$search}%")
                                        ->orWhere('employee_id', 'like', "%{$search}%");
                                });
                        });
                    });

                foreach ($advanceQuery->get() as $adv) {
                    $staff = $adv->staff;

                    $records[] = [
                        'id' => 'adv_'.$adv->id,
                        'source_id' => $adv->id,
                        'source_type' => 'salary_advance',
                        'voucher_no' => 'ADV-'.str_pad((string) $adv->id, 5, '0', STR_PAD_LEFT),
                        'direction' => 'out',
                        'type_label' => 'Salary Advance',
                        'title' => 'Salary Advance: '.($staff ? $staff->full_name : 'Staff Advance'),
                        'category' => [
                            'id' => 'salary_advance',
                            'name' => 'Salary Advance',
                            'badge_color' => 'amber',
                        ],
                        'party' => $staff ? $staff->full_name : 'Staff Member',
                        'party_subtitle' => $staff ? ($staff->designation ?? 'Staff').' • Emp #'.$staff->employee_id : null,
                        'date' => $adv->issued_date ? Carbon::parse($adv->issued_date)->format('Y-m-d') : null,
                        'payment_method' => 'cash',
                        'reference_no' => $adv->reason,
                        'notes' => $adv->reason,
                        'amount' => (float) $adv->amount,
                        'signed_amount' => -((float) $adv->amount),
                        'recorded_by' => $adv->issuer?->name ?? 'Finance Dept',
                        'can_edit' => false,
                    ];
                }
            }
        }

        $allCollection = collect($records);

        $totalInflow = (float) $allCollection->where('direction', 'in')->sum('amount');
        $totalOutflow = (float) $allCollection->where('direction', 'out')->sum('amount');
        $netBalance = $totalInflow - $totalOutflow;
        $inflowCount = $allCollection->where('direction', 'in')->count();
        $outflowCount = $allCollection->where('direction', 'out')->count();
        $totalCount = $allCollection->count();

        // Sort by date descending, then id descending
        $sorted = $allCollection->sortByDesc(function ($item) {
            return ($item['date'] ?? '1970-01-01').'_'.$item['id'];
        })->values();

        $currentPage = LengthAwarePaginator::resolveCurrentPage('page') ?: 1;
        $itemsForCurrentPage = $sorted->slice(($currentPage - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $itemsForCurrentPage,
            $totalCount,
            $perPage,
            $currentPage,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => request()->query(),
            ]
        );

        return [
            'paginator' => $paginator,
            'summary' => [
                'total_inflow' => $totalInflow,
                'total_outflow' => $totalOutflow,
                'net_balance' => $netBalance,
                'inflow_count' => $inflowCount,
                'outflow_count' => $outflowCount,
                'total_count' => $totalCount,
            ],
        ];
    }

    /**
     * Get paginated ledger or expense items.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getExpenses(array $filters = [], int $perPage = 15): LengthAwarePaginatorContract
    {
        return $this->getFinancialLedger($filters, $perPage)['paginator'];
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
