<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseCategoryRequest;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Services\Accounting\ExpenseService;
use App\Services\Accounting\ProfitAndLossService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService,
        protected ProfitAndLossService $pnlService
    ) {}

    /**
     * Display the Expenses & Profit and Loss (P&L) dashboard.
     */
    public function index(Request $request): Response
    {
        $preset = $request->query('preset', 'this_month');

        // Resolve date range from preset or explicit inputs
        switch ($preset) {
            case 'today':
                $defaultStart = Carbon::today()->format('Y-m-d');
                $defaultEnd = Carbon::today()->format('Y-m-d');
                break;
            case 'last_month':
                $defaultStart = Carbon::now()->subMonth()->startOfMonth()->format('Y-m-d');
                $defaultEnd = Carbon::now()->subMonth()->endOfMonth()->format('Y-m-d');
                break;
            case 'this_quarter':
                $defaultStart = Carbon::now()->firstOfQuarter()->format('Y-m-d');
                $defaultEnd = Carbon::now()->lastOfQuarter()->format('Y-m-d');
                break;
            case 'this_year':
                $defaultStart = Carbon::now()->startOfYear()->format('Y-m-d');
                $defaultEnd = Carbon::now()->endOfYear()->format('Y-m-d');
                break;
            case 'all_time':
                $defaultStart = '2020-01-01';
                $defaultEnd = Carbon::now()->endOfYear()->format('Y-m-d');
                break;
            case 'this_month':
            default:
                $defaultStart = Carbon::now()->startOfMonth()->format('Y-m-d');
                $defaultEnd = Carbon::now()->endOfMonth()->format('Y-m-d');
                break;
        }

        $startDate = $request->query('start_date', $defaultStart);
        $endDate = $request->query('end_date', $defaultEnd);
        $activeTab = $request->query('tab', 'pnl'); // 'pnl' | 'expenses' | 'categories'

        $filters = [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'category_id' => $request->query('category_id', ''),
            'payment_method' => $request->query('payment_method', ''),
            'search' => $request->query('search', ''),
            'preset' => $preset,
            'tab' => $activeTab,
        ];

        // 1. Calculate P&L summary
        $pnlSummary = $this->pnlService->getProfitAndLossSummary($startDate, $endDate);

        // 2. Fetch paginated expense records
        $expenses = $this->expenseService->getExpenses($filters, 15);

        // 3. Fetch expense categories
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('name')
            ->get();

        return Inertia::render('Expenses/Index', [
            'pnlSummary' => $pnlSummary,
            'expenses' => $expenses,
            'categories' => $categories,
            'filters' => $filters,
            'paymentMethods' => [
                ['value' => 'cash', 'label' => 'Cash in Hand'],
                ['value' => 'bank_transfer', 'label' => 'Bank Transfer'],
                ['value' => 'cheque', 'label' => 'Bank Cheque'],
                ['value' => 'online', 'label' => 'Online / Digital'],
            ],
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $this->expenseService->createExpense($request->validated(), auth()->id());

        return back()->with('success', 'Expense recorded successfully.');
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $this->expenseService->updateExpense($expense, $request->validated());

        return back()->with('success', 'Expense record updated successfully.');
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        $this->expenseService->deleteExpense($expense);

        return back()->with('success', 'Expense record deleted successfully.');
    }

    /**
     * Store a newly created expense category.
     */
    public function storeCategory(StoreExpenseCategoryRequest $request): RedirectResponse
    {
        $this->expenseService->createCategory($request->validated());

        return back()->with('success', 'Expense category created successfully.');
    }
}
