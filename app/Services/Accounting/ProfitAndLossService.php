<?php

namespace App\Services\Accounting;

use App\Models\ExamPaperExpense;
use App\Models\ExamPaperFee;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FeePayment;
use App\Models\StaffSalaryAdvance;
use App\Models\StaffSalarySettlement;
use App\Models\StudentFine;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProfitAndLossService
{
    /**
     * Compute comprehensive Profit & Loss summary and breakdown for a given date range.
     *
     * @return array<string, mixed>
     */
    public function getProfitAndLossSummary(string $startDate, string $endDate): array
    {
        $includeFines = (bool) (SystemSetting::first()?->include_fines_in_financial_flow ?? true);

        // 1. Revenue: Student Fee Collections
        $feeRevenue = (float) FeePayment::whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount_paid');

        // 1b. Student Fine Collections (conditionally included based on system settings)
        $fineRevenue = 0.0;
        $fineCount = 0;
        if ($includeFines) {
            $fineRevenue = (float) StudentFine::where('status', 'paid')
                ->whereBetween('paid_date', [$startDate, $endDate])
                ->sum('paid_amount');
            $fineCount = StudentFine::where('status', 'paid')
                ->whereBetween('paid_date', [$startDate, $endDate])
                ->count();
        }

        // 1c. Exam Paper Fees
        $examPaperRevenue = (float) ExamPaperFee::where('status', 'paid')
            ->whereBetween('paid_date', [$startDate, $endDate])
            ->sum('paid_amount');
        $examPaperFeeCount = ExamPaperFee::where('status', 'paid')
            ->whereBetween('paid_date', [$startDate, $endDate])
            ->count();

        $revenueByMethod = FeePayment::whereBetween('payment_date', [$startDate, $endDate])
            ->select('payment_method', DB::raw('SUM(amount_paid) as total_amount'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method,
                'total' => (float) $row->total_amount,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        // 2. Operating Expenses
        $operatingExpenses = (float) Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('amount');

        // 2b. Exam Paper Expenses
        $examPaperExpenses = (float) ExamPaperExpense::whereBetween('expense_date', [$startDate, $endDate])
            ->sum('amount');
        $examPaperExpenseCount = ExamPaperExpense::whereBetween('expense_date', [$startDate, $endDate])
            ->count();

        $examPaperNet = $examPaperRevenue - $examPaperExpenses;

        $expensesByCategory = ExpenseCategory::withSum(['expenses' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('expense_date', [$startDate, $endDate])
                ->where('status', 'paid');
        }], 'amount')
            ->withCount(['expenses' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('expense_date', [$startDate, $endDate])
                    ->where('status', 'paid');
            }])
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'code' => $cat->code,
                'total' => (float) ($cat->expenses_sum_amount ?? 0),
                'count' => (int) ($cat->expenses_count ?? 0),
                'percentage' => $operatingExpenses > 0
                    ? round(((float) ($cat->expenses_sum_amount ?? 0) / $operatingExpenses) * 100, 1)
                    : 0,
            ])
            ->filter(fn ($cat) => $cat['total'] > 0 || $cat['count'] > 0)
            ->values()
            ->all();

        // 3. Payroll Expenses (Staff Salary Settlements)
        $payrollExpenses = (float) StaffSalarySettlement::whereBetween('payment_date', [$startDate, $endDate])
            ->sum('net_paid');

        $advancesIssued = (float) StaffSalaryAdvance::whereBetween('issued_date', [$startDate, $endDate])
            ->sum('amount');

        // 4. Totals and Net Profit / Loss
        $totalRevenue = $feeRevenue + $fineRevenue + $examPaperRevenue;
        $totalExpenses = $operatingExpenses + $payrollExpenses + $examPaperExpenses;
        $netProfitLoss = $totalRevenue - $totalExpenses;
        $profitMargin = $totalRevenue > 0
            ? round(($netProfitLoss / $totalRevenue) * 100, 1)
            : 0;

        // 5. Monthly Trend Breakdown (Last 6 Months up to end date)
        $monthlyTrends = $this->getMonthlyTrends($endDate, 6);

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'formatted_period' => Carbon::parse($startDate)->format('M d, Y').' — '.Carbon::parse($endDate)->format('M d, Y'),
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'fee_collections' => $feeRevenue,
                'fine_collections' => $fineRevenue,
                'fine_collections_count' => $fineCount,
                'exam_paper_fees' => $examPaperRevenue,
                'exam_paper_fees_count' => $examPaperFeeCount,
                'include_fines_in_financial_flow' => $includeFines,
                'by_method' => $revenueByMethod,
            ],
            'expenses' => [
                'total' => $totalExpenses,
                'operating_total' => $operatingExpenses,
                'payroll_total' => $payrollExpenses,
                'advances_issued' => $advancesIssued,
                'exam_paper_expenses' => $examPaperExpenses,
                'exam_paper_expenses_count' => $examPaperExpenseCount,
                'by_category' => $expensesByCategory,
            ],
            'exam_paper_accounting' => [
                'total_collected' => $examPaperRevenue,
                'total_expenses' => $examPaperExpenses,
                'net_profit_loss' => $examPaperNet,
                'is_profit' => $examPaperNet >= 0,
            ],
            'net_profit_loss' => [
                'amount' => $netProfitLoss,
                'margin_percentage' => $profitMargin,
                'is_profit' => $netProfitLoss >= 0,
            ],
            'monthly_trends' => $monthlyTrends,
        ];
    }

    /**
     * Compute monthly revenue and expense trends.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMonthlyTrends(string $referenceDate, int $monthsCount = 6): array
    {
        $trends = [];
        $base = Carbon::parse($referenceDate)->startOfMonth();
        $includeFines = (bool) (SystemSetting::first()?->include_fines_in_financial_flow ?? true);

        for ($i = $monthsCount - 1; $i >= 0; $i--) {
            $monthStart = $base->copy()->subMonths($i)->startOfMonth()->format('Y-m-d');
            $monthEnd = $base->copy()->subMonths($i)->endOfMonth()->format('Y-m-d');
            $monthLabel = $base->copy()->subMonths($i)->format('M Y');

            $feeRev = (float) FeePayment::whereBetween('payment_date', [$monthStart, $monthEnd])->sum('amount_paid');
            $fineRev = $includeFines
                ? (float) StudentFine::where('status', 'paid')->whereBetween('paid_date', [$monthStart, $monthEnd])->sum('paid_amount')
                : 0.0;
            $paperRev = (float) ExamPaperFee::where('status', 'paid')->whereBetween('paid_date', [$monthStart, $monthEnd])->sum('paid_amount');
            $rev = $feeRev + $fineRev + $paperRev;

            $opExp = (float) Expense::whereBetween('expense_date', [$monthStart, $monthEnd])->where('status', 'paid')->sum('amount');
            $payExp = (float) StaffSalarySettlement::whereBetween('payment_date', [$monthStart, $monthEnd])->sum('net_paid');
            $paperExp = (float) ExamPaperExpense::whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount');
            $totExp = $opExp + $payExp + $paperExp;
            $net = $rev - $totExp;

            $trends[] = [
                'month' => $monthLabel,
                'revenue' => $rev,
                'operating_expenses' => $opExp,
                'payroll_expenses' => $payExp,
                'paper_expenses' => $paperExp,
                'total_expenses' => $totExp,
                'net_profit' => $net,
                'is_profit' => $net >= 0,
            ];
        }

        return $trends;
    }
}
