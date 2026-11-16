<?php

namespace App\Http\Controllers;

use App\Models\ExamPaperExpense;
use App\Models\ExamPaperFee;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamPaperAccountingController extends Controller
{
    /**
     * Display paper money collection and paper expenses accounting dashboard.
     */
    public function index(Request $request): Response
    {
        $examSessions = ExamSession::orderBy('created_at', 'desc')->get(['id', 'title', 'session_year', 'status']);

        $selectedSessionId = $request->input('exam_session_id');
        if (! $selectedSessionId && $examSessions->isNotEmpty()) {
            $selectedSessionId = $examSessions->first()->id;
        }

        $activeSession = $selectedSessionId ? ExamSession::find($selectedSessionId) : null;
        $classes = SchoolClass::orderBy('name')->get(['id', 'name']);
        $settings = SystemSetting::first();

        // 1. Paper Fees Query
        $feesQuery = ExamPaperFee::with([
            'student:id,first_name,last_name,admission_number,roll_number,photo_path',
            'schoolClass:id,name',
            'feeInvoice:id,invoice_no',
            'createdBy:id,name',
        ]);

        if ($selectedSessionId) {
            $feesQuery->where('exam_session_id', $selectedSessionId);
        }

        if ($request->filled('school_class_id') && $request->school_class_id !== 'all') {
            $feesQuery->where('school_class_id', $request->school_class_id);
        }

        if ($request->filled('fee_status') && $request->fee_status !== 'all') {
            $feesQuery->where('status', $request->fee_status);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $feesQuery->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('roll_number', 'like', "%{$search}%")
                    ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        $fees = $feesQuery->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'fees_page')
            ->withQueryString();

        // 2. Paper Expenses Query
        $expensesQuery = ExamPaperExpense::with('createdBy:id,name');

        if ($selectedSessionId) {
            $expensesQuery->where('exam_session_id', $selectedSessionId);
        }

        if ($request->filled('expense_category') && $request->expense_category !== 'all') {
            $expensesQuery->where('category', $request->expense_category);
        }

        $expenses = $expensesQuery->orderBy('expense_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15, ['*'], 'expenses_page')
            ->withQueryString();

        // 3. Profit & Loss Metrics for this Exam Session
        $sessionFees = ExamPaperFee::where('exam_session_id', $selectedSessionId);
        $totalCharged = (float) (clone $sessionFees)->sum('amount');
        $totalCollected = (float) (clone $sessionFees)->where('status', 'paid')->sum('paid_amount');
        $totalUnpaid = (float) (clone $sessionFees)->where('status', 'unpaid')->sum('amount');
        $studentsCount = (int) (clone $sessionFees)->count();
        $paidStudentsCount = (int) (clone $sessionFees)->where('status', 'paid')->count();

        $sessionExpenses = ExamPaperExpense::where('exam_session_id', $selectedSessionId);
        $totalExpenses = (float) (clone $sessionExpenses)->sum('amount');
        $expensesCount = (int) (clone $sessionExpenses)->count();

        $netProfitLoss = $totalCollected - $totalExpenses;
        $isProfit = $netProfitLoss >= 0;
        $profitMargin = $totalCollected > 0 ? round(($netProfitLoss / $totalCollected) * 100, 1) : 0;

        // Breakdown of expenses by category for this session
        $expensesByCategory = (clone $sessionExpenses)
            ->selectRaw('category, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'total' => (float) $row->total_amount,
                'count' => (int) $row->count,
                'percentage' => $totalExpenses > 0 ? round(((float) $row->total_amount / $totalExpenses) * 100, 1) : 0,
            ])
            ->values()
            ->all();

        // All-Time Paper Accounting Summary
        $allTimeCollected = (float) ExamPaperFee::where('status', 'paid')->sum('paid_amount');
        $allTimeExpenses = (float) ExamPaperExpense::sum('amount');
        $allTimeNet = $allTimeCollected - $allTimeExpenses;

        $pnl = [
            'total_students' => $studentsCount,
            'paid_students' => $paidStudentsCount,
            'total_charged' => $totalCharged,
            'total_collected' => $totalCollected,
            'total_unpaid' => $totalUnpaid,
            'collection_rate' => $totalCharged > 0 ? round(($totalCollected / $totalCharged) * 100, 1) : 0,
            'total_expenses' => $totalExpenses,
            'expenses_count' => $expensesCount,
            'net_profit_loss' => $netProfitLoss,
            'is_profit' => $isProfit,
            'profit_margin' => $profitMargin,
            'expenses_by_category' => $expensesByCategory,
            'all_time' => [
                'collected' => $allTimeCollected,
                'expenses' => $allTimeExpenses,
                'net' => $allTimeNet,
                'is_profit' => $allTimeNet >= 0,
            ],
        ];

        return Inertia::render('Exam/PaperAccounting/Index', [
            'examSessions' => $examSessions,
            'activeSession' => $activeSession,
            'classes' => $classes,
            'fees' => $fees,
            'expenses' => $expenses,
            'pnl' => $pnl,
            'filters' => [
                'exam_session_id' => $selectedSessionId,
                'school_class_id' => $request->school_class_id,
                'fee_status' => $request->fee_status,
                'expense_category' => $request->expense_category,
                'search' => $request->search,
                'active_tab' => $request->input('active_tab', 'fees'),
            ],
            'settings' => $settings,
        ]);
    }

    /**
     * Generate paper fee charge for all enrolled students of a class for an exam session.
     */
    public function generateClassFees(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exam_session_id' => ['required', 'exists:exam_sessions,id'],
            'school_class_id' => ['required', 'exists:school_classes,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $enrollments = StudentEnrollment::where('school_class_id', $validated['school_class_id'])
            ->where('is_current', true)
            ->get();

        if ($enrollments->isEmpty()) {
            return redirect()->back()->with('error', 'No enrolled students found in this class.');
        }

        $createdCount = 0;
        foreach ($enrollments as $enrollment) {
            $paperFee = ExamPaperFee::firstOrCreate(
                [
                    'exam_session_id' => $validated['exam_session_id'],
                    'student_id' => $enrollment->student_id,
                ],
                [
                    'school_class_id' => $validated['school_class_id'],
                    'amount' => $validated['amount'],
                    'paid_amount' => 0.00,
                    'status' => 'unpaid',
                    'notes' => $validated['notes'] ?? 'Term Exam Paper Fee',
                    'created_by' => auth()->id(),
                ]
            );

            if ($paperFee->wasRecentlyCreated) {
                $createdCount++;
            }
        }

        return redirect()->back()->with('success', "Exam paper fee charged to {$createdCount} students.");
    }

    /**
     * Assign paper fee to an individual student.
     */
    public function storeFee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exam_session_id' => ['required', 'exists:exam_sessions,id'],
            'student_id' => ['required', 'exists:students,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
            'collect_now' => ['nullable', 'boolean'],
            'payment_method' => ['required_if:collect_now,true', 'nullable', 'string'],
        ]);

        $student = Student::with('current_enrollment')->findOrFail($validated['student_id']);
        $schoolClassId = $student->current_enrollment?->school_class_id;

        $collectNow = ! empty($validated['collect_now']);
        $receiptNo = $collectNow ? 'PMR-'.date('Ymd').'-'.str_pad((string) rand(100, 9999), 4, '0', STR_PAD_LEFT) : null;

        ExamPaperFee::updateOrCreate(
            [
                'exam_session_id' => $validated['exam_session_id'],
                'student_id' => $student->id,
            ],
            [
                'school_class_id' => $schoolClassId,
                'amount' => $validated['amount'],
                'paid_amount' => $collectNow ? $validated['amount'] : 0.00,
                'status' => $collectNow ? 'paid' : 'unpaid',
                'receipt_no' => $receiptNo,
                'paid_date' => $collectNow ? now()->toDateString() : null,
                'payment_method' => $collectNow ? ($validated['payment_method'] ?? 'cash') : null,
                'notes' => $validated['notes'] ?? 'Term Exam Paper Fee',
                'created_by' => auth()->id(),
            ]
        );

        return redirect()->back()->with('success', 'Student paper fee assigned successfully.');
    }

    /**
     * Collect student paper fee payment on the spot.
     */
    public function collectFee(Request $request, ExamPaperFee $paperFee): RedirectResponse
    {
        if ($paperFee->status === 'paid') {
            return redirect()->back()->with('error', 'This paper fee is already collected.');
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,online,other'],
            'paid_date' => ['required', 'date'],
        ]);

        $receiptNo = 'PMR-'.date('Ymd').'-'.str_pad((string) $paperFee->id, 4, '0', STR_PAD_LEFT);

        $paperFee->update([
            'status' => 'paid',
            'paid_amount' => $paperFee->amount,
            'paid_date' => $validated['paid_date'],
            'payment_method' => $validated['payment_method'],
            'receipt_no' => $receiptNo,
        ]);

        return redirect()->back()->with('success', "Exam paper fee collected. Receipt: {$receiptNo}");
    }

    /**
     * Delete an unpaid paper fee record.
     */
    public function destroyFee(ExamPaperFee $paperFee): RedirectResponse
    {
        if ($paperFee->status === 'paid') {
            return redirect()->back()->with('error', 'Cannot delete a paid paper fee record.');
        }

        $paperFee->delete();

        return redirect()->back()->with('success', 'Paper fee charge removed.');
    }

    /**
     * Record an expenditure for exam papers.
     */
    public function storeExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exam_session_id' => ['required', 'exists:exam_sessions,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:printing,stationery,typing_composing,marking_evaluation,other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'invoice_bill_no' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        ExamPaperExpense::create([
            'exam_session_id' => $validated['exam_session_id'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'],
            'vendor_name' => $validated['vendor_name'] ?? null,
            'invoice_bill_no' => $validated['invoice_bill_no'] ?? null,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Exam paper expense logged successfully.');
    }

    /**
     * Delete an exam paper expense record.
     */
    public function destroyExpense(ExamPaperExpense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->back()->with('success', 'Paper expense record deleted.');
    }
}
