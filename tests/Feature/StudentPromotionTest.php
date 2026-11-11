<?php

namespace Tests\Feature;

use App\Models\FeeHead;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentFeeProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentPromotionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class5;

    protected SchoolClass $class6;

    protected SchoolClass $class7;

    protected Section $section5A;

    protected Section $section6A;

    protected Section $section7A;

    protected FeeHead $tuitionHead;

    protected FeeHead $admissionHead;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class5 = SchoolClass::create([
            'name' => 'Grade 5',
            'numeric_value' => 5,
            'code' => 'CLS-5',
        ]);
        $this->section5A = Section::create([
            'school_class_id' => $this->class5->id,
            'name' => 'A',
            'capacity' => 35,
        ]);

        $this->class6 = SchoolClass::create([
            'name' => 'Grade 6',
            'numeric_value' => 6,
            'code' => 'CLS-6',
        ]);
        $this->section6A = Section::create([
            'school_class_id' => $this->class6->id,
            'name' => 'A',
            'capacity' => 35,
        ]);

        $this->class7 = SchoolClass::create([
            'name' => 'Grade 7',
            'numeric_value' => 7,
            'code' => 'CLS-7',
        ]);
        $this->section7A = Section::create([
            'school_class_id' => $this->class7->id,
            'name' => 'A',
            'capacity' => 35,
        ]);

        $this->tuitionHead = FeeHead::create([
            'title' => 'Monthly Tuition Fee',
            'type' => 'recurring',
            'is_active' => true,
        ]);

        $this->admissionHead = FeeHead::create([
            'title' => 'Admission Fee',
            'type' => 'one_time',
            'is_active' => true,
        ]);

        FeeStructure::create([
            'school_class_id' => $this->class6->id,
            'fee_head_id' => $this->tuitionHead->id,
            'amount' => 4500.00,
            'session_year' => '2026-2027',
        ]);
    }

    protected function createStudentWithEnrollment(SchoolClass $class, Section $section, string $sessionYear = '2025-2026', array $studentAttrs = []): Student
    {
        $student = Student::create(array_merge([
            'admission_number' => 'ADM-'.rand(1000, 9999),
            'first_name' => 'Ali',
            'last_name' => 'Raza',
            'guardian_name' => 'Raza Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'gender' => 'male',
            'date_of_birth' => '2013-05-10',
            'admission_date' => '2025-01-10',
            'status' => 'active',
        ], $studentAttrs));

        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_class_id' => $class->id,
            'section_id' => $section->id,
            'session_year' => $sessionYear,
            'is_current' => true,
        ]);

        return $student;
    }

    public function test_promotion_index_page_loads_with_eligible_students(): void
    {
        $student1 = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026', ['first_name' => 'Hamza']);
        $student2 = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026', ['first_name' => 'Zain']);

        $response = $this->actingAs($this->user)->get(route('students.promotion.index', [
            'source_class_id' => $this->class5->id,
            'source_session_year' => '2025-2026',
            'target_session_year' => '2026-2027',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Students/Promotion/Index')
            ->has('students', 2)
            ->where('students.0.first_name', 'Hamza')
            ->has('classes')
        );
    }

    public function test_bulk_promotion_to_next_grade_updates_enrollments_and_fees(): void
    {
        $student1 = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026', ['first_name' => 'Student1']);
        $student2 = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026', ['first_name' => 'Student2']);

        // Set up prior fee discount for student 1
        StudentFeeProfile::create([
            'student_id' => $student1->id,
            'school_class_id' => $this->class5->id,
            'session_year' => '2025-2026',
            'base_monthly_fee' => 4000.00,
            'monthly_discount' => 500.00,
            'net_monthly_fee' => 3500.00,
            'discount_reason' => 'Sibling discount',
        ]);

        $payload = [
            'source_class_id' => $this->class5->id,
            'target_class_id' => $this->class6->id,
            'target_section_id' => $this->section6A->id,
            'target_session_year' => '2026-2027',
            'student_ids' => [$student1->id, $student2->id],
            'fee_strategy' => 'custom',
            'base_monthly_fee' => 5000.00,
            'admission_fee' => 2000.00,
            'waive_admission_fee' => false,
            'discount_strategy' => 'keep_existing',
        ];

        $response = $this->actingAs($this->user)->post(route('students.promotion.store'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Verify Student 1 old enrollment deactivated and new one active
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student1->id,
            'school_class_id' => $this->class5->id,
            'session_year' => '2025-2026',
            'is_current' => false,
        ]);
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student1->id,
            'school_class_id' => $this->class6->id,
            'section_id' => $this->section6A->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        // Verify Student 1 fee profile updated in target session with preserved discount
        $this->assertDatabaseHas('student_fee_profiles', [
            'student_id' => $student1->id,
            'school_class_id' => $this->class6->id,
            'session_year' => '2026-2027',
            'base_monthly_fee' => 5000.00,
            'monthly_discount' => 500.00,
            'net_monthly_fee' => 4500.00,
            'waive_admission_fee' => false,
        ]);

        // Verify Student 2 has new fee profile with $0 discount
        $this->assertDatabaseHas('student_fee_profiles', [
            'student_id' => $student2->id,
            'school_class_id' => $this->class6->id,
            'session_year' => '2026-2027',
            'base_monthly_fee' => 5000.00,
            'monthly_discount' => 0.00,
            'net_monthly_fee' => 5000.00,
        ]);

        // Verify FeeStructure updated for the target class
        $this->assertDatabaseHas('fee_structures', [
            'school_class_id' => $this->class6->id,
            'fee_head_id' => $this->admissionHead->id,
            'amount' => 2000.00,
            'session_year' => '2026-2027',
        ]);
    }

    public function test_skip_classes_promotion_scenario(): void
    {
        // Student skips Grade 6 and is promoted directly from Grade 5 to Grade 7
        $student = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026');

        $payload = [
            'source_class_id' => $this->class5->id,
            'target_class_id' => $this->class7->id,
            'target_section_id' => $this->section7A->id,
            'target_session_year' => '2026-2027',
            'student_ids' => [$student->id],
            'fee_strategy' => 'custom',
            'base_monthly_fee' => 6000.00,
            'admission_fee' => 0.00,
            'waive_admission_fee' => true,
            'discount_strategy' => 'reset_zero',
        ];

        $response = $this->actingAs($this->user)->post(route('students.promotion.store'), $payload);

        $response->assertSessionHasNoErrors();

        // Enrolled in Grade 7
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_class_id' => $this->class7->id,
            'section_id' => $this->section7A->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        $this->assertDatabaseHas('student_fee_profiles', [
            'student_id' => $student->id,
            'school_class_id' => $this->class7->id,
            'session_year' => '2026-2027',
            'base_monthly_fee' => 6000.00,
            'waive_admission_fee' => true,
        ]);
    }

    public function test_retain_in_same_class_promotion_scenario(): void
    {
        // Student repeats Grade 5 for the new session
        $student = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026');

        $payload = [
            'source_class_id' => $this->class5->id,
            'target_class_id' => $this->class5->id,
            'target_section_id' => $this->section5A->id,
            'target_session_year' => '2026-2027',
            'student_ids' => [$student->id],
            'fee_strategy' => 'custom',
            'base_monthly_fee' => 4200.00,
            'admission_fee' => 0.00,
            'waive_admission_fee' => true,
            'discount_strategy' => 'reset_zero',
        ];

        $response = $this->actingAs($this->user)->post(route('students.promotion.store'), $payload);

        $response->assertSessionHasNoErrors();

        // New enrollment for 2026-2027 in Grade 5
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_class_id' => $this->class5->id,
            'section_id' => $this->section5A->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);
    }

    public function test_single_student_promotion_with_concession_and_admission_fee(): void
    {
        $student = $this->createStudentWithEnrollment($this->class5, $this->section5A, '2025-2026');

        $payload = [
            'source_class_id' => $this->class5->id,
            'target_class_id' => $this->class6->id,
            'target_section_id' => $this->section6A->id,
            'target_session_year' => '2026-2027',
            'base_monthly_fee' => 5500.00,
            'admission_fee' => 2500.00,
            'waive_admission_fee' => false,
            'monthly_discount' => 1000.00,
            'discount_reason' => 'Top Ranker Merit Scholarship',
            'promotion_type' => 'promote',
        ];

        $response = $this->actingAs($this->user)->post(route('students.promotion.single', $student->id), $payload);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_class_id' => $this->class6->id,
            'section_id' => $this->section6A->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        $this->assertDatabaseHas('student_fee_profiles', [
            'student_id' => $student->id,
            'school_class_id' => $this->class6->id,
            'session_year' => '2026-2027',
            'base_monthly_fee' => 5500.00,
            'monthly_discount' => 1000.00,
            'net_monthly_fee' => 4500.00,
            'waive_admission_fee' => false,
            'discount_reason' => 'Top Ranker Merit Scholarship',
        ]);
    }
}
