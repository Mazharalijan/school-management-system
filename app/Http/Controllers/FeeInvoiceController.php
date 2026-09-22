<?php

namespace App\Http\Controllers;

use App\Models\FeeInvoice;
use App\Models\SchoolClass;
use App\Services\FeeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FeeInvoiceController extends Controller
{
    public function __construct(protected FeeService $feeService) {}

    public function index(Request $request): Response
    {
        $query = FeeInvoice::with(['student:id,first_name,last_name,roll_no', 'schoolClass:id,name', 'section:id,name'])
            ->latest();

        if ($request->filled('school_class_id')) {
            $query->where('school_class_id', $request->school_class_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($s) use ($search) {
                      $s->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('roll_no', 'like', "%{$search}%");
                  });
            });
        }

        $invoices = $query->paginate(15)->withQueryString();
        $classes = SchoolClass::active()->select('id', 'name')->get();

        return Inertia::render('Fees/Invoices/Index', [
            'invoices' => $invoices,
            'classes' => $classes,
            'filters' => $request->only(['school_class_id', 'status', 'month', 'search']),
        ]);
    }

    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'month' => 'required|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
        ]);

        try {
            $count = $this->feeService->generateBulkInvoices($validated);
            return back()->with('success', "{$count} fee invoice(s) generated successfully.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(FeeInvoice $invoice): Response
    {
        $invoice->load([
            'student',
            'schoolClass',
            'section',
            'items.feeHead',
            'payments.receivedBy:id,name',
        ]);

        return Inertia::render('Fees/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function collectPayment(Request $request, FeeInvoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:1|max:' . $invoice->due_amount,
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'transaction_reference' => 'nullable|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $this->feeService->collectPayment($invoice, $validated, auth()->id());
            return back()->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to process payment: ' . $e->getMessage());
        }
    }
}