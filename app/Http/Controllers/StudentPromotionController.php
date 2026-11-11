<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSinglePromotionRequest;
use App\Http\Requests\StoreStudentPromotionRequest;
use App\Models\FeeHead;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Services\StudentPromotionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPromotionController extends Controller
{
    public function __construct(protected StudentPromotionService $promotionService) {}

    public function index(Request $request): Response
    {
        $classes = SchoolClass::with('sections')->orderBy('numeric_value')->get();

        // Existing session years in system, combined with sensible defaults
        $dbSessions = StudentEnrollment::distinct()->pluck('session_year')->filter()->values()->all();
        $currentYear = (int) date('Y');
        $defaultSessions = [
            ($currentYear - 1).'-'.$currentYear,
            $currentYear.'-'.($currentYear + 1),
            ($currentYear + 1).'-'.($currentYear + 2),
            (string) $currentYear,
            (string) ($currentYear + 1),
        ];
        $sessionYears = array_values(array_unique(array_merge($dbSessions, $defaultSessions)));
        sort($sessionYears);

        $defaultCurrentSession = end($dbSessions) ?: date('Y').'-'.(date('Y') + 1);

        $sourceClassId = $request->filled('source_class_id')
            ? (int) $request->source_class_id
            : ($classes->first()?->id ?? 1);

        $sourceSectionId = $request->filled('source_section_id')
            ? (int) $request->source_section_id
            : null;

        $sourceSessionYear = $request->get('source_session_year', $defaultCurrentSession);

        // Derive target session year (next year by default)
        $targetSessionYear = $request->get('target_session_year');
        if (! $targetSessionYear) {
            if (preg_match('/^(\d{4})-(\d{4})$/', $sourceSessionYear, $m)) {
                $targetSessionYear = ($m[1] + 1).'-'.($m[2] + 1);
            } elseif (preg_match('/^(\d{4})$/', $sourceSessionYear, $m)) {
                $targetSessionYear = (string) ($m[1] + 1);
            } else {
                $targetSessionYear = (date('Y') + 1).'-'.(date('Y') + 2);
            }
        }

        // Determine suggested target class (next grade by numeric_value)
        $sourceClass = $classes->firstWhere('id', $sourceClassId);
        $suggestedTargetClass = $classes->first(fn ($c) => $c->numeric_value > ($sourceClass?->numeric_value ?? 0)) ?? $sourceClass;

        // Fetch students
        $eligibleStudents = $this->promotionService->getEligibleStudents(
            $sourceClassId,
            $sourceSectionId,
            $sourceSessionYear,
            $targetSessionYear
        );

        // Class Fee Structures
        $feeStructures = FeeStructure::with('feeHead')
            ->whereIn('session_year', array_filter([$sourceSessionYear, $targetSessionYear]))
            ->get();

        $admissionHead = FeeHead::where('type', 'one_time')
            ->where('title', 'like', '%admission%')
            ->first();

        return Inertia::render('Students/Promotion/Index', [
            'classes' => $classes,
            'sessionYears' => $sessionYears,
            'filters' => [
                'source_class_id' => $sourceClassId,
                'source_section_id' => $sourceSectionId,
                'source_session_year' => $sourceSessionYear,
                'target_session_year' => $targetSessionYear,
            ],
            'sourceClass' => $sourceClass,
            'suggestedTargetClass' => $suggestedTargetClass,
            'students' => $eligibleStudents,
            'feeStructures' => $feeStructures,
            'admissionHead' => $admissionHead,
        ]);
    }

    public function promote(StoreStudentPromotionRequest $request): RedirectResponse
    {
        try {
            $stats = $this->promotionService->promoteBulk($request->validated(), (int) (auth()->id() ?? 1));

            $targetClass = SchoolClass::find($request->validated('target_class_id'));
            $className = $targetClass?->name ?? 'Next Class';
            $sessionYear = $request->validated('target_session_year');

            $message = "Successfully promoted {$stats['total']} student(s) to {$className} ({$sessionYear}).";
            if ($stats['skipped'] > 0) {
                $message .= " ({$stats['skipped']} skipped class levels)";
            }
            if ($stats['retained'] > 0) {
                $message .= " ({$stats['retained']} retained in same class)";
            }

            return redirect()->route('students.promotion.index', [
                'source_class_id' => $request->source_class_id,
                'source_session_year' => $request->source_session_year ?? $sessionYear,
                'target_session_year' => $sessionYear,
            ])->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Promotion failed: '.$e->getMessage());
        }
    }

    public function promoteSingle(StoreSinglePromotionRequest $request, Student $student): RedirectResponse
    {
        try {
            $this->promotionService->promoteSingle($student->id, $request->validated(), (int) (auth()->id() ?? 1));

            $targetClass = SchoolClass::find($request->validated('target_class_id'));
            $className = $targetClass?->name ?? 'Next Class';
            $sessionYear = $request->validated('target_session_year');

            return back()->with('success', "Student {$student->full_name} has been successfully promoted to {$className} ({$sessionYear}).");
        } catch (\Exception $e) {
            return back()->with('error', 'Student promotion failed: '.$e->getMessage());
        }
    }
}
