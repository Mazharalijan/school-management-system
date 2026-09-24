<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StaffAndPayrollSeeder extends Seeder
{
    public function run(): void
    {
        $designations = ['Senior Teacher', 'Lecturer', 'Assistant Professor', 'Junior Teacher', 'Lab Instructor'];
        $qualifications = ['MS / M.Phil', 'BS (4-Year Program)', 'M.Sc Physics', 'MA English', 'BS Computer Science'];

        // 1. Create 10 Staff Members
        for ($i = 1; $i <= 10; $i++) {
            DB::table('staff')->insert([
                'id' => $i,
                'user_id' => $i,
                'employee_id' => 'EMP-2026-00'.$i,
                'first_name' => 'TeacherFirst'.$i,
                'last_name' => 'TeacherLast'.$i,
                'father_name' => 'FatherName'.$i,
                'cnic' => "17301-765432{$i}-".($i % 9),
                'designation' => $designations[$i % 5],
                'gender' => $i % 2 == 0 ? 'female' : 'male',
                'date_of_birth' => '1988-04-12',
                'joining_date' => '2022-01-15',
                'qualification' => $qualifications[$i % 5],
                'skills' => json_encode(['Classroom Management', 'Lesson Planning', 'Smartboard Operator']),
                'phone' => "0300555010{$i}",
                'email' => "teacher{$i}@school.edu.pk",
                'address' => "House #{$i}, Street {$i}, Officers Colony, Peshawar",
                'salary' => 60000.00 + ($i * 5000),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Staff Salary Advances (Multiple scenarios)
        for ($sId = 1; $sId <= 10; $sId++) {
            DB::table('staff_salary_advances')->insert([
                'staff_id' => $sId,
                'amount' => 10000.00,
                'issued_date' => '2025-11-10',
                'status' => 'adjusted',
                'reason' => 'Emergency Medical Loan',
                'issued_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. 10 Months Salary Settlements for ALL Teachers (All cases)
        $months = [
            '2025-11', '2025-12', '2026-01', '2026-02', '2026-03',
            '2026-04', '2026-05', '2026-06', '2026-07', '2026-08',
        ];

        foreach ($months as $mIndex => $mYear) {
            foreach (range(1, 10) as $staffId) {
                $baseSalary = 60000.00 + ($staffId * 5000);

                // Varied business logic scenarios across months
                $unpaidLeaves = ($mIndex == 2 && $staffId % 3 == 0) ? 2 : 0; // Month 3 leave cutoff case
                $leaveDeduction = $unpaidLeaves * ($baseSalary / 30);
                $advanceAdjusted = ($mIndex == 0) ? 5000.00 : 0.00; // Month 1 advance recovery
                $settlementType = ($mIndex == 9 && $staffId == 10) ? 'resignation_prorated' : 'monthly';

                $grossPayable = $baseSalary - $leaveDeduction;
                $netPaid = $grossPayable - $advanceAdjusted;

                $settlementId = DB::table('staff_salary_settlements')->insertGetId([
                    'staff_id' => $staffId,
                    'voucher_no' => "SAL-{$mYear}-00".$staffId,
                    'settlement_type' => $settlementType,
                    'month_year' => $mYear,
                    'base_salary' => $baseSalary,
                    'worked_days' => 30 - $unpaidLeaves,
                    'total_days_in_month' => 30,
                    'unpaid_leaves' => $unpaidLeaves,
                    'apply_leave_cutoff' => $unpaidLeaves > 0,
                    'leave_cutoff_amount' => $leaveDeduction,
                    'advance_adjusted' => $advanceAdjusted,
                    'gross_payable' => $grossPayable,
                    'net_paid' => $netPaid,
                    'payment_method' => $staffId % 2 == 0 ? 'bank_transfer' : 'cash',
                    'reference_no' => 'TRX-'.rand(100000, 999999),
                    'payment_date' => "{$mYear}-28",
                    'processed_by' => 1,
                    'notes' => 'Regular monthly payroll processing',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 4. Staff Ledger entries per transaction
                DB::table('staff_ledgers')->insert([
                    'staff_id' => $staffId,
                    'transaction_date' => "{$mYear}-28",
                    'description' => "Salary Payout for {$mYear}",
                    'type' => 'credit',
                    'amount' => $netPaid,
                    'balance' => 0.00,
                    'reference_type' => 'App\Models\StaffSalarySettlement',
                    'reference_id' => $settlementId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
