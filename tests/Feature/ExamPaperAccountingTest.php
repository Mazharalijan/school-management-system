<?php

namespace Tests\Feature;

use App\Models\ExamPaperExpense;
use App\Models\ExamPaperFee;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Accounting\ProfitAndLossService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamPaperAccountingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Student $student;

    protected SchoolClass $class;

    protected ExamSession $examSession;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class = SchoolClass::create([
            'name' => 'Class 10',
            'numeric_value' => 10,
            'code' => 'C10',
        ]);

        $section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'A',
            'capacity' => 30,
        ]);

        $this->student = Student::create([
            'admission_number' => 'ADM-1001',
            'roll_number' => '1001',
            'first_name' => 'Zain',
            'last_name' => 'Ali',
            'gender' => 'male',
            'date_of_birth' => '2010-03-20',
            'guardian_name' => 'Ali Raza',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03007654321',
            'admission_date' => '2026-01-10',
            'status' => 'active',
        ]);

        StudentEnrollment::create([
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'section_id' => $section->id,
            'session_year' => '2026-2027',
            'roll_number' => '1001',
            'is_current' => true,
        ]);

        $this->examSession = ExamSession::create([
            'title' => 'Final Term 2026',
            'session_year' => '2026-2027',
            'start_date' => '2026-11-20',
            'end_date' => '2026-11-30',
            'status' => 'published',
        ]);

        SystemSetting::create([
            'id' => 1,
            'school_name' => 'Horizon Public School',
            'current_session_year' => '2026-2027',
            'currency_symbol' => 'Rs.',
            'currency_code' => 'PKR',
            'timezone' => 'Asia/Karachi',
            'date_format' => 'Y-m-d',
            'phone' => '03001234567',
            'email' => 'admin@horizon.edu.pk',
            'address' => 'Horizon Road, Islamabad',
            'invoice_prefix' => 'INV-',
            'include_fines_in_financial_flow' => true,
        ]);
    }

    public function test_can_view_exam_paper_accounting_dashboard(): void
    {
        $response = $this->actingAs($this->user)->get(route('exam-paper-accounting.index', [
            'exam_session_id' => $this->examSession->id,
        ]));

        $response->assertStatus(200);
    }

    public function test_can_bulk_generate_paper_fees_for_class(): void
    {
        $response = $this->actingAs($this->user)->post(route('exam-paper-accounting.fees.generate-class'), [
            'exam_session_id' => $this->examSession->id,
            'school_class_id' => $this->class->id,
            'amount' => 400.00,
            'notes' => 'Final Term Examination Question Paper & Answer Booklet',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('exam_paper_fees', [
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'amount' => 400.00,
            'status' => 'unpaid',
        ]);
    }

    public function test_can_collect_paper_fee(): void
    {
        $paperFee = ExamPaperFee::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'amount' => 350.00,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->user)->post(route('exam-paper-accounting.fees.collect', $paperFee->id), [
            'payment_method' => 'cash',
            'paid_date' => '2026-11-16',
        ]);

        $response->assertRedirect();
        $paperFee->refresh();

        $this->assertEquals('paid', $paperFee->status);
        $this->assertEquals(350.00, $paperFee->paid_amount);
        $this->assertNotNull($paperFee->receipt_no);
        $this->assertEquals('2026-11-16', $paperFee->paid_date->format('Y-m-d'));
    }

    public function test_can_log_exam_paper_expense(): void
    {
        $response = $this->actingAs($this->user)->post(route('exam-paper-accounting.expenses.store'), [
            'exam_session_id' => $this->examSession->id,
            'title' => 'Bulk Printing of 3,000 Question Papers',
            'category' => 'printing',
            'amount' => 12500.00,
            'expense_date' => '2026-11-16',
            'vendor_name' => 'Fast Print Press',
            'invoice_bill_no' => 'INV-8821',
            'payment_method' => 'cash',
            'notes' => 'Delivered to exam controller office',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('exam_paper_expenses', [
            'exam_session_id' => $this->examSession->id,
            'title' => 'Bulk Printing of 3,000 Question Papers',
            'category' => 'printing',
            'amount' => 12500.00,
            'vendor_name' => 'Fast Print Press',
        ]);
    }

    public function test_exam_paper_accounting_pnl_integration(): void
    {
        // 1. Paid paper fee
        ExamPaperFee::create([
            'exam_session_id' => $this->examSession->id,
            'student_id' => $this->student->id,
            'school_class_id' => $this->class->id,
            'amount' => 1000.00,
            'paid_amount' => 1000.00,
            'status' => 'paid',
            'paid_date' => '2026-11-16',
            'receipt_no' => 'PMR-20261116-001',
        ]);

        // 2. Paper Expense
        ExamPaperExpense::create([
            'exam_session_id' => $this->examSession->id,
            'title' => 'Answer sheet bundles',
            'category' => 'stationery',
            'amount' => 400.00,
            'expense_date' => '2026-11-16',
            'payment_method' => 'cash',
        ]);

        $pnlService = app(ProfitAndLossService::class);
        $summary = $pnlService->getProfitAndLossSummary('2026-11-01', '2026-11-30');

        // Revenue checks
        $this->assertEquals(1000.00, $summary['revenue']['exam_paper_fees']);
        // Expenses checks
        $this->assertEquals(400.00, $summary['expenses']['exam_paper_expenses']);
        // Exam Paper P&L module stats
        $this->assertEquals(1000.00, $summary['exam_paper_accounting']['total_collected']);
        $this->assertEquals(400.00, $summary['exam_paper_accounting']['total_expenses']);
        $this->assertEquals(600.00, $summary['exam_paper_accounting']['net_profit_loss']);
        $this->assertTrue($summary['exam_paper_accounting']['is_profit']);
    }
}
