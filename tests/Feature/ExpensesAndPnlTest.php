<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FeePayment;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\StaffSalarySettlement;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpensesAndPnlTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected ExpenseCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->category = ExpenseCategory::create([
            'name' => 'Campus Utilities',
            'code' => 'EXP-UTIL',
            'description' => 'Electricity, gas, and water expenses.',
            'is_active' => true,
        ]);
    }

    public function test_can_access_expenses_and_pnl_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('expenses.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Expenses/Index')
            ->has('pnlSummary')
            ->has('expenses')
            ->has('categories')
            ->has('filters')
        );
    }

    public function test_can_record_a_new_expense(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('expenses.store'), [
                'expense_category_id' => $this->category->id,
                'title' => 'Biology Lab Glassware',
                'amount' => 15000.00,
                'expense_date' => '2026-10-15',
                'payment_method' => 'bank_transfer',
                'reference_no' => 'TRX-998821',
                'paid_to' => 'Lab Instruments Co.',
                'notes' => 'Apparatus for 10th grade biology tests.',
                'status' => 'paid',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('expenses', [
            'expense_category_id' => $this->category->id,
            'title' => 'Biology Lab Glassware',
            'amount' => 15000.00,
            'payment_method' => 'bank_transfer',
            'paid_to' => 'Lab Instruments Co.',
        ]);

        $created = Expense::where('title', 'Biology Lab Glassware')->first();
        $this->assertNotNull($created);
        $this->assertStringStartsWith('EXP-', $created->expense_no);
    }

    public function test_validation_fails_for_invalid_expense(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('expenses.store'), [
                'expense_category_id' => 9999,
                'title' => '',
                'amount' => -100,
                'expense_date' => 'not-a-date',
                'payment_method' => 'invalid_method',
            ]);

        $response->assertSessionHasErrors([
            'expense_category_id',
            'title',
            'amount',
            'expense_date',
            'payment_method',
        ]);
    }

    public function test_can_update_an_existing_expense(): void
    {
        $expense = Expense::create([
            'expense_category_id' => $this->category->id,
            'title' => 'Generator Fuel Initial',
            'amount' => 20000.00,
            'expense_date' => '2026-10-01',
            'payment_method' => 'cash',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('expenses.update', $expense->id), [
                'expense_category_id' => $this->category->id,
                'title' => 'Generator Fuel Revised',
                'amount' => 25000.00,
                'expense_date' => '2026-10-01',
                'payment_method' => 'cash',
                'paid_to' => 'PSO Station',
                'notes' => 'Extra 20L added.',
                'status' => 'paid',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'title' => 'Generator Fuel Revised',
            'amount' => 25000.00,
            'paid_to' => 'PSO Station',
        ]);
    }

    public function test_can_delete_an_expense(): void
    {
        $expense = Expense::create([
            'expense_category_id' => $this->category->id,
            'title' => 'Office Refreshments',
            'amount' => 3500.00,
            'expense_date' => '2026-10-05',
            'payment_method' => 'cash',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('expenses.destroy', $expense->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('expenses', [
            'id' => $expense->id,
        ]);
    }

    public function test_can_create_a_new_expense_category(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('expenses.categories.store'), [
                'name' => 'Annual Gala & Sports',
                'code' => 'EXP-GALA',
                'description' => 'Event staging, trophies, and arrangements.',
                'is_active' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('expense_categories', [
            'name' => 'Annual Gala & Sports',
            'code' => 'EXP-GALA',
        ]);
    }

    public function test_pnl_summary_reconciles_fee_revenue_salaries_and_expenses(): void
    {
        $startDate = '2026-10-01';
        $endDate = '2026-10-31';

        // 1. Create a student and a fee payment (Revenue = 50,000)
        $class = SchoolClass::create(['name' => 'Grade 8', 'numeric_value' => 8, 'code' => 'G8']);
        $student = Student::create([
            'admission_number' => 'ADM-2026-101',
            'first_name' => 'Ali',
            'last_name' => 'Khan',
            'gender' => 'male',
            'date_of_birth' => '2010-05-15',
            'guardian_name' => 'Tariq Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'admission_date' => '2024-04-01',
            'status' => 'active',
        ]);

        FeePayment::create([
            'receipt_no' => 'REC-2026-1001',
            'student_id' => $student->id,
            'received_by' => $this->user->id,
            'amount_paid' => 50000.00,
            'payment_date' => '2026-10-10',
            'payment_method' => 'bank_transfer',
        ]);

        // 2. Create a staff member and salary settlement (Payroll = 30,000)
        $staff = Staff::create([
            'employee_id' => 'EMP-T-01',
            'first_name' => 'Ahmed',
            'last_name' => 'Raza',
            'father_name' => 'Kamal Raza',
            'cnic' => '17301-1234567-1',
            'designation' => 'Teacher',
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'joining_date' => '2022-01-01',
            'qualification' => 'BS Physics',
            'phone' => '03011234567',
            'email' => 'ahmed.raza.test@school.test',
            'salary' => 30000.00,
            'status' => 'active',
        ]);

        StaffSalarySettlement::create([
            'staff_id' => $staff->id,
            'voucher_no' => 'SAL-2026-10-001',
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'base_salary' => 30000.00,
            'gross_payable' => 30000.00,
            'net_paid' => 30000.00,
            'payment_method' => 'bank_transfer',
            'payment_date' => '2026-10-25',
            'processed_by' => $this->user->id,
        ]);

        // 3. Create Operating Expense (Expense = 8,000)
        Expense::create([
            'expense_category_id' => $this->category->id,
            'title' => 'Internet Bill October',
            'amount' => 8000.00,
            'expense_date' => '2026-10-05',
            'payment_method' => 'online',
            'created_by' => $this->user->id,
            'status' => 'paid',
        ]);

        // Expected Net Profit = 50,000 - (30,000 + 8,000) = 12,000
        $response = $this->actingAs($this->user)
            ->get(route('expenses.index', [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'preset' => 'custom',
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Expenses/Index')
            ->where('pnlSummary.revenue.total', fn ($val) => (float) $val === 50000.0)
            ->where('pnlSummary.expenses.payroll_total', fn ($val) => (float) $val === 30000.0)
            ->where('pnlSummary.expenses.operating_total', fn ($val) => (float) $val === 8000.0)
            ->where('pnlSummary.expenses.total', fn ($val) => (float) $val === 38000.0)
            ->where('pnlSummary.net_profit_loss.amount', fn ($val) => (float) $val === 12000.0)
            ->where('pnlSummary.net_profit_loss.is_profit', true)
        );
    }
}
