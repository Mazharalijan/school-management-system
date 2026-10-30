<?php

namespace Tests\Feature;

use App\Models\ExamClassPaper;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamClassPaperTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class1;

    protected SchoolClass $class2;

    protected ExamSession $term1;

    protected ExamSession $term2;

    protected Subject $math;

    protected Subject $english;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class1 = SchoolClass::create([
            'name' => 'Grade 1',
            'numeric_value' => 1,
            'code' => 'G1',
        ]);

        $this->class2 = SchoolClass::create([
            'name' => 'Grade 2',
            'numeric_value' => 2,
            'code' => 'G2',
        ]);

        $this->term1 = ExamSession::create([
            'title' => 'First Term',
            'session_year' => '2026-2027',
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-15',
            'status' => 'published',
        ]);

        $this->term2 = ExamSession::create([
            'title' => 'Second Term',
            'session_year' => '2026-2027',
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-15',
            'status' => 'published',
        ]);

        $this->term3 = ExamSession::create([
            'title' => 'Third Term',
            'session_year' => '2026-2027',
            'start_date' => '2026-11-20',
            'end_date' => '2026-12-15',
            'status' => 'published',
        ]);

        $this->math = Subject::create([
            'subject_name' => 'Mathematics',
        ]);

        $this->english = Subject::create([
            'subject_name' => 'English Literature',
        ]);

        config(['inertia.testing.ensure_pages_exist' => false]);
    }

    public function test_can_load_overview_with_classes_and_terms(): void
    {
        $response = $this->actingAs($this->user)->get(route('exam-class-papers.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ExamClassPapers/Index')
            ->has('classes', 2)
            ->has('examSessions', 3)
            ->has('subjects', 2)
        );
    }

    public function test_can_filter_papers_by_class_term_and_subject(): void
    {
        // Paper for Class 1, First Term, Mathematics
        $targetPaper = ExamClassPaper::create([
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'Class 1 First Term Math Paper',
            'total_marks' => 100,
            'duration_minutes' => 120,
            'print_status' => 'pending',
        ]);

        // Paper for Class 2, Second Term, English
        ExamClassPaper::create([
            'school_class_id' => $this->class2->id,
            'exam_session_id' => $this->term2->id,
            'subject_id' => $this->english->id,
            'paper_title' => 'Class 2 Second Term English Paper',
            'total_marks' => 100,
            'duration_minutes' => 120,
            'print_status' => 'pending',
        ]);

        // Filter for Class 1 + First Term + Math
        $response = $this->actingAs($this->user)->get(route('exam-class-papers.index', [
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ExamClassPapers/Index')
            ->has('papers.data', 1)
            ->where('papers.data.0.id', $targetPaper->id)
            ->where('papers.data.0.paper_title', 'Class 1 First Term Math Paper')
        );
    }

    public function test_can_create_paper_with_class_and_term(): void
    {
        $payload = [
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'First Term Math Assessment',
            'total_marks' => 100,
            'duration_minutes' => 180,
            'instructions' => 'Calculators allowed',
        ];

        $response = $this->actingAs($this->user)->post(route('exam-class-papers.store'), $payload);

        $response->assertRedirect(route('exam-class-papers.index', ['tab' => 'papers']));
        $this->assertDatabaseHas('exam_class_papers', [
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'First Term Math Assessment',
        ]);
    }

    public function test_can_update_paper_term_and_subject(): void
    {
        $paper = ExamClassPaper::create([
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'Old Title',
            'total_marks' => 80,
            'duration_minutes' => 90,
        ]);

        $response = $this->actingAs($this->user)->put(route('exam-class-papers.update', $paper->id), [
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term2->id,
            'subject_id' => $this->english->id,
            'paper_title' => 'Updated English Paper',
            'total_marks' => 100,
            'duration_minutes' => 120,
        ]);

        $response->assertRedirect(route('exam-class-papers.index', ['tab' => 'papers']));
        $this->assertDatabaseHas('exam_class_papers', [
            'id' => $paper->id,
            'exam_session_id' => $this->term2->id,
            'subject_id' => $this->english->id,
            'paper_title' => 'Updated English Paper',
        ]);
    }

    public function test_search_filters_papers_by_title(): void
    {
        ExamClassPaper::create([
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'Algebra Special Midterm',
            'total_marks' => 50,
            'duration_minutes' => 60,
        ]);

        ExamClassPaper::create([
            'school_class_id' => $this->class1->id,
            'exam_session_id' => $this->term1->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'Geometry Final Paper',
            'total_marks' => 50,
            'duration_minutes' => 60,
        ]);

        $response = $this->actingAs($this->user)->get(route('exam-class-papers.index', [
            'search' => 'Algebra',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ExamClassPapers/Index')
            ->has('papers.data', 1)
            ->where('papers.data.0.paper_title', 'Algebra Special Midterm')
        );
    }
}
