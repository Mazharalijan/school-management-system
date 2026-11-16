<?php

namespace Tests\Feature;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentFine;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Accounting\ProfitAndLossService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentFineTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Student $student;

    protected SchoolClass $class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class = SchoolClass::create([
            'name' => 'Class 9',
            'numeric_value' => 9,
            'code' => 'C9',
        ]);

        $section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'Rose',
            'capacity' => 30,
        ]);

        $this->student = Student::create([
            'admission_number' => 'ADM-901',
            'roll_number' => '901',
            'first_name' => 'Bilal',
            'last_name' => 'Ahmed',
            'gender' => 'male',
            'date_of_birth' => '2011-05-15',
            'guardian_name' => 'Ahmed Ali',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03009876543',
            'admission_date' => '2026-01-10',
            'status' => 'active',
        ]);

        StudentEnrollment::create([
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'section_id' => $section->id,
            'session_year' => '2026-2027',
            'roll_number' => '901',
            'is_current' => true,
        ]);

        SystemSetting::create([
            'id' => 1,
            'school_name' => 'Beacon Academy',
            'current_session_year' => '2026-2027',
            'currency_symbol' => 'Rs.',
            'currency_code' => 'PKR',
            'timezone' => 'Asia/Karachi',
            'date_format' => 'Y-m-d',
            'phone' => '03001234567',
            'email' => 'admin@beacon.edu.pk',
            'address' => 'Main Campus, Lahore',
            'invoice_prefix' => 'INV-',
            'include_fines_in_financial_flow' => true,
        ]);
    }

    public function test_can_view_student_fines_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('fines.index'));
        $response->assertStatus(200);
    }

    public function test_can_impose_fine_unpaid(): void
    {
        $response = $this->actingAs($this->user)->post(route('fines.store'), [
            'student_id' => $this->student->id,
            'fine_type' => 'leave',
            'collection_mode' => 'monthly',
            'amount' => 150.00,
            'reason' => 'Unexcused short absence on sports day',
            'fine_date' => '2026-11-16',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_fines', [
            'student_id' => $this->student->id,
            'fine_type' => 'leave',
            'collection_mode' => 'monthly',
            'amount' => 150.00,
            'status' => 'unpaid',
        ]);
    }

    public function test_can_impose_fine_and_collect_immediately(): void
    {
        $response = $this->actingAs($this->user)->post(route('fines.store'), [
            'student_id' => $this->student->id,
            'fine_type' => 'discipline',
            'collection_mode' => 'on_the_spot',
            'amount' => 200.00,
            'reason' => 'Without proper uniform jacket',
            'fine_date' => '2026-11-16',
            'collect_now' => true,
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('student_fines', [
            'student_id' => $this->student->id,
            'amount' => 200.00,
            'paid_amount' => 200.00,
            'status' => 'paid',
            'payment_method' => 'cash',
        ]);
    }

    public function test_can_collect_fine_on_the_spot(): void
    {
        $fine = StudentFine::create([
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'fine_type' => 'exam',
            'collection_mode' => 'on_the_spot',
            'amount' => 300.00,
            'reason' => 'Late entry in exam hall',
            'fine_date' => '2026-11-10',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->user)->post(route('fines.collect', $fine->id), [
            'payment_method' => 'cash',
            'paid_date' => '2026-11-16',
        ]);

        $response->assertRedirect();
        $fine->refresh();

        $this->assertEquals('paid', $fine->status);
        $this->assertEquals(300.00, $fine->paid_amount);
        $this->assertNotNull($fine->receipt_no);
        $this->assertEquals('cash', $fine->payment_method);
    }

    public function test_can_waive_fine_with_reason(): void
    {
        $fine = StudentFine::create([
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'fine_type' => 'leave',
            'collection_mode' => 'monthly',
            'amount' => 100.00,
            'reason' => 'Absence without leave slip',
            'fine_date' => '2026-11-12',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->user)->post(route('fines.waive', $fine->id), [
            'waived_reason' => 'Medical certificate produced by guardian',
        ]);

        $response->assertRedirect();
        $fine->refresh();

        $this->assertEquals('waived', $fine->status);
        $this->assertEquals('Medical certificate produced by guardian', $fine->waived_reason);
    }

    public function test_system_setting_controls_fine_flow_in_pnl(): void
    {
        // Create a paid fine
        StudentFine::create([
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'fine_type' => 'test',
            'collection_mode' => 'on_the_spot',
            'amount' => 500.00,
            'paid_amount' => 500.00,
            'reason' => 'Class test violation',
            'fine_date' => '2026-11-15',
            'status' => 'paid',
            'paid_date' => '2026-11-15',
            'receipt_no' => 'FINE-20261115-001',
        ]);

        $pnlService = app(ProfitAndLossService::class);
        $startDate = '2026-11-01';
        $endDate = '2026-11-30';

        // 1. With setting enabled: fine is included in revenue
        SystemSetting::first()->update(['include_fines_in_financial_flow' => true]);
        $summaryEnabled = $pnlService->getProfitAndLossSummary($startDate, $endDate);
        $this->assertEquals(500.00, $summaryEnabled['revenue']['fine_collections']);
        $this->assertGreaterThanOrEqual(500.00, $summaryEnabled['revenue']['total']);

        // 2. With setting disabled: fine is excluded from revenue
        SystemSetting::first()->update(['include_fines_in_financial_flow' => false]);
        $summaryDisabled = $pnlService->getProfitAndLossSummary($startDate, $endDate);
        $this->assertEquals(0.00, $summaryDisabled['revenue']['fine_collections']);
    }
}
