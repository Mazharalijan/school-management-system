<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class;

    protected Section $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->class = SchoolClass::create([
            'name' => 'Class 10',
            'numeric_value' => 10,
            'code' => 'CLS-10',
        ]);
        $this->section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'Section A',
            'capacity' => 30,
        ]);
    }

    public function test_can_create_student_with_photo(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('student.jpg', 600, 600);

        $payload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'male',
            'date_of_birth' => '2010-05-15',
            'guardian_name' => 'Jane Doe',
            'guardian_relation' => 'Mother',
            'guardian_phone' => '1234567890',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '101',
            'photo' => $photo,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('students.store'), $payload);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('students', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'roll_number' => '101',
        ]);

        $student = Student::where('first_name', 'John')->first();
        $this->assertNotNull($student->photo_path);
        Storage::disk('public')->assertExists($student->photo_path);
    }

    public function test_can_update_student_details_and_photo(): void
    {
        Storage::fake('public');

        $initialPhoto = UploadedFile::fake()->image('old_photo.jpg', 400, 400);

        $student = Student::create([
            'admission_number' => 'ADM-2026-0001',
            'roll_number' => '101',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'male',
            'date_of_birth' => '2010-05-15',
            'guardian_name' => 'Jane Doe',
            'guardian_relation' => 'Mother',
            'guardian_phone' => '1234567890',
            'admission_date' => '2026-01-01',
            'status' => 'active',
            'photo_path' => $initialPhoto->store('students', 'public'),
        ]);

        $oldPath = $student->photo_path;
        Storage::disk('public')->assertExists($oldPath);

        $newPhoto = UploadedFile::fake()->image('new_photo.jpg', 500, 500);

        // Typical payload submitted from StudentFormModal
        $updatePayload = [
            'first_name' => 'Johnny',
            'last_name' => 'Doe Updated',
            'gender' => 'male',
            'date_of_birth' => '2010-05-15',
            'guardian_name' => 'Jane Doe',
            'guardian_relation' => 'Mother',
            'guardian_phone' => '1234567890',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '101',
            'photo' => $newPhoto,
        ];

        // Inertia sends POST with _method: 'put'
        $response = $this->actingAs($this->user)
            ->post(route('students.update', $student->id), array_merge($updatePayload, ['_method' => 'put']));

        $response->assertSessionHasNoErrors();

        $student->refresh();
        $this->assertEquals('Johnny', $student->first_name);
        $this->assertNotEquals($oldPath, $student->photo_path);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($student->photo_path);
    }

    public function test_aspect_ratio_is_corrected_to_square_when_rectangular_image_uploaded(): void
    {
        Storage::fake('public');

        // Non-square 800x400 image (2:1 aspect ratio)
        $widePhoto = UploadedFile::fake()->image('wide.jpg', 800, 400);

        $payload = [
            'first_name' => 'Sara',
            'last_name' => 'Ahmad',
            'gender' => 'female',
            'date_of_birth' => '2012-08-20',
            'guardian_name' => 'Ahmad Senior',
            'guardian_relation' => 'Father',
            'guardian_phone' => '1234567890',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'photo' => $widePhoto,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('students.store'), $payload);

        $response->assertSessionHasNoErrors();
        $student = Student::where('first_name', 'Sara')->first();
        $this->assertNotNull($student->photo_path);

        $savedImagePath = Storage::disk('public')->path($student->photo_path);
        [$width, $height] = getimagesize($savedImagePath);

        // Aspect ratio is corrected to perfect 1:1 square (500x500)
        $this->assertEquals(500, $width);
        $this->assertEquals(500, $height);
    }

    public function test_profile_photo_with_green_or_white_background(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('passport.png', 600, 700);

        $payload = [
            'first_name' => 'Usman',
            'last_name' => 'Tariq',
            'gender' => 'male',
            'date_of_birth' => '2011-03-10',
            'guardian_name' => 'Tariq',
            'guardian_relation' => 'Father',
            'guardian_phone' => '1234567890',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'photo' => $photo,
            'background_color' => 'green',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('students.store'), $payload);

        $response->assertSessionHasNoErrors();
        $student = Student::where('first_name', 'Usman')->first();
        $this->assertNotNull($student->photo_path);

        $savedImagePath = Storage::disk('public')->path($student->photo_path);
        [$width, $height] = getimagesize($savedImagePath);
        $this->assertEquals(500, $width);
        $this->assertEquals(500, $height);
    }

    public function test_can_search_students_by_various_fields(): void
    {
        $student = Student::create([
            'admission_number' => 'ADM-999',
            'roll_number' => 'ROLL-999',
            'first_name' => 'Bilal',
            'last_name' => 'Ahmad',
            'gender' => 'male',
            'date_of_birth' => '2012-04-10',
            'guardian_name' => 'Muhammad Ahmad',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'father_cnic' => '35201-1234567-1',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        // Search by first name
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => 'Bilal']));
        $response->assertOk()->assertJsonCount(1);
        $this->assertEquals($student->id, $response->json('0.id'));

        // Search by full name
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => 'Bilal Ahmad']));
        $response->assertOk()->assertJsonCount(1);

        // Search by guardian name
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => 'Muhammad Ahmad']));
        $response->assertOk()->assertJsonCount(1);

        // Search by phone
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => '03001234567']));
        $response->assertOk()->assertJsonCount(1);

        // Search by father CNIC
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => '35201-1234567-1']));
        $response->assertOk()->assertJsonCount(1);

        // Search by roll number
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => 'ROLL-999']));
        $response->assertOk()->assertJsonCount(1);

        // Empty query returns empty array
        $response = $this->actingAs($this->user)->getJson(route('students.search', ['q' => '']));
        $response->assertOk()->assertJsonCount(0);
    }

    public function test_can_store_and_update_student_with_father_cnic(): void
    {
        $payload = [
            'first_name' => 'Ali',
            'last_name' => 'Raza',
            'gender' => 'male',
            'date_of_birth' => '2012-01-01',
            'guardian_name' => 'Raza Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03009999999',
            'father_cnic' => '35202-9876543-1',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '505',
        ];

        $response = $this->actingAs($this->user)->post(route('students.store'), $payload);
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('students', [
            'first_name' => 'Ali',
            'father_cnic' => '35202-9876543-1',
        ]);

        $student = Student::where('first_name', 'Ali')->first();

        // Update CNIC
        $updatePayload = [
            'first_name' => 'Ali',
            'last_name' => 'Raza',
            'gender' => 'male',
            'date_of_birth' => '2012-01-01',
            'guardian_name' => 'Raza Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03009999999',
            'father_cnic' => '35202-1111111-9',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '505',
        ];

        $updateResponse = $this->actingAs($this->user)->put(route('students.update', $student), $updatePayload);
        $updateResponse->assertSessionHasNoErrors();

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'father_cnic' => '35202-1111111-9',
        ]);
    }

    public function test_student_update_allows_same_roll_number_as_another_class_section(): void
    {
        // Student in Section 1 with roll number '01'
        $student1 = Student::create([
            'admission_number' => 'ADM-TEST-001',
            'first_name' => 'First',
            'last_name' => 'Student',
            'gender' => 'male',
            'date_of_birth' => '2015-01-01',
            'guardian_name' => 'Father One',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001111111',
            'admission_date' => '2026-01-01',
            'status' => 'active',
            'roll_number' => '01',
        ]);
        StudentEnrollment::create([
            'student_id' => $student1->id,
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        // Second class and section
        $class2 = SchoolClass::create([
            'name' => 'Grade 2 Test',
            'numeric_value' => 3,
            'code' => 'G2T',
        ]);
        $section2 = Section::create([
            'school_class_id' => $class2->id,
            'name' => 'A',
            'capacity' => 20,
        ]);

        // Student in Section 2
        $student2 = Student::create([
            'admission_number' => 'ADM-TEST-002',
            'first_name' => 'Second',
            'last_name' => 'Student',
            'gender' => 'female',
            'date_of_birth' => '2015-02-02',
            'guardian_name' => 'Father Two',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03002222222',
            'admission_date' => '2026-01-01',
            'status' => 'active',
            'roll_number' => '05',
        ]);
        StudentEnrollment::create([
            'student_id' => $student2->id,
            'school_class_id' => $class2->id,
            'section_id' => $section2->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        // Update student 2 to roll_number '01' (same roll number as student 1, but in section 2)
        $updatePayload = [
            'first_name' => 'Second',
            'last_name' => 'Student Updated',
            'gender' => 'female',
            'date_of_birth' => '2015-02-02',
            'guardian_name' => 'Father Two',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03002222222',
            'school_class_id' => $class2->id,
            'section_id' => $section2->id,
            'roll_number' => '01',
        ];

        $response = $this->actingAs($this->user)->put(route('students.update', $student2), $updatePayload);
        $response->assertSessionHasNoErrors();

        $student2->refresh();
        $this->assertEquals('01', $student2->roll_number);
    }

    public function test_student_update_rejects_duplicate_roll_number_in_same_section(): void
    {
        $student1 = Student::create([
            'admission_number' => 'ADM-TEST-101',
            'first_name' => 'First',
            'last_name' => 'Student',
            'gender' => 'male',
            'date_of_birth' => '2015-01-01',
            'guardian_name' => 'Father One',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001111111',
            'admission_date' => '2026-01-01',
            'status' => 'active',
            'roll_number' => '10',
        ]);
        StudentEnrollment::create([
            'student_id' => $student1->id,
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        $student2 = Student::create([
            'admission_number' => 'ADM-TEST-102',
            'first_name' => 'Second',
            'last_name' => 'Student',
            'gender' => 'female',
            'date_of_birth' => '2015-02-02',
            'guardian_name' => 'Father Two',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03002222222',
            'admission_date' => '2026-01-01',
            'status' => 'active',
            'roll_number' => '11',
        ]);
        StudentEnrollment::create([
            'student_id' => $student2->id,
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'session_year' => '2026-2027',
            'is_current' => true,
        ]);

        // Attempt to update student 2 with roll number '10' which is already taken in the SAME section
        $updatePayload = [
            'first_name' => 'Second',
            'last_name' => 'Student',
            'gender' => 'female',
            'date_of_birth' => '2015-02-02',
            'guardian_name' => 'Father Two',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03002222222',
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '10',
        ];

        $response = $this->actingAs($this->user)->put(route('students.update', $student2), $updatePayload);
        $response->assertSessionHasErrors(['roll_number']);
    }
}
