<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassMatrixDeletionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_empty_class_can_be_deleted(): void
    {
        $class = SchoolClass::create([
            'name' => 'Class Empty',
            'numeric_value' => 1,
            'code' => 'CLS-EMP',
        ]);

        $response = $this->actingAs($this->user)->delete(route('classes.destroy', $class->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('school_classes', ['id' => $class->id]);
    }

    public function test_class_with_enrolled_students_cannot_be_deleted(): void
    {
        $class = SchoolClass::create([
            'name' => 'Class Occupied',
            'numeric_value' => 2,
            'code' => 'CLS-OCC',
        ]);

        $section = Section::create([
            'school_class_id' => $class->id,
            'name' => 'Section Blue',
            'capacity' => 25,
        ]);

        $student = Student::create([
            'admission_number' => 'ADM-CLS-01',
            'first_name' => 'Ali',
            'last_name' => 'Raza',
            'guardian_name' => 'Raza Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001112233',
            'gender' => 'male',
            'date_of_birth' => '2012-04-10',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_class_id' => $class->id,
            'section_id' => $section->id,
            'roll_number' => '05',
            'session_year' => '2026',
            'is_current' => true,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->delete(route('classes.destroy', $class->id));

        $response->assertSessionHasErrors(['error']);
        $this->assertDatabaseHas('school_classes', ['id' => $class->id]);
    }

    public function test_empty_section_can_be_deleted(): void
    {
        $class = SchoolClass::create([
            'name' => 'Class For Section',
            'numeric_value' => 3,
            'code' => 'CLS-SEC',
        ]);

        $section1 = Section::create([
            'school_class_id' => $class->id,
            'name' => 'Section A',
            'capacity' => 30,
        ]);

        $section2 = Section::create([
            'school_class_id' => $class->id,
            'name' => 'Section B',
            'capacity' => 30,
        ]);

        $response = $this->actingAs($this->user)->delete(route('sections.destroy', $section2->id));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sections', ['id' => $section2->id]);
    }

    public function test_section_with_enrolled_students_cannot_be_deleted(): void
    {
        $class = SchoolClass::create([
            'name' => 'Class With Students',
            'numeric_value' => 4,
            'code' => 'CLS-WST',
        ]);

        $section1 = Section::create([
            'school_class_id' => $class->id,
            'name' => 'Primary Section',
            'capacity' => 30,
        ]);

        $section2 = Section::create([
            'school_class_id' => $class->id,
            'name' => 'Secondary Section',
            'capacity' => 30,
        ]);

        $student = Student::create([
            'admission_number' => 'ADM-SEC-01',
            'first_name' => 'Zain',
            'last_name' => 'Abbas',
            'guardian_name' => 'Abbas Ali',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03009998877',
            'gender' => 'male',
            'date_of_birth' => '2012-07-15',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_class_id' => $class->id,
            'section_id' => $section2->id,
            'roll_number' => '07',
            'session_year' => '2026',
            'is_current' => true,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->delete(route('sections.destroy', $section2->id));

        $response->assertSessionHasErrors(['error']);
        $this->assertDatabaseHas('sections', ['id' => $section2->id]);
    }
}
