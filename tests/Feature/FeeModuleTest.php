<?php

namespace Tests\Feature;

use App\Models\FeeHead;
use App\Models\FeeInvoice;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeModuleTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected SchoolClass $class;

    protected Section $section;

    protected FeeHead $tuitionHead;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->class = SchoolClass::create([
            'name' => 'Class 9',
            'numeric_value' => 9,
            'code' => 'CLS-9',
        ]);
        $this->section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'Rose',
            'capacity' => 30,
        ]);
        $this->tuitionHead = FeeHead::create([
            'title' => 'Monthly Tuition Fee',
            'type' => 'recurring',
            'is_active' => true,
        ]);
    }

    protected function createStudent(array $attributes = []): Student
    {
        return Student::create(array_merge([
            'admission_number' => 'ADM-'.rand(1000, 9999),
            'first_name' => 'Test',
            'last_name' => 'Student',
            'guardian_name' => 'Guardian Name',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'gender' => 'male',
            'date_of_birth' => '2010-05-15',
            'admission_date' => '2026-01-10',
            'status' => 'active',
        ], $attributes));
    }

    public function test_fee_heads_can_be_created_and_listed(): void
    {
        $response = $this->actingAs($this->user)->post(route('fees.heads.store'), [
            'title' => 'Library Fee',
            'type' => 'recurring',
            'description' => 'Monthly library access charges',
            'is_active' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('fee_heads', [
            'title' => 'Library Fee',
            'type' => 'recurring',
        ]);
    }

    public function test_class_fee_structure_can_be_stored(): void
    {
        $response = $this->actingAs($this->user)->post(route('fees.structure.store'), [
            'school_class_id' => $this->class->id,
            'session_year' => '2026',
            'fees' => [
                [
                    'fee_head_id' => $this->tuitionHead->id,
                    'amount' => 2500.00,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('fee_structures', [
            'school_class_id' => $this->class->id,
            'fee_head_id' => $this->tuitionHead->id,
            'amount' => 2500.00,
            'session_year' => '2026',
        ]);
    }

    public function test_bulk_invoices_generation_for_enrolled_students(): void
    {
        FeeStructure::create([
            'school_class_id' => $this->class->id,
            'fee_head_id' => $this->tuitionHead->id,
            'amount' => 3000.00,
            'session_year' => '2026',
        ]);

        $student = $this->createStudent([
            'first_name' => 'Ahmed',
            'last_name' => 'Khan',
        ]);

        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'roll_number' => '01',
            'session_year' => '2026',
            'is_current' => true,
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->post(route('fees.invoices.generate'), [
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'month' => 'May 2026',
            'issue_date' => '2026-05-01',
            'due_date' => '2026-05-10',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('fee_invoices', [
            'student_id' => $student->id,
            'school_class_id' => $this->class->id,
            'month' => 'May 2026',
            'subtotal' => 3000.00,
            'total_amount' => 3000.00,
            'due_amount' => 3000.00,
            'status' => 'unpaid',
        ]);

        $invoice = FeeInvoice::where('student_id', $student->id)->first();
        $this->assertNotNull($invoice);
        $this->assertGreaterThan(0, $invoice->items()->count());
    }

    public function test_payment_collection_updates_invoice_due_amount_and_status(): void
    {
        $student = $this->createStudent([
            'first_name' => 'Sara',
            'last_name' => 'Ali',
            'gender' => 'female',
        ]);

        $invoice = FeeInvoice::create([
            'invoice_no' => 'INV-202605-0002-12',
            'student_id' => $student->id,
            'school_class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'month' => 'May 2026',
            'month_order' => 5,
            'session_year' => '2026',
            'issue_date' => '2026-05-01',
            'due_date' => '2026-05-10',
            'subtotal' => 4000.00,
            'discount' => 0.00,
            'previous_arrears' => 0.00,
            'fine' => 0.00,
            'total_amount' => 4000.00,
            'paid_amount' => 0.00,
            'due_amount' => 4000.00,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->user)->post(route('fees.invoices.collect', $invoice->id), [
            'amount_paid' => 4000.00,
            'payment_date' => '2026-05-05',
            'payment_method' => 'cash',
        ]);

        $response->assertSessionHasNoErrors();

        $invoice->refresh();
        $this->assertEquals(4000.00, (float) $invoice->paid_amount);
        $this->assertEquals(0.00, (float) $invoice->due_amount);
        $this->assertEquals('paid', $invoice->status);
    }

    public function test_student_fee_profile_can_be_stored_and_locked_after_payment(): void
    {
        $student = $this->createStudent([
            'first_name' => 'Bilal',
            'last_name' => 'Tariq',
        ]);

        $response = $this->actingAs($this->user)->post(route('fees.student-profile.store'), [
            'student_id' => $student->id,
            'school_class_id' => $this->class->id,
            'session_year' => '2026',
            'base_monthly_fee' => 5000.00,
            'monthly_discount' => 1000.00,
            'discount_reason' => 'Scholarship Concession',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('student_fee_profiles', [
            'student_id' => $student->id,
            'session_year' => '2026',
            'base_monthly_fee' => 5000.00,
            'monthly_discount' => 1000.00,
            'net_monthly_fee' => 4000.00,
        ]);
    }
}
