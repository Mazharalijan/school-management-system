<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\StoreExamClassPaperRequest;
use App\Http\Requests\Exam\UpdatePaperPrintStatusRequest;
use App\Models\ExamClassPaper;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Services\Exam\ExamPaperService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamPaperController extends Controller
{
    public function __construct(protected ExamPaperService $paperService) {}

    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('exam-class-papers.index', $request->query());
    }

    public function create(): Response
    {
        return Inertia::render('ExamClassPapers/Create', [
            'classes' => SchoolClass::orderBy('numeric_value')->get(),
            'subjects' => Subject::orderBy('subject_name')->get(),
            'questions' => QuestionBank::with(['chapter', 'topic'])->get(),
        ]);
    }

    public function store(StoreExamClassPaperRequest $request): RedirectResponse
    {
        $paper = $this->paperService->createPaperWithSections($request->validated());

        return redirect()->route('exam-class-papers.index', ['tab' => 'papers'])
            ->with('success', 'Question paper composed successfully.');
    }

    public function show(ExamClassPaper $paper): RedirectResponse
    {
        return redirect()->route('exam-class-papers.show', $paper->id);
    }

    public function updatePrintStatus(UpdatePaperPrintStatusRequest $request, ExamClassPaper $examPaper): RedirectResponse
    {
        $this->paperService->updatePrintStatus($examPaper, $request->validated());

        return back()->with('success', 'Print status updated successfully.');
    }
}
