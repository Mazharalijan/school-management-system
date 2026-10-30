<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\ProcessExamResultRequest;
use App\Http\Requests\Exam\StoreBulkStudentMarksRequest;
use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\StudentMark;
use App\Services\Exam\MarksAndResultService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentMarkController extends Controller
{
    public function __construct(protected MarksAndResultService $marksService) {}

    /**
     * Display the main Marks Entry UI
     */
    public function entryForm(Request $request): Response
    {
        $sessions = ExamSession::orderByDesc('id')->get();
        $classes = SchoolClass::with('sections')->orderBy('numeric_value')->get();

        $selectedSessionId = (int) ($request->query('exam_session_id') ?: $sessions->first()?->id ?: 1);
        $selectedClassId = (int) ($request->query('school_class_id') ?: $classes->first()?->id ?: 1);
        $selectedSectionId = $request->query('section_id') ? (int) $request->query('section_id') : null;

        $marksData = $this->marksService->getMarksEntryData($selectedSessionId, $selectedClassId, $selectedSectionId);

        return Inertia::render('ExamClassPapers/marks/Index', [
            'sessions' => $sessions,
            'classes' => $classes,
            'examTerm' => [
                'id' => $marksData['session']?->id ?? $selectedSessionId,
                'name' => $marksData['session']?->title ?? 'Exam Session',
                'session_year' => $marksData['session']?->session_year ?? '',
            ],
            'classDetails' => [
                'id' => $marksData['class']?->id ?? $selectedClassId,
                'name' => $marksData['class']?->name ?? 'Class',
                'sections' => $marksData['class']?->sections ?? [],
            ],
            'papers' => $marksData['subjects'],
            'initialStudents' => $marksData['students'],
            'teacher' => [
                'id' => auth()->id() ?? 1,
                'name' => auth()->user()?->name ?? 'Admin / Teacher',
                'emp_id' => 'EMP-001',
                'designation' => 'Class Teacher / Exam Controller',
            ],
            'filters' => [
                'exam_session_id' => $selectedSessionId,
                'school_class_id' => $selectedClassId,
                'section_id' => $selectedSectionId,
                'search' => $request->query('search', ''),
            ],
            'isTab' => false,
        ]);
    }

    /**
     * Store bulk student marks and prepare results.
     */
    public function storeBulkMarks(StoreBulkStudentMarksRequest $request): RedirectResponse
    {
        $this->marksService->storeBulkMarks($request->validated());

        return back()->with('success', 'Student marks saved and exam results prepared successfully.');
    }

    /**
     * Process exam results & rankings for a class and session.
     */
    public function processResults(ProcessExamResultRequest $request): RedirectResponse
    {
        $this->marksService->processClassResults(
            (int) $request->validated('exam_session_id'),
            (int) $request->validated('school_class_id'),
            $request->validated('teacher_remarks', [])
        );

        return back()->with('success', 'Class results processed and student rankings prepared successfully.');
    }

    /**
     * Display printable Detailed Marks Certificate (DMC)
     */
    public function dmcView(ExamResult $examResult): Response
    {
        $examResult->load(['student', 'schoolClass', 'examSession']);

        $subjectMarks = StudentMark::with('subject')
            ->where('exam_session_id', $examResult->exam_session_id)
            ->where('school_class_id', $examResult->school_class_id)
            ->where('student_id', $examResult->student_id)
            ->get();

        return Inertia::render('Exam/Marks/Dmc', [
            'result' => $examResult,
            'subjectMarks' => $subjectMarks,
        ]);
    }
}
