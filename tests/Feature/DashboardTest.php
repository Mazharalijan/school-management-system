<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FeePayment;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected_from_dashboard(): void
    {
        $response = $this->get('/');

        // Without users in database, redirects to register
        $response->assertRedirect(route('register'));

        User::factory()->create();

        $responseWithUsers = $this->get('/');
        // With users in database, redirects to login
        $responseWithUsers->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_dashboard_with_all_metrics(): void
    {
        $user = User::factory()->create();

        // Create sample students
        Student::create([
            'admission_number' => 'ADM-2026-001',
            'roll_number' => 'R-01',
            'first_name' => 'Ali',
            'last_name' => 'Khan',
            'gender' => 'male',
            'date_of_birth' => '2015-01-01',
            'guardian_name' => 'Khan Senior',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        Student::create([
            'admission_number' => 'ADM-2026-002',
            'roll_number' => 'R-02',
            'first_name' => 'Fatima',
            'last_name' => 'Zahra',
            'gender' => 'female',
            'date_of_birth' => '2015-02-01',
            'guardian_name' => 'Zahra Senior',
            'guardian_relation' => 'Mother',
            'guardian_phone' => '03007654321',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);

        // Create sample staff / teacher
        Staff::create([
            'employee_id' => 'EMP-001',
            'first_name' => 'Ahmad',
            'last_name' => 'Hassan',
            'father_name' => 'Hassan Senior',
            'cnic' => '12345-1234567-1',
            'designation' => 'Senior Teacher',
            'gender' => 'male',
            'date_of_birth' => '1985-05-15',
            'joining_date' => '2020-01-01',
            'qualification' => 'M.Sc Physics',
            'phone' => '03123456789',
            'email' => 'ahmad.hassan@school.edu.pk',
            'salary' => 75000,
            'status' => 'active',
        ]);

        // Create sample expense category & expense
        $category = ExpenseCategory::create([
            'name' => 'Lab Equipment',
            'code' => 'EXP-LAB',
            'is_active' => true,
        ]);

        Expense::create([
            'expense_category_id' => $category->id,
            'title' => 'Microscopes Purchase',
            'amount' => 45000,
            'expense_date' => '2026-10-15',
            'payment_method' => 'cash',
            'created_by' => $user->id,
            'status' => 'paid',
        ]);

        // Create fee payment
        FeePayment::create([
            'receipt_no' => 'REC-2026-001',
            'student_id' => 1,
            'received_by' => $user->id,
            'amount_paid' => 15000,
            'payment_date' => '2026-10-10',
            'payment_method' => 'cash',
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('stats.students', fn ($page) => $page
                ->where('total', 2)
                ->where('active', 2)
                ->where('male', 1)
                ->where('female', 1)
            )
            ->has('stats.staff', fn ($page) => $page
                ->where('total', 1)
                ->where('active', 1)
                ->where('teachers', 1)
            )
            ->has('stats.financials.selected_period', fn ($page) => $page
                ->where('revenue', 15000)
                ->where('operating_expenses', 45000)
                ->where('net_profit_loss', -30000)
                ->where('is_profit', false)
                ->etc()
            )
            ->has('recentExpenses', 1)
            ->has('recentFeePayments', 1)
            ->has('monthlyTrends')
        );
    }

    public function test_dashboard_supports_period_filter(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/?period=this_month');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('currentPeriod', 'this_month')
        );
    }

    public function test_all_quick_navigation_routes_are_accessible(): void
    {
        $user = User::factory()->create();

        $routes = [
            'students.index' => route('students.index'),
            'staff.index' => route('staff.index'),
            'fees.invoices.index' => route('fees.invoices.index'),
            'fees.structure.index' => route('fees.structure.index'),
            'expenses.index' => route('expenses.index'),
            'classes.index' => route('classes.index'),
            'timetable.index' => route('timetable.index'),
            'question-bank.index' => route('question-bank.index'),
            'exam-class-papers.index' => route('exam-class-papers.index'),
            'marks.entry' => route('marks.entry'),
            'inventory.index' => route('inventory.index'),
            'settings.edit' => route('settings.edit'),
        ];

        foreach ($routes as $name => $url) {
            $response = $this->actingAs($user)->get($url);
            $response->assertStatus(200);
        }
    }
}
