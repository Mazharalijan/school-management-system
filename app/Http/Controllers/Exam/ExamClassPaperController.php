<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\BulkPrintPapersRequest;
use App\Http\Requests\Exam\StoreExamClassPaperRequest;
use App\Http\Requests\Exam\UpdateExamClassPaperRequest;
use App\Http\Requests\StoreExamPaperSectionRequest;
use App\Http\Requests\UpdateExamPaperSectionRequest;
use App\Models\ExamClassPaper;
use App\Models\ExamPaperSection;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Services\Exam\ExamClassPaperService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamClassPaperController extends Controller
{
    protected ExamClassPaperService $paperService;

    public function __construct(ExamClassPaperService $paperService)
    {
        $this->paperService = $paperService;
    }

    public function index(Request $request): Response
    {
        $activeTab = $request->get('tab', 'overview');

        // Main Papers Query with Search & Filters
        $papers = ExamClassPaper::with(['schoolClass', 'subject', 'sections.questions.questionBank'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('paper_title', 'like', "%{$search}%")
                        ->orWhere('instructions', 'like', "%{$search}%");
                });
            })
            ->when($request->school_class_id, fn ($q, $id) => $q->where('school_class_id', $id))
            ->when($request->subject_id, fn ($q, $id) => $q->where('subject_id', $id))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Load Sections with Attached Question Details
        $sections = ExamPaperSection::with(['examClassPaper', 'questions.questionBank'])
            ->latest()
            ->paginate(15, ['*'], 'sections_page')
            ->withQueryString();

        // Question Bank pool for Section Builder
        $questionBanks = QuestionBank::with(['chapter', 'topic'])->get();

        return Inertia::render('ExamClassPapers/Index', [
            'papers' => $papers,
            'sections' => $sections,
            'classes' => SchoolClass::all(),
            'subjects' => Subject::all(),
            'questionBanks' => $questionBanks,
            'filters' => $request->only(['search', 'school_class_id', 'subject_id']),
            'activeTab' => $activeTab,
        ]);
    }

    // --- Paper CRUD ---

    public function store(StoreExamClassPaperRequest $request): RedirectResponse
    {
        $this->paperService->createPaper($request->validated());

        return redirect()->route('exam-class-papers.index', ['tab' => 'papers'])
            ->with('success', 'Exam paper created successfully.');
    }

    public function update(UpdateExamClassPaperRequest $request, ExamClassPaper $examClassPaper): RedirectResponse
    {
        $this->paperService->updatePaper($examClassPaper, $request->validated());

        return redirect()->route('exam-class-papers.index', ['tab' => 'papers'])
            ->with('success', 'Exam paper updated successfully.');
    }

    public function destroy(ExamClassPaper $examClassPaper): RedirectResponse
    {
        $this->paperService->deletePaper($examClassPaper);

        return redirect()->route('exam-class-papers.index', ['tab' => 'papers'])
            ->with('success', 'Exam paper deleted successfully.');
    }

    // --- Section & Attached Questions Builder ---

    public function storeSection(StoreExamPaperSectionRequest $request): RedirectResponse
    {
        $this->paperService->addSection($request->validated());

        return redirect()->route('exam-class-papers.index', ['tab' => 'sections'])
            ->with('success', 'Section created and questions attached successfully.');
    }

    public function updateSection(UpdateExamPaperSectionRequest $request, ExamPaperSection $section): RedirectResponse
    {
        $this->paperService->updateSection($section, $request->validated());

        return redirect()->route('exam-class-papers.index', ['tab' => 'sections'])
            ->with('success', 'Section updated successfully.');
    }

    public function destroySection(ExamPaperSection $section): RedirectResponse
    {
        $this->paperService->deleteSection($section);

        return redirect()->route('exam-class-papers.index', ['tab' => 'sections'])
            ->with('success', 'Section deleted successfully.');
    }

    // --- Printing & Bulk Actions ---

    public function printSingle(ExamClassPaper $paper)
    {
        $paper->load([
            'schoolClass',
            'subject',
            'sections.questions.questionBank',
        ]);

        return view('prints.exam-paper-single', compact('paper'));
    }

    public function bulkPrint(Request $request)
    {
        $ids = explode(',', $request->get('ids', ''));

        $papers = ExamClassPaper::with([
            'schoolClass',
            'subject',
            'sections.questions.questionBank',
        ])->whereIn('id', $ids)->get();

        return view('prints.exam-paper-bulk', compact('papers'));
    }

    public function markPrinted(BulkPrintPapersRequest $request): RedirectResponse
    {
        $this->paperService->updatePrintStatuses($request->validated('paper_ids'), 'printed');

        return redirect()->route('exam-class-papers.index', ['tab' => 'print'])
            ->with('success', 'Selected paper print statuses updated.');
    }

    public function show(ExamClassPaper $examClassPaper)
    {
        // 1. Eager load paper relations (sections and their attached question bank items)
        $examClassPaper->load([
            'schoolClass',
            'subject',
            'sections.questions.questionBank',
        ]);

        // 2. Fetch question bank items matching this paper's subject (for section question picker)
        $questionBank = QuestionBank::where('subject_id', $examClassPaper->subject_id)->get();

        // 3. Render your Paper Detail / Section Management view
        return Inertia::render('ExamClassPapers/Show', [
            'paper' => $examClassPaper,
            'sections' => $examClassPaper->sections,
            'questionBank' => $questionBank,
        ]);
    }

    public function preview(ExamClassPaper $examClassPaper)
    {
        $examClassPaper->load([
            'schoolClass',
            'subject',
            'sections.questions.questionBank',
        ]);

        return Inertia::render('ExamClassPapers/components/PaperPreview', [
            'paper' => $examClassPaper,
            'sections' => $examClassPaper->sections,
        ]);
    }
}
