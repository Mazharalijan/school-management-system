<?php

namespace Tests\Feature;

use App\Models\ExamClassPaper;
use App\Models\ExamSchedule;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamPaperPrintingAndScheduleTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class;

    protected Subject $subject;

    protected ExamSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class = SchoolClass::create([
            'name' => 'Grade 8',
            'numeric_value' => 8,
            'code' => 'CLS-8',
        ]);

        $this->subject = Subject::create([
            'subject_name' => 'Mathematics',
        ]);

        $this->session = ExamSession::create([
            'title' => 'Annual Exam 2026',
            'session_year' => '2026',
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-20',
            'is_active' => true,
        ]);
    }

    public function test_single_exam_paper_can_be_printed(): void
    {
        $paper = ExamClassPaper::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'paper_title' => 'Math Final Exam',
            'total_marks' => 100,
            'duration_minutes' => 180,
            'print_status' => 'pending',
            'total_copies_needed' => 50,
            'total_copies_printed' => 0,
        ]);

        $response = $this->actingAs($this->user)->get(route('exam-class-papers.print-single', $paper->id));

        $response->assertOk();
        $response->assertViewIs('prints.exam-paper-single');
        $response->assertSee('Math Final Exam');
        $response->assertSee('Mathematics');
    }

    public function test_bulk_print_exam_papers_view_renders_successfully(): void
    {
        $paper1 = ExamClassPaper::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'paper_title' => 'Math Paper 1',
            'total_marks' => 75,
            'duration_minutes' => 120,
            'print_status' => 'pending',
        ]);

        $paper2 = ExamClassPaper::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'paper_title' => 'Math Paper 2',
            'total_marks' => 75,
            'duration_minutes' => 120,
            'print_status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->get(route('exam-class-papers.bulk-print', [
            'ids' => "{$paper1->id},{$paper2->id}",
        ]));

        $response->assertOk();
        $response->assertViewIs('prints.exam-paper-bulk');
        $response->assertSee('Math Paper 1');
        $response->assertSee('Math Paper 2');
    }

    public function test_mark_papers_as_printed(): void
    {
        $paper = ExamClassPaper::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'paper_title' => 'Science Midterm',
            'total_marks' => 50,
            'duration_minutes' => 90,
            'print_status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->post(route('exam-class-papers.mark-printed'), [
            'paper_ids' => [$paper->id],
        ]);

        $response->assertRedirect(route('exam-class-papers.index', ['tab' => 'print']));
        $paper->refresh();
        $this->assertEquals('printed', $paper->print_status);
        $this->assertNotNull($paper->printed_at);
    }

    public function test_exam_session_update_and_destroy_with_route_model_binding(): void
    {
        $session = ExamSession::create([
            'title' => 'Term 1 Exam',
            'session_year' => '2026',
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-15',
            'is_active' => true,
        ]);

        // Update
        $response = $this->actingAs($this->user)->put(route('sessions.update', $session->id), [
            'title' => 'Term 1 Exam - Updated',
            'session_year' => '2026',
            'start_date' => '2026-06-02',
            'end_date' => '2026-06-16',
            'status' => 'published',
        ]);

        $response->assertSessionHasNoErrors();
        $session->refresh();
        $this->assertEquals('Term 1 Exam - Updated', $session->title);
        $this->assertEquals('published', $session->status);

        // Delete
        $deleteResponse = $this->actingAs($this->user)->delete(route('sessions.destroy', $session->id));
        $deleteResponse->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('exam_sessions', ['id' => $session->id]);
    }

    public function test_exam_schedule_update_and_destroy_with_route_model_binding(): void
    {
        $schedule = ExamSchedule::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'exam_date' => '2026-03-05',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'total_marks' => 100,
            'passing_marks' => 40,
        ]);

        // Update
        $response = $this->actingAs($this->user)->put(route('schedules.update', $schedule->id), [
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'exam_date' => '2026-03-06',
            'start_time' => '10:00',
            'end_time' => '13:00',
            'total_marks' => 100,
            'passing_marks' => 50,
        ]);

        $response->assertSessionHasNoErrors();
        $schedule->refresh();
        $this->assertEquals(50.00, (float) $schedule->passing_marks);
        $this->assertEquals('2026-03-06', $schedule->exam_date->format('Y-m-d'));

        // Delete
        $deleteResponse = $this->actingAs($this->user)->delete(route('schedules.destroy', $schedule->id));
        $deleteResponse->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('exam_schedules', ['id' => $schedule->id]);
    }
}
