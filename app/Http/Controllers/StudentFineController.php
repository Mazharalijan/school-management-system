<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentFine;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StudentFineController extends Controller
{
    /**
     * Display a listing of student fines with filters and metrics.
     */
    public function index(Request $request): Response
    {
        $setting = SystemSetting::first();
        $includeInFinancialFlow = (bool) ($setting?->include_fines_in_financial_flow ?? true);

        $query = StudentFine::with([
            'student:id,first_name,last_name,admission_number,roll_number,photo_path',
            'schoolClass:id,name',
            'feeInvoice:id,invoice_no',
            'imposedBy:id,name',
            'collectedBy:id,name',
        ]);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('fine_type') && $request->fine_type !== 'all') {
            $query->where('fine_type', $request->fine_type);
        }

        if ($request->filled('collection_mode') && $request->collection_mode !== 'all') {
            $query->where('collection_mode', $request->collection_mode);
        }

        if ($request->filled('school_class_id') && $request->school_class_id !== 'all') {
            $query->where('school_class_id', $request->school_class_id);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('roll_number', 'like', "%{$search}%")
                    ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        $fines = $query->orderBy('fine_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Stats summary
        $allFines = StudentFine::query();
        $stats = [
            'total_fines_count' => (int) $allFines->count(),
            'total_fines_amount' => (float) (clone $allFines)->sum('amount'),
            'total_collected_amount' => (float) (clone $allFines)->where('status', 'paid')->sum('paid_amount'),
            'total_pending_amount' => (float) (clone $allFines)->where('status', 'unpaid')->sum('amount'),
            'total_waived_amount' => (float) (clone $allFines)->where('status', 'waived')->sum('amount'),
            'include_in_financial_flow' => $includeInFinancialFlow,
        ];

        $classes = SchoolClass::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Fines/Index', [
            'fines' => $fines,
            'classes' => $classes,
            'stats' => $stats,
            'filters' => $request->only(['status', 'fine_type', 'collection_mode', 'school_class_id', 'search']),
            'settings' => $setting,
        ]);
    }

    /**
     * Store a newly imposed fine.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'fine_type' => ['required', 'in:leave,exam,test,discipline,other'],
            'collection_mode' => ['required', 'in:on_the_spot,monthly,year_end'],
            'amount' => ['required', 'numeric', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
            'fine_date' => ['required', 'date'],
            'collect_now' => ['nullable', 'boolean'],
            'payment_method' => ['required_if:collect_now,true', 'nullable', 'string', 'in:cash,bank_transfer,online,other'],
        ]);

        $student = Student::with('current_enrollment')->findOrFail($validated['student_id']);
        $schoolClassId = $student->current_enrollment?->school_class_id;

        $collectNow = ! empty($validated['collect_now']);
        $status = $collectNow ? 'paid' : 'unpaid';
        $paidAmount = $collectNow ? (float) $validated['amount'] : 0.00;
        $receiptNo = $collectNow ? 'FINE-'.date('Ymd').'-'.strtoupper(Str::random(4)) : null;
        $paidDate = $collectNow ? $validated['fine_date'] : null;
        $paymentMethod = $collectNow ? ($validated['payment_method'] ?? 'cash') : null;

        StudentFine::create([
            'student_id' => $student->id,
            'school_class_id' => $schoolClassId,
            'fine_type' => $validated['fine_type'],
            'collection_mode' => $validated['collection_mode'],
            'amount' => $validated['amount'],
            'paid_amount' => $paidAmount,
            'reason' => $validated['reason'],
            'fine_date' => $validated['fine_date'],
            'status' => $status,
            'receipt_no' => $receiptNo,
            'paid_date' => $paidDate,
            'payment_method' => $paymentMethod,
            'imposed_by' => auth()->id(),
            'collected_by' => $collectNow ? auth()->id() : null,
        ]);

        return redirect()->back()->with('success', 'Student fine imposed successfully.');
    }

    /**
     * Collect fine payment on the spot.
     */
    public function collect(Request $request, StudentFine $fine): RedirectResponse
    {
        if ($fine->status === 'paid') {
            return redirect()->back()->with('error', 'This fine is already marked as paid.');
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,online,other'],
            'paid_date' => ['required', 'date'],
        ]);

        $receiptNo = 'FINE-'.date('Ymd').'-'.str_pad((string) $fine->id, 4, '0', STR_PAD_LEFT);

        $fine->update([
            'status' => 'paid',
            'paid_amount' => $fine->amount,
            'paid_date' => $validated['paid_date'],
            'payment_method' => $validated['payment_method'],
            'receipt_no' => $receiptNo,
            'collected_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', "Fine collected successfully. Receipt: {$receiptNo}");
    }

    /**
     * Waive fine with justification.
     */
    public function waive(Request $request, StudentFine $fine): RedirectResponse
    {
        if ($fine->status === 'paid') {
            return redirect()->back()->with('error', 'Cannot waive an already paid fine.');
        }

        $validated = $request->validate([
            'waived_reason' => ['required', 'string', 'min:3', 'max:255'],
        ]);

        $fine->update([
            'status' => 'waived',
            'waived_reason' => $validated['waived_reason'],
        ]);

        return redirect()->back()->with('success', 'Fine has been waived.');
    }

    /**
     * Delete an unpaid or waived fine record.
     */
    public function destroy(StudentFine $fine): RedirectResponse
    {
        $fine->delete();

        return redirect()->back()->with('success', 'Fine record deleted.');
    }
}
