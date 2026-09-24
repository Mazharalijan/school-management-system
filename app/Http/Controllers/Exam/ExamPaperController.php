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

    public function index(Request $request): Response
    {
        $papers = ExamClassPaper::with(['schoolClass', 'subject', 'examSchedule.examSession'])
            ->when($request->school_class_id, fn ($q) => $q->where('school_class_id', $request->school_class_id))
            ->when($request->print_status, fn ($q) => $q->where('print_status', $request->print_status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Exam/Papers/Index', [
            'papers' => $papers,
            'classes' => SchoolClass::all(),
            'filters' => $request->only(['school_class_id', 'print_status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Exam/Papers/Create', [
            'classes' => SchoolClass::all(),
            'subjects' => Subject::all(),
            'questions' => QuestionBank::with(['chapter', 'topic'])->get(),
        ]);
    }

    public function store(StoreExamClassPaperRequest $request): RedirectResponse
    {
        $this->paperService->createPaperWithSections($request->validated());

        return redirect()->route('exam-papers.index')->with('success', 'Question paper composed successfully.');
    }

    public function show(ExamClassPaper $examPaper): Response
    {
        return Inertia::render('Exam/Papers/Show', [
            'paper' => $examPaper->load([
                'schoolClass',
                'subject',
                'sections.questions.questionBank.chapter',
                'sections.questions.questionBank.topic',
            ]),
        ]);
    }

    public function updatePrintStatus(UpdatePaperPrintStatusRequest $request, ExamClassPaper $examPaper): RedirectResponse
    {
        $this->paperService->updatePrintStatus($examPaper, $request->validated());

        return back()->with('success', 'Print status updated successfully.');
    }
}
