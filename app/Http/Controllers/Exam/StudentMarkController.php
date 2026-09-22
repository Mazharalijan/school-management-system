<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\ProcessExamResultRequest;
use App\Http\Requests\Exam\StoreBulkStudentMarksRequest;
use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentMark;
use App\Models\Subject;
use App\Services\Exam\MarksAndResultService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentMarkController extends Controller
{
    public function __construct(protected MarksAndResultService $marksService) {}

    public function entryForm(Request $request): Response
    {
        $students = [];
        $existingMarks = [];

        if ($request->filled(['exam_session_id', 'school_class_id', 'subject_id'])) {
            $students = Student::where('school_class_id', $request->school_class_id)
                ->orderBy('name')
                ->get();

            $existingMarks = StudentMark::where('exam_session_id', $request->exam_session_id)
                ->where('school_class_id', $request->school_class_id)
                ->where('subject_id', $request->subject_id)
                ->get()
                ->keyBy('student_id');
        }

        return Inertia::render('Exam/Marks/Entry', [
            'sessions'      => ExamSession::all(),
            'classes'       => SchoolClass::all(),
            'subjects'      => Subject::all(),
            'students'      => $students,
            'existingMarks' => $existingMarks,
            'filters'       => $request->only(['exam_session_id', 'school_class_id', 'subject_id']),
        ]);
    }

    public function storeBulkMarks(StoreBulkStudentMarksRequest $request): RedirectResponse
    {
        $this->marksService->storeBulkMarks($request->validated());

        return back()->with('success', 'Student marks saved successfully.');
    }

    public function processResults(ProcessExamResultRequest $request): RedirectResponse
    {
        $this->marksService->processClassResults(
            $request->exam_session_id,
            $request->school_class_id,
            $request->teacher_remarks ?? []
        );

        return back()->with('success', 'Class results and rankings computed successfully.');
    }

    public function dmcView(ExamResult $examResult): Response
    {
        $examResult->load([
            'student.schoolClass',
            'examSession',
            'schoolClass',
        ]);

        $subjectMarks = StudentMark::with('subject')
            ->where('exam_session_id', $examResult->exam_session_id)
            ->where('student_id', $examResult->student_id)
            ->get();

        return Inertia::render('Exam/Marks/Dmc', [
            'result'       => $examResult,
            'subjectMarks' => $subjectMarks,
        ]);
    }
}