<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\FeePayment;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\StaffSalarySettlement;
use App\Models\Student;
use App\Services\Accounting\ProfitAndLossService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ProfitAndLossService $pnlService
    ) {}

    /**
     * Display the main administrative dashboard.
     */
    public function index(Request $request): Response
    {
        $period = $request->query('preset', $request->query('period', 'all_time'));

        // Resolve date range based on selected filter
        switch ($period) {
            case 'this_month':
                $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
                $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
                $periodLabel = 'This Month ('.Carbon::now()->format('M Y').')';
                break;
            case 'last_month':
                $startDate = Carbon::now()->subMonth()->startOfMonth()->format('Y-m-d');
                $endDate = Carbon::now()->subMonth()->endOfMonth()->format('Y-m-d');
                $periodLabel = 'Last Month ('.Carbon::now()->subMonth()->format('M Y').')';
                break;
            case 'this_year':
                $startDate = Carbon::now()->startOfYear()->format('Y-m-d');
                $endDate = Carbon::now()->endOfYear()->format('Y-m-d');
                $periodLabel = 'This Year ('.Carbon::now()->format('Y').')';
                break;
            case 'all_time':
            default:
                $startDate = '2020-01-01';
                $endDate = Carbon::now()->endOfYear()->format('Y-m-d');
                $periodLabel = 'All Time';
                break;
        }

        // 1. Student Statistics
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'active')->count();
        $maleStudents = Student::where('gender', 'male')->count();
        $femaleStudents = Student::where('gender', 'female')->count();

        // 2. Teacher & Staff Statistics
        $totalStaff = Staff::count();
        $activeStaff = Staff::where('status', 'active')->count();
        $teachersCount = Staff::where(function ($query) {
            $query->where('designation', 'like', '%Teacher%')
                ->orWhere('designation', 'like', '%Lecturer%')
                ->orWhere('designation', 'like', '%Professor%')
                ->orWhere('designation', 'like', '%Instructor%');
        })->count();

        if ($teachersCount === 0 && $totalStaff > 0) {
            $teachersCount = $totalStaff;
        }

        // 3. Class & Academic Stats
        $classesCount = SchoolClass::count();
        $sectionsCount = Section::count();

        // 4. Financials & Profit/Loss for Selected Period
        $pnlSummary = $this->pnlService->getProfitAndLossSummary($startDate, $endDate);

        // All-Time Summary for persistent KPI context
        $allTimeRevenue = (float) FeePayment::sum('amount_paid');
        $allTimeOperatingExpenses = (float) Expense::where('status', 'paid')->sum('amount');
        $allTimePayrollExpenses = (float) StaffSalarySettlement::sum('net_paid');
        $allTimeExpenses = $allTimeOperatingExpenses + $allTimePayrollExpenses;
        $allTimeProfitLoss = $allTimeRevenue - $allTimeExpenses;

        // 5. Recent Activity
        $recentExpenses = Expense::with('category')
            ->orderBy('expense_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($expense) => [
                'id' => $expense->id,
                'expense_no' => $expense->expense_no,
                'title' => $expense->title,
                'category' => $expense->category?->name ?? 'General',
                'amount' => (float) $expense->amount,
                'date' => Carbon::parse($expense->expense_date)->format('M d, Y'),
                'payment_method' => $expense->payment_method,
                'status' => $expense->status,
            ]);

        $recentFeePayments = FeePayment::with('student')
            ->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($payment) => [
                'id' => $payment->id,
                'receipt_no' => $payment->receipt_no,
                'student_name' => $payment->student?->full_name ?? 'Student',
                'photo_url' => $payment->student?->photo_url,
                'admission_number' => $payment->student?->admission_number ?? 'N/A',
                'amount' => (float) $payment->amount_paid,
                'date' => Carbon::parse($payment->payment_date)->format('M d, Y'),
                'payment_method' => $payment->payment_method,
            ]);

        // Monthly trends from PnL service (last 6 months)
        $referenceDate = Carbon::now()->format('Y-m-d');
        $monthlyTrends = $this->pnlService->getMonthlyTrends($referenceDate, 6);

        return Inertia::render('Dashboard', [
            'stats' => [
                'students' => [
                    'total' => $totalStudents,
                    'active' => $activeStudents,
                    'male' => $maleStudents,
                    'female' => $femaleStudents,
                ],
                'staff' => [
                    'total' => $totalStaff,
                    'active' => $activeStaff,
                    'teachers' => $teachersCount,
                ],
                'academics' => [
                    'classes' => $classesCount,
                    'sections' => $sectionsCount,
                ],
                'financials' => [
                    'selected_period' => [
                        'period' => $period,
                        'label' => $periodLabel,
                        'revenue' => $pnlSummary['revenue']['total'],
                        'expenses' => $pnlSummary['expenses']['total'],
                        'operating_expenses' => $pnlSummary['expenses']['operating_total'],
                        'payroll_expenses' => $pnlSummary['expenses']['payroll_total'],
                        'net_profit_loss' => $pnlSummary['net_profit_loss']['amount'],
                        'margin_percentage' => $pnlSummary['net_profit_loss']['margin_percentage'],
                        'is_profit' => $pnlSummary['net_profit_loss']['is_profit'],
                    ],
                    'all_time' => [
                        'revenue' => $allTimeRevenue,
                        'expenses' => $allTimeExpenses,
                        'operating_expenses' => $allTimeOperatingExpenses,
                        'payroll_expenses' => $allTimePayrollExpenses,
                        'net_profit_loss' => $allTimeProfitLoss,
                        'is_profit' => $allTimeProfitLoss >= 0,
                    ],
                    'categories_breakdown' => $pnlSummary['expenses']['by_category'],
                ],
            ],
            'recentExpenses' => $recentExpenses,
            'recentFeePayments' => $recentFeePayments,
            'monthlyTrends' => $monthlyTrends,
            'currentPeriod' => $period,
            'dashboardTheme' => \App\Models\SystemSetting::first()?->dashboard_theme ?? 'shadcn',
        ]);
    }
}
