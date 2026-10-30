<?php

namespace Tests\Feature;

use App\Models\ExamClassPaper;
use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentMark;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentMarksAndResultTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class;

    protected ExamSession $session;

    protected Subject $math;

    protected Subject $english;

    protected Student $student1;

    protected Student $student2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class = SchoolClass::create([
            'name' => 'Grade 5',
            'numeric_value' => 5,
            'code' => 'G5',
        ]);

        $this->session = ExamSession::create([
            'title' => 'Annual Examination 2026',
            'session_year' => '2026-2027',
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-20',
            'status' => 'published',
        ]);

        $this->math = Subject::create([
            'subject_name' => 'Mathematics',
        ]);

        $this->english = Subject::create([
            'subject_name' => 'English Language',
        ]);

        // Create 2 students with enrollments
        $this->student1 = Student::create([
            'admission_number' => 'ADM-001',
            'roll_number' => '501',
            'first_name' => 'Ali',
            'last_name' => 'Ahmed',
            'gender' => 'male',
            'date_of_birth' => '2015-01-01',
            'guardian_name' => 'Ahmed Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        $section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'A',
            'capacity' => 30,
        ]);

        StudentEnrollment::create([
            'student_id' => $this->student1->id,
            'school_class_id' => $this->class->id,
            'section_id' => $section->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        $this->student2 = Student::create([
            'admission_number' => 'ADM-002',
            'roll_number' => '502',
            'first_name' => 'Sara',
            'last_name' => 'Khan',
            'gender' => 'female',
            'date_of_birth' => '2015-02-02',
            'guardian_name' => 'Bilal Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03007654321',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        StudentEnrollment::create([
            'student_id' => $this->student2->id,
            'school_class_id' => $this->class->id,
            'section_id' => $section->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        // Scheduled papers
        ExamClassPaper::create([
            'school_class_id' => $this->class->id,
            'exam_session_id' => $this->session->id,
            'subject_id' => $this->math->id,
            'paper_title' => 'Grade 5 Math Paper',
            'total_marks' => 100.00,
            'duration_minutes' => 180,
        ]);

        ExamClassPaper::create([
            'school_class_id' => $this->class->id,
            'exam_session_id' => $this->session->id,
            'subject_id' => $this->english->id,
            'paper_title' => 'Grade 5 English Paper',
            'total_marks' => 100.00,
            'duration_minutes' => 180,
        ]);

        config(['inertia.testing.ensure_pages_exist' => false]);
    }

    public function test_can_load_marks_entry_page_with_sessions_classes_and_students(): void
    {
        $response = $this->actingAs($this->user)->get(route('marks.entry', [
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ExamClassPapers/marks/Index')
            ->has('sessions')
            ->has('classes')
            ->has('papers', 2)
            ->has('initialStudents', 2)
            ->where('initialStudents.0.name', 'Ali Ahmed')
            ->where('initialStudents.1.name', 'Sara Khan')
        );
    }

    public function test_can_store_bulk_marks_and_prepare_results_automatically(): void
    {
        $payload = [
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'prepare_results' => true,
            'students' => [
                [
                    'student_id' => $this->student1->id,
                    'teacher_remarks' => 'Excellent work throughout the term.',
                    'marks' => [
                        [
                            'subject_id' => $this->math->id,
                            'obtained_marks' => 95.00,
                            'total_marks' => 100.00,
                            'is_absent' => false,
                        ],
                        [
                            'subject_id' => $this->english->id,
                            'obtained_marks' => 85.00,
                            'total_marks' => 100.00,
                            'is_absent' => false,
                        ],
                    ],
                ],
                [
                    'student_id' => $this->student2->id,
                    'teacher_remarks' => 'Good effort.',
                    'marks' => [
                        [
                            'subject_id' => $this->math->id,
                            'obtained_marks' => 70.00,
                            'total_marks' => 100.00,
                            'is_absent' => false,
                        ],
                        [
                            'subject_id' => $this->english->id,
                            'obtained_marks' => 75.00,
                            'total_marks' => 100.00,
                            'is_absent' => false,
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->post(route('marks.bulk-store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check student marks stored
        $this->assertDatabaseHas('student_marks', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->math->id,
            'obtained_marks' => 95.00,
            'is_absent' => false,
        ]);

        $this->assertDatabaseHas('student_marks', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student2->id,
            'subject_id' => $this->english->id,
            'obtained_marks' => 75.00,
        ]);

        // Check exam results prepared and ranked
        $this->assertDatabaseHas('exam_results', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student1->id,
            'total_obtained_marks' => 180.00,
            'total_max_marks' => 200.00,
            'percentage' => 90.00,
            'grade' => 'A+',
            'status' => 'pass',
            'position_in_class' => 1,
        ]);

        $this->assertDatabaseHas('exam_results', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student2->id,
            'total_obtained_marks' => 145.00,
            'total_max_marks' => 200.00,
            'percentage' => 72.50,
            'grade' => 'B',
            'status' => 'pass',
            'position_in_class' => 2,
        ]);
    }

    public function test_can_handle_absent_students_in_marks_and_results(): void
    {
        $payload = [
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'prepare_results' => true,
            'students' => [
                [
                    'student_id' => $this->student1->id,
                    'marks' => [
                        [
                            'subject_id' => $this->math->id,
                            'obtained_marks' => 0.00,
                            'total_marks' => 100.00,
                            'is_absent' => true,
                        ],
                        [
                            'subject_id' => $this->english->id,
                            'obtained_marks' => 80.00,
                            'total_marks' => 100.00,
                            'is_absent' => false,
                        ],
                    ],
                ],
            ],
        ];

        $this->actingAs($this->user)->post(route('marks.bulk-store'), $payload);

        $this->assertDatabaseHas('student_marks', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->math->id,
            'obtained_marks' => 0.00,
            'is_absent' => true,
        ]);

        // Student with absent paper should fail
        $this->assertDatabaseHas('exam_results', [
            'exam_session_id' => $this->session->id,
            'student_id' => $this->student1->id,
            'status' => 'fail',
        ]);
    }

    public function test_can_view_detailed_marks_certificate_dmc(): void
    {
        // Create student mark
        StudentMark::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'student_id' => $this->student1->id,
            'subject_id' => $this->math->id,
            'obtained_marks' => 88.00,
            'total_marks' => 100.00,
            'is_absent' => false,
        ]);

        $result = ExamResult::create([
            'exam_session_id' => $this->session->id,
            'school_class_id' => $this->class->id,
            'student_id' => $this->student1->id,
            'total_obtained_marks' => 88.00,
            'total_max_marks' => 100.00,
            'percentage' => 88.00,
            'grade' => 'A',
            'status' => 'pass',
            'position_in_class' => 1,
            'teacher_remarks' => 'Good performance',
        ]);

        $response = $this->actingAs($this->user)->get(route('marks.dmc', $result->id));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Exam/Marks/Dmc')
            ->has('result')
            ->where('result.percentage', '88.00')
            ->has('subjectMarks', 1)
        );
    }
}
