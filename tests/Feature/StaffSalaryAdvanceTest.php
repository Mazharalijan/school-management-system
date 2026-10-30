<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\StaffLedger;
use App\Models\StaffSalaryAdvance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffSalaryAdvanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected Staff $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();

        $this->staff = Staff::create([
            'employee_id' => 'EMP-2026-0001',
            'first_name' => 'Ahmad',
            'last_name' => 'Khan',
            'father_name' => 'Tariq Khan',
            'cnic' => '17301-1234567-1',
            'designation' => 'Senior Teacher',
            'gender' => 'male',
            'date_of_birth' => '1990-05-15',
            'joining_date' => '2023-01-10',
            'qualification' => 'Master / M.Sc',
            'skills' => ['Classroom Management', 'Mathematics'],
            'phone' => '03001234567',
            'email' => 'ahmad.khan@school.edu.pk',
            'address' => 'Peshawar, KP',
            'salary' => 60000.00,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_issue_salary_advance_to_staff(): void
    {
        $response = $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 15000.00,
            'issued_date' => '2026-10-10',
            'reason' => 'Emergency medical loan',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('staff_salary_advances', [
            'staff_id' => $this->staff->id,
            'amount' => 15000.00,
            'adjusted_amount' => 0.00,
            'status' => 'pending_adjustment',
            'reason' => 'Emergency medical loan',
        ]);

        $this->assertDatabaseHas('staff_ledgers', [
            'staff_id' => $this->staff->id,
            'type' => 'debit',
            'amount' => 15000.00,
            'balance' => -15000.00,
        ]);

        $this->assertEquals(15000.00, $this->staff->fresh()->pending_advances_sum);
    }

    public function test_admin_can_deduct_advance_in_one_salary_full_deduction(): void
    {
        // 1. Issue Advance of 15,000
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 15000.00,
            'issued_date' => '2026-10-10',
            'reason' => 'Advance payment',
        ]);

        $this->assertEquals(15000.00, $this->staff->fresh()->pending_advances_sum);

        // 2. Full deduction in October Salary
        $response = $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'payment_date' => '2026-10-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 15000.00,
            'payment_method' => 'cash',
            'reference_no' => 'PAY-OCT-01',
            'notes' => 'Settled in full',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify settlement record: Gross = 60,000, Advance Adjusted = 15,000, Net Paid = 45,000
        $this->assertDatabaseHas('staff_salary_settlements', [
            'staff_id' => $this->staff->id,
            'month_year' => '2026-10',
            'base_salary' => 60000.00,
            'gross_payable' => 60000.00,
            'advance_adjusted' => 15000.00,
            'net_paid' => 45000.00,
        ]);

        // Advance must now be fully adjusted
        $advance = StaffSalaryAdvance::where('staff_id', $this->staff->id)->first();
        $this->assertEquals('adjusted', $advance->status);
        $this->assertEquals(15000.00, (float) $advance->adjusted_amount);
        $this->assertEquals(0.00, $advance->remaining_amount);

        // Outstanding advance debt is now 0
        $this->assertEquals(0.00, $this->staff->fresh()->pending_advances_sum);

        // Ledger balances: Debit -15000 + Credit 60000 - Debit 45000 = 0.00
        $latestBalance = (float) StaffLedger::where('staff_id', $this->staff->id)->latest('id')->value('balance');
        $this->assertEquals(0.00, $latestBalance);
    }

    public function test_admin_can_deduct_advance_in_multiple_salaries_installments(): void
    {
        // 1. Issue an advance of 20,000
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 20000.00,
            'issued_date' => '2026-08-05',
            'reason' => 'Large personal loan',
        ]);

        $this->assertEquals(20000.00, $this->staff->fresh()->pending_advances_sum);

        // 2. Month 1 (August): Deduct 1st installment of 6,000
        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-08',
            'payment_date' => '2026-08-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 6000.00,
            'payment_method' => 'bank_transfer',
        ]);

        $advance = StaffSalaryAdvance::where('staff_id', $this->staff->id)->first();
        $this->assertEquals('partially_adjusted', $advance->status);
        $this->assertEquals(6000.00, (float) $advance->adjusted_amount);
        $this->assertEquals(14000.00, $advance->remaining_amount);
        $this->assertEquals(14000.00, $this->staff->fresh()->pending_advances_sum);

        // 3. Month 2 (September): Deduct 2nd installment of 8,000
        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-09',
            'payment_date' => '2026-09-30',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 8000.00,
            'payment_method' => 'bank_transfer',
        ]);

        $advance->refresh();
        $this->assertEquals('partially_adjusted', $advance->status);
        $this->assertEquals(14000.00, (float) $advance->adjusted_amount);
        $this->assertEquals(6000.00, $advance->remaining_amount);
        $this->assertEquals(6000.00, $this->staff->fresh()->pending_advances_sum);

        // 4. Month 3 (October): Deduct final installment of 6,000
        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'payment_date' => '2026-10-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 6000.00,
            'payment_method' => 'bank_transfer',
        ]);

        $advance->refresh();
        $this->assertEquals('adjusted', $advance->status);
        $this->assertEquals(20000.00, (float) $advance->adjusted_amount);
        $this->assertEquals(0.00, $advance->remaining_amount);
        $this->assertEquals(0.00, $this->staff->fresh()->pending_advances_sum);

        // Ledger running balance should equal exactly 0 after full repayment
        $latestBalance = (float) StaffLedger::where('staff_id', $this->staff->id)->latest('id')->value('balance');
        $this->assertEquals(0.00, $latestBalance);
    }

    public function test_admin_can_choose_not_to_deduct_advance_this_month(): void
    {
        // Staff takes advance of 10,000
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 10000.00,
            'issued_date' => '2026-10-01',
            'reason' => 'Advance',
        ]);

        // Settle salary with 0 advance adjustment
        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'payment_date' => '2026-10-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 0.00,
            'payment_method' => 'cash',
        ]);

        $this->assertDatabaseHas('staff_salary_settlements', [
            'staff_id' => $this->staff->id,
            'advance_adjusted' => 0.00,
            'net_paid' => 60000.00,
        ]);

        // Advance remains untouched and pending
        $advance = StaffSalaryAdvance::where('staff_id', $this->staff->id)->first();
        $this->assertEquals('pending_adjustment', $advance->status);
        $this->assertEquals(0.00, (float) $advance->adjusted_amount);
        $this->assertEquals(10000.00, $this->staff->fresh()->pending_advances_sum);
    }

    public function test_fifo_allocation_across_multiple_advances(): void
    {
        // Advance 1: 8,000 on Oct 01
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 8000.00,
            'issued_date' => '2026-10-01',
            'reason' => 'First advance',
        ]);

        // Advance 2: 7,000 on Oct 15
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 7000.00,
            'issued_date' => '2026-10-15',
            'reason' => 'Second advance',
        ]);

        $this->assertEquals(15000.00, $this->staff->fresh()->pending_advances_sum);

        // Admin deducts 11,000 in October salary
        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'payment_date' => '2026-10-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 11000.00,
            'payment_method' => 'cash',
        ]);

        $advances = StaffSalaryAdvance::where('staff_id', $this->staff->id)->orderBy('issued_date', 'asc')->get();

        // First advance (8000) is fully settled
        $this->assertEquals('adjusted', $advances[0]->status);
        $this->assertEquals(8000.00, (float) $advances[0]->adjusted_amount);
        $this->assertEquals(0.00, $advances[0]->remaining_amount);

        // Second advance (7000) had 3000 adjusted, 4000 remaining
        $this->assertEquals('partially_adjusted', $advances[1]->status);
        $this->assertEquals(3000.00, (float) $advances[1]->adjusted_amount);
        $this->assertEquals(4000.00, $advances[1]->remaining_amount);

        $this->assertEquals(4000.00, $this->staff->fresh()->pending_advances_sum);
    }

    public function test_salary_and_advance_history_represented_in_staff_profile_listing(): void
    {
        // Issue advance & settle salary
        $this->actingAs($this->admin)->post(route('staff.salary.advance'), [
            'staff_id' => $this->staff->id,
            'amount' => 12000.00,
            'issued_date' => '2026-10-05',
            'reason' => 'Advance testing',
        ]);

        $this->actingAs($this->admin)->post(route('staff.salary.settlement'), [
            'staff_id' => $this->staff->id,
            'settlement_type' => 'monthly',
            'month_year' => '2026-10',
            'payment_date' => '2026-10-31',
            'unpaid_leaves' => 0,
            'apply_leave_cutoff' => false,
            'advance_adjusted' => 4000.00,
            'payment_method' => 'cash',
        ]);

        // Request staff.index page
        $response = $this->actingAs($this->admin)->get(route('staff.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Index')
            ->has('staff.data', 1)
            ->has('staff.data.0.salary_settlements', 1)
            ->has('staff.data.0.salary_advances', 1)
            ->has('staff.data.0.ledgers')
            ->where('staff.data.0.pending_advances_sum', 8000)
            ->where('staff.data.0.salary_settlements.0.advance_adjusted', '4000.00')
            ->where('staff.data.0.salary_advances.0.adjusted_amount', '4000.00')
        );
    }
}
