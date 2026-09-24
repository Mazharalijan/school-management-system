<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimetableTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $schoolClass;

    protected Subject $subject;

    protected Staff $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->schoolClass = SchoolClass::create([
            'name' => 'Class 10',
            'numeric_value' => 10,
            'code' => 'C10',
        ]);
        $this->subject = Subject::create([
            'subject_name' => 'Mathematics',
        ]);
        $this->staff = Staff::create([
            'employee_id' => 'EMP-001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'father_name' => 'Richard Doe',
            'cnic' => '12345-6789012-3',
            'gender' => 'male',
            'designation' => 'Teacher',
            'date_of_birth' => '1990-01-01',
            'joining_date' => '2020-01-01',
            'qualification' => 'BS Computer Science',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'salary' => 50000,
            'status' => 'active',
        ]);
    }

    public function test_can_access_timetable_index_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('timetable.index'));

        $response->assertStatus(200);
    }

    public function test_can_create_manual_timetable_slot(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('timetable.slots.store'), [
                'school_class_id' => $this->schoolClass->id,
                'subject_id' => $this->subject->id,
                'staff_id' => $this->staff->id,
                'day_of_week' => 'monday',
                'period_number' => 1,
                'start_time' => '08:00',
                'end_time' => '08:45',
                'room_number' => '101',
                'academic_year' => '2025-2026',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('timetables', [
            'school_class_id' => $this->schoolClass->id,
            'subject_id' => $this->subject->id,
            'staff_id' => $this->staff->id,
            'day_of_week' => 'monday',
            'period_number' => 1,
            'room_number' => '101',
        ]);
    }

    public function test_teacher_conflict_prevention(): void
    {
        $anotherClass = SchoolClass::create(['name' => 'Class 9', 'numeric_value' => 9, 'code' => 'C9']);

        // Create slot for Class 10 with Staff John Doe on Monday Period 1
        Timetable::create([
            'school_class_id' => $this->schoolClass->id,
            'subject_id' => $this->subject->id,
            'staff_id' => $this->staff->id,
            'day_of_week' => 'monday',
            'period_number' => 1,
            'academic_year' => '2025-2026',
        ]);

        // Attempt to assign John Doe to Class 9 on Monday Period 1
        $response = $this->actingAs($this->user)
            ->post(route('timetable.slots.store'), [
                'school_class_id' => $anotherClass->id,
                'subject_id' => $this->subject->id,
                'staff_id' => $this->staff->id,
                'day_of_week' => 'monday',
                'period_number' => 1,
                'academic_year' => '2025-2026',
            ]);

        $response->assertSessionHasErrors(['staff_id']);
    }

    public function test_auto_generator_creates_weekly_timetable(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('timetable.generate'), [
                'school_class_id' => $this->schoolClass->id,
                'working_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'periods_per_day' => 5,
                'start_time' => '08:00',
                'period_duration_minutes' => 45,
                'break_period' => 3,
                'allocations' => [
                    [
                        'subject_id' => $this->subject->id,
                        'staff_id' => $this->staff->id,
                        'periods_per_week' => 5,
                        'room_number' => 'Room 101',
                    ],
                ],
            ]);

        $response->assertRedirect();

        // 5 working days * 5 periods = 25 slots total
        $this->assertDatabaseCount('timetables', 25);
    }
}
