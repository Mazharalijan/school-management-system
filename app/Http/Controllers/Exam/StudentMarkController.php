<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\ProcessExamResultRequest;
use App\Http\Requests\Exam\StoreBulkStudentMarksRequest;
use App\Models\ExamResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentMarkController extends Controller
{
    /**
     * Display the main Marks Entry UI
     */
    public function entryForm(Request $request): Response
    {
        return Inertia::render('ExamClassPapers/marks/Index', [
            'teacher' => [
                'id' => auth()->id() ?? 1,
                'name' => auth()->user()->name ?? 'Admin User',
                'emp_id' => 'EMP-001',
                'designation' => 'Class Teacher',
            ],
            'examTerm' => [
                'id' => $request->query('exam_session_id', 1),
                'name' => 'Mid Term Examination 2026',
            ],
            'classDetails' => [
                'id' => $request->query('school_class_id', 101),
                'name' => 'Grade 5',
                'section' => 'Section A',
            ],
            'papers' => [
                ['id' => 1, 'subject_name' => 'Mathematics', 'total_marks' => 100, 'passing_marks' => 33],
                ['id' => 2, 'subject_name' => 'English', 'total_marks' => 100, 'passing_marks' => 33],
                ['id' => 3, 'subject_name' => 'General Science', 'total_marks' => 100, 'passing_marks' => 33],
                ['id' => 4, 'subject_name' => 'Computer Studies', 'total_marks' => 50, 'passing_marks' => 17],
            ],
            'initialStudents' => [
                [
                    'id' => 1001,
                    'roll_no' => '501',
                    'name' => 'Ali Ahmed',
                    'marks' => [1 => 85, 2 => 78, 3 => 92, 4 => 44],
                    'absent' => [1 => false, 2 => false, 3 => false, 4 => false],
                ],
                [
                    'id' => 1002,
                    'roll_no' => '502',
                    'name' => 'Sara Khan',
                    'marks' => [1 => 28, 2 => 65, 3 => 58, 4 => 30],
                    'absent' => [1 => false, 2 => false, 3 => false, 4 => false],
                ],
            ],
            'filters' => $request->only(['exam_session_id', 'school_class_id', 'subject_id']),
        ]);
    }

    /**
     * Store bulk student marks (Stubbed for now)
     */
    public function storeBulkMarks(StoreBulkStudentMarksRequest $request): RedirectResponse
    {
        // Business logic will be re-implemented later
        return back()->with('success', 'Marks saved successfully.');
    }

    /**
     * Process exam results & rankings (Stubbed for now)
     */
    public function processResults(ProcessExamResultRequest $request): RedirectResponse
    {
        // Business logic will be re-implemented later
        return back()->with('success', 'Class results processed successfully.');
    }

    /**
     * Display printable Detailed Marks Certificate (DMC)
     */
    public function dmcView(ExamResult $examResult): Response
    {
        return Inertia::render('Exam/Marks/Dmc', [
            'result' => $examResult,
            'subjectMarks' => [],
        ]);
    }
}
