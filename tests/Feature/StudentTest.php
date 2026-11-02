<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
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
}
