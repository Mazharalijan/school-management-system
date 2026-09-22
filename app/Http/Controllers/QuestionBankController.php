<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBatchQuestionBankRequest;
use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\StoreQuestionBankRequest;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateChapterRequest;
use App\Http\Requests\UpdateQuestionBankRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Chapter;
use App\Models\QuestionBank;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Topic;
use App\Services\QuestionBankService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    protected QuestionBankService $questionService;

    public function __construct(QuestionBankService $questionService)
    {
        $this->questionService = $questionService;
    }

    // --- Question Methods ---

    public function index(Request $request): Response
    {
        // Active tab tracking ('questions', 'subjects', 'chapters', 'topics')
        $activeTab = $request->input('tab', 'questions');

        // 1. Paginated & Filtered Questions (Has school_class_id directly)
        $questions = QuestionBank::with(['schoolClass', 'subject', 'chapter', 'topic'])
            ->when($request->search, fn ($q, $s) => $q->where('question', 'like', "%{$s}%"))
            ->when($request->school_class_id, fn ($q, $id) => $q->where('school_class_id', $id))
            ->when($request->subject_id, fn ($q, $id) => $q->where('subject_id', $id))
            ->when($request->chapter_id, fn ($q, $id) => $q->where('chapter_id', $id))
            ->when($request->topic_id, fn ($q, $id) => $q->where('topic_id', $id))
            ->latest()
            ->paginate(15, ['*'], 'questions_page')
            ->withQueryString();

        // 2. Paginated & Filtered Subjects
        // Subjects link to classes via chapters (using whereHas)
        $subjectsList = Subject::with(['chapters' => function ($q) use ($request) {
        $q->when($request->school_class_id, fn ($cq, $id) => $cq->where('school_class_id', $id))
          ->with(['topics', 'schoolClass']); // Added schoolClass here
                }])
                ->when($request->search, fn ($q, $s) => $q->where('subject_name', 'like', "%{$s}%"))
                ->when($request->school_class_id, fn ($q, $id) => 
                    $q->whereHas('chapters', fn ($cq) => $cq->where('school_class_id', $id))
                )
                ->latest()
                ->paginate(15, ['*'], 'subjects_page')
                ->withQueryString();

        // 3. Paginated & Filtered Chapters
        // Chapters have school_class_id directly
        $chaptersList = Chapter::with(['schoolClass', 'subject', 'topics'])
            ->when($request->search, fn ($q, $s) => $q->where('chapter_name', 'like', "%{$s}%"))
            ->when($request->school_class_id, fn ($q, $id) => $q->where('school_class_id', $id))
            ->when($request->subject_id, fn ($q, $id) => $q->where('subject_id', $id))
            ->latest()
            ->paginate(15, ['*'], 'chapters_page')
            ->withQueryString();

        // 4. Paginated & Filtered Topics
        // Topics link to schoolClass via chapter.schoolClass
        $topicsList = Topic::with(['chapter.schoolClass', 'chapter.subject'])
            ->when($request->search, fn ($q, $s) => $q->where('topic_name', 'like', "%{$s}%"))
            ->when($request->chapter_id, fn ($q, $id) => $q->where('chapter_id', $id))
            ->when($request->subject_id, fn ($q, $id) => 
                $q->whereHas('chapter', fn ($cq) => $cq->where('subject_id', $id))
            )
            ->when($request->school_class_id, fn ($q, $id) => 
                $q->whereHas('chapter', fn ($cq) => $cq->where('school_class_id', $id))
            )
            ->latest()
            ->paginate(15, ['*'], 'topics_page')
            ->withQueryString();

        $classes = SchoolClass::with(['chapters.subject', 'chapters.topics'])->get();

        return Inertia::render('QuestionBank/Index', [
            'questions'   => $questions,
            'subjects'    => $subjectsList,
            'chapters'    => $chaptersList,
            'topics'      => $topicsList,
            'classes'     => $classes,
            'allSubjects' => Subject::all(),
            'activeTab'   => $activeTab,
            'filters'     => (object) $request->only(['search', 'school_class_id', 'subject_id', 'chapter_id', 'topic_id', 'tab']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('QuestionBank/Create', [
            'classes' => SchoolClass::with(['subjects.chapters.topics'])->get(),
        ]);
    }

    public function store(StoreQuestionBankRequest $request): RedirectResponse
    {
        $this->questionService->createQuestion($request->validated());

        return redirect()->route('question-bank.index')
            ->with('success', 'Question created successfully.');
    }

    public function storeBatch(StoreBatchQuestionBankRequest $request): RedirectResponse
    {
        $count = $this->questionService->createBatchQuestions($request->validated());

        return redirect()->route('question-bank.index')
            ->with('success', "Successfully created {$count} questions across topics.");
    }

    public function show(QuestionBank $questionBank): Response
    {
        $questionBank->load(['schoolClass', 'subject', 'chapter', 'topic']);

        return Inertia::render('QuestionBank/Show', [
            'question' => $questionBank,
        ]);
    }

    public function edit(QuestionBank $questionBank): Response
    {
        $questionBank->load(['schoolClass', 'subject', 'chapter', 'topic']);

        return Inertia::render('QuestionBank/Edit', [
            'question' => $questionBank,
            'classes' => SchoolClass::with(['subjects.chapters.topics'])->get(),
        ]);
    }

    public function update(UpdateQuestionBankRequest $request, QuestionBank $questionBank): RedirectResponse
    {
        $this->questionService->updateQuestion($questionBank, $request->validated());

        return redirect()->route('question-bank.index')
            ->with('success', 'Question updated successfully.');
    }

    public function destroy(QuestionBank $questionBank): RedirectResponse
    {
        $this->questionService->deleteQuestion($questionBank);

        return redirect()->route('question-bank.index')
            ->with('success', 'Question deleted successfully.');
    }

    // --- Subject CRUD Methods ---

    public function storeSubject(StoreSubjectRequest $request): RedirectResponse
    {
        $this->questionService->createSubject($request->validated());

        return back()->with('success', 'Subject created successfully.');
    }

    public function updateSubject(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $this->questionService->updateSubject($subject, $request->validated());

        return back()->with('success', 'Subject updated successfully.');
    }

    public function destroySubject(Subject $subject): RedirectResponse
    {
        $this->questionService->deleteSubject($subject);

        return back()->with('success', 'Subject deleted successfully.');
    }

    // --- Chapter CRUD Methods ---

    public function storeChapter(StoreChapterRequest $request): RedirectResponse
    {
        $this->questionService->createChapter($request->validated());

        return back()->with('success', 'Chapter created successfully.');
    }

    public function updateChapter(UpdateChapterRequest $request, Chapter $chapter): RedirectResponse
    {
        $this->questionService->updateChapter($chapter, $request->validated());

        return back()->with('success', 'Chapter updated successfully.');
    }

    public function destroyChapter(Chapter $chapter): RedirectResponse
    {
        $this->questionService->deleteChapter($chapter);

        return back()->with('success', 'Chapter deleted successfully.');
    }

    // --- Topic CRUD Methods ---

    public function storeTopic(StoreTopicRequest $request): RedirectResponse
    {
        $this->questionService->createTopic($request->validated());

        return back()->with('success', 'Topic created successfully.');
    }

    public function updateTopic(UpdateTopicRequest $request, Topic $topic): RedirectResponse
    {
        $this->questionService->updateTopic($topic, $request->validated());

        return back()->with('success', 'Topic updated successfully.');
    }

    public function destroyTopic(Topic $topic): RedirectResponse
    {
        $this->questionService->deleteTopic($topic);

        return back()->with('success', 'Topic deleted successfully.');
    }

    // --- AJAX Helpers ---

    public function getChapters(Subject $subject): JsonResponse
    {
        return response()->json($subject->chapters()->select('id', 'chapter_name')->get());
    }

    public function getTopics(Chapter $chapter): JsonResponse
    {
        return response()->json($chapter->topics()->select('id', 'topic_name')->get());
    }
}
