<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\StudentDocumentPrint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StudentDocumentPrint::with([
            'student.current_enrollment.school_class',
            'student.current_enrollment.section',
            'creator:id,name',
            'printLogs.printedBy:id,name',
        ])
            ->latest('id');

        if ($request->filled('type')) {
            $query->where('document_type', $request->type);
        }

        if ($request->filled('sub_type')) {
            $query->where('sub_type', $request->sub_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($sq) use ($search) {
                        $sq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('roll_number', 'like', "%{$search}%")
                            ->orWhere('admission_number', 'like', "%{$search}%");
                    });
            });
        }

        $certificates = $query->paginate(12)->withQueryString();
        $classes = SchoolClass::with('sections')->get();

        return Inertia::render('Certificates/Index', [
            'certificates' => $certificates,
            'classes' => $classes,
            'filters' => $request->only(['type', 'sub_type', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'sub_type' => 'required|string|in:leaving,character,bonafide,merit',
            'issue_date' => 'required|date',
            'conduct' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:1000',
            'achievement' => 'nullable|string|max:255',
            'leaving_date' => 'nullable|date',
        ]);

        $prefixMap = [
            'leaving' => 'SLC',
            'character' => 'CC',
            'bonafide' => 'BON',
            'merit' => 'MER',
        ];

        $titleMap = [
            'leaving' => 'School Leaving Certificate',
            'character' => 'Character Certificate',
            'bonafide' => 'Bonafide Student Certificate',
            'merit' => 'Certificate of Academic Merit',
        ];

        $prefix = $prefixMap[$validated['sub_type']] ?? 'CERT';
        $year = date('Y');
        $randomSeq = str_pad((string) (StudentDocumentPrint::count() + 1), 4, '0', STR_PAD_LEFT);
        $documentNumber = "{$prefix}-{$year}-{$randomSeq}";

        $document = StudentDocumentPrint::create([
            'student_id' => $validated['student_id'],
            'document_type' => 'certificate',
            'sub_type' => $validated['sub_type'],
            'document_number' => $documentNumber,
            'title' => $titleMap[$validated['sub_type']] ?? 'Certificate',
            'issue_date' => $validated['issue_date'],
            'metadata' => [
                'conduct' => $validated['conduct'] ?? 'Good',
                'reason' => $validated['reason'] ?? '',
                'remarks' => $validated['remarks'] ?? '',
                'achievement' => $validated['achievement'] ?? '',
                'leaving_date' => $validated['leaving_date'] ?? null,
            ],
            'print_count' => 1,
            'last_printed_at' => now(),
            'created_by' => auth()->id(),
        ]);

        // Record the initial 1st print (ORIGINAL)
        $document->printLogs()->create([
            'print_number' => 1,
            'printer_type' => 'standard',
            'copy_label' => 'ORIGINAL',
            'printed_by' => auth()->id(),
            'printed_at' => now(),
            'notes' => 'Initial Certificate Issuance',
        ]);

        return redirect()->back()->with('success', "Certificate {$documentNumber} issued successfully.");
    }

    public function recordPrint(Request $request, StudentDocumentPrint $certificate): JsonResponse
    {
        $printerType = $request->input('printer_type', 'standard');
        $notes = $request->input('notes');

        $log = $certificate->recordPrint($printerType, auth()->id(), $notes, true);

        return response()->json([
            'success' => true,
            'print_count' => $certificate->print_count,
            'copy_label' => $certificate->copy_label,
            'last_printed_at' => $certificate->last_printed_at?->format('Y-m-d H:i:s'),
            'log' => $log,
        ]);
    }

    public function destroy(StudentDocumentPrint $certificate): RedirectResponse
    {
        $certificate->delete();

        return redirect()->back()->with('success', 'Certificate record deleted.');
    }
}
