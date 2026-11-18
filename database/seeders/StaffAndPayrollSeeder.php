<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StaffAndPayrollSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('staff_ledgers')->truncate();
        DB::table('staff_salary_settlements')->truncate();
        DB::table('staff_salary_advances')->truncate();
        DB::table('staff_attendances')->truncate();
        DB::table('staff')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. 15 Real-Looking Staff Members
        $staffProfiles = [
            [
                'id' => 1,
                'employee_id' => 'EMP-2021-0001',
                'first_name' => 'Muhammad Aslam',
                'last_name' => 'Khan',
                'father_name' => 'Muhammad Akram Khan',
                'cnic' => '17301-1892831-3',
                'designation' => 'Headmaster / Principal',
                'gender' => 'male',
                'date_of_birth' => '1979-04-12',
                'joining_date' => '2021-01-15',
                'qualification' => 'M.Ed / M.A English Literature',
                'skills' => json_encode(['Institutional Leadership', 'Academic Supervision', 'Curriculum Design', 'Public Speaking']),
                'phone' => '0300-5912831',
                'email' => 'headmaster@school.edu.pk',
                'address' => 'House 14, Street 2, Sector N-1, Hayatabad, Peshawar',
                'salary' => 95000.00,
            ],
            [
                'id' => 2,
                'employee_id' => 'EMP-2021-0002',
                'first_name' => 'Tariq',
                'last_name' => 'Mehmood',
                'father_name' => 'Abdul Rasheed',
                'cnic' => '17301-4491028-1',
                'designation' => 'Senior Mathematics Teacher',
                'gender' => 'male',
                'date_of_birth' => '1984-08-22',
                'joining_date' => '2021-03-01',
                'qualification' => 'M.Sc Mathematics / B.Ed',
                'skills' => json_encode(['Algebra & Geometry Specialist', 'Math Olympiad Mentor', 'Classroom Analytics']),
                'phone' => '0333-9182736',
                'email' => 'tariq.math@school.edu.pk',
                'address' => 'Street 8, Gulbahar No. 2, Peshawar City',
                'salary' => 75000.00,
            ],
            [
                'id' => 3,
                'employee_id' => 'EMP-2021-0003',
                'first_name' => 'Ayesha',
                'last_name' => 'Siddiqua',
                'father_name' => 'Hafiz Muhammad Tahir',
                'cnic' => '17301-8891023-4',
                'designation' => 'Senior English Teacher',
                'gender' => 'female',
                'date_of_birth' => '1987-11-05',
                'joining_date' => '2021-08-15',
                'qualification' => 'M.A English Linguistics & Literature',
                'skills' => json_encode(['Creative Writing', 'Phonics Instructor', 'English Debating Coach']),
                'phone' => '0345-9012384',
                'email' => 'ayesha.english@school.edu.pk',
                'address' => 'Flat 4B, Khyber Heights, University Town, Peshawar',
                'salary' => 72000.00,
            ],
            [
                'id' => 4,
                'employee_id' => 'EMP-2022-0004',
                'first_name' => 'Imran',
                'last_name' => 'Shah',
                'father_name' => 'Syed Ghulam Rasool',
                'cnic' => '17301-7261940-5',
                'designation' => 'Senior Science Teacher',
                'gender' => 'male',
                'date_of_birth' => '1986-02-18',
                'joining_date' => '2022-02-10',
                'qualification' => 'M.Sc Physics / B.Ed',
                'skills' => json_encode(['Science Lab Instructor', 'Interactive Experiments', 'STEM Projects']),
                'phone' => '0313-9582194',
                'email' => 'imran.science@school.edu.pk',
                'address' => 'House 71, Phase 2, Hayatabad, Peshawar',
                'salary' => 70000.00,
            ],
            [
                'id' => 5,
                'employee_id' => 'EMP-2022-0005',
                'first_name' => 'Fatima',
                'last_name' => 'Zahra',
                'father_name' => 'Muhammad Jamil',
                'cnic' => '17301-5582910-6',
                'designation' => 'Senior Urdu Teacher',
                'gender' => 'female',
                'date_of_birth' => '1989-06-30',
                'joining_date' => '2022-04-01',
                'qualification' => 'M.A Urdu Adab / B.Ed',
                'skills' => json_encode(['Urdu Calligraphy', 'Speech & Bait Bazi Trainer', 'Grammar Pedagogy']),
                'phone' => '0301-8392019',
                'email' => 'fatima.urdu@school.edu.pk',
                'address' => 'Mohallah Khudadad, Kohati Gate, Peshawar',
                'salary' => 65000.00,
            ],
            [
                'id' => 6,
                'employee_id' => 'EMP-2022-0006',
                'first_name' => 'Saima',
                'last_name' => 'Bibi',
                'father_name' => 'Gul Faraz Khan',
                'cnic' => '17101-3392817-2',
                'designation' => 'Primary Teacher (Grade 1)',
                'gender' => 'female',
                'date_of_birth' => '1991-09-14',
                'joining_date' => '2022-08-20',
                'qualification' => 'M.A Education / B.Ed',
                'skills' => json_encode(['Early Childhood Pedagogy', 'Interactive Phonics', 'Student Engagement']),
                'phone' => '0334-9102938',
                'email' => 'saima.primary@school.edu.pk',
                'address' => 'Village Haji Zai, Shabqadar, Charsadda',
                'salary' => 60000.00,
            ],
            [
                'id' => 7,
                'employee_id' => 'EMP-2023-0007',
                'first_name' => 'Bilal',
                'last_name' => 'Ahmed',
                'father_name' => 'Mushtaq Ahmed',
                'cnic' => '17301-9018273-7',
                'designation' => 'Computer Science Instructor',
                'gender' => 'male',
                'date_of_birth' => '1993-12-01',
                'joining_date' => '2023-01-10',
                'qualification' => 'BS Computer Science (4-Year)',
                'skills' => json_encode(['Computer Lab Administration', 'Coding for Kids', 'Smart Screen Specialist']),
                'phone' => '0302-8172635',
                'email' => 'bilal.cs@school.edu.pk',
                'address' => 'Street 5, Danishabad, Peshawar',
                'salary' => 68000.00,
            ],
            [
                'id' => 8,
                'employee_id' => 'EMP-2023-0008',
                'first_name' => 'Farhana',
                'last_name' => 'Naz',
                'father_name' => 'Nazir Ahmed',
                'cnic' => '17301-6671829-8',
                'designation' => 'Primary Teacher (Grade 2)',
                'gender' => 'female',
                'date_of_birth' => '1990-03-25',
                'joining_date' => '2023-03-01',
                'qualification' => 'B.Sc / B.Ed Elementary',
                'skills' => json_encode(['Foundational Literacy', 'Storytelling', 'Activity Based Learning']),
                'phone' => '0315-9928172',
                'email' => 'farhana.primary@school.edu.pk',
                'address' => 'House 18, Defence Colony, Peshawar Cantt',
                'salary' => 58000.00,
            ],
            [
                'id' => 9,
                'employee_id' => 'EMP-2023-0009',
                'first_name' => 'Rizwan',
                'last_name' => 'Ullah',
                'father_name' => 'Aman Ullah',
                'cnic' => '17201-4418290-9',
                'designation' => 'Islamiyat & Arabic Teacher',
                'gender' => 'male',
                'date_of_birth' => '1985-05-19',
                'joining_date' => '2023-05-15',
                'qualification' => 'M.A Islamic Studies / Dars-e-Nizami',
                'skills' => json_encode(['Tajweed & Nazira Quran', 'Islamic Moral Character Building', 'Arabic Grammar']),
                'phone' => '0333-8819201',
                'email' => 'rizwan.islamiyat@school.edu.pk',
                'address' => 'Mohallah Akhunabad, Charsadda Road, Peshawar',
                'salary' => 62000.00,
            ],
            [
                'id' => 10,
                'employee_id' => 'EMP-2023-0010',
                'first_name' => 'Bushra',
                'last_name' => 'Noreen',
                'father_name' => 'Muhammad Sharif',
                'cnic' => '17301-2281930-2',
                'designation' => 'Social Studies Teacher',
                'gender' => 'female',
                'date_of_birth' => '1992-07-11',
                'joining_date' => '2023-08-01',
                'qualification' => 'M.A Pakistan Studies & History',
                'skills' => json_encode(['Geography Mapping', 'Cultural Exhibitions', 'Civic Education']),
                'phone' => '0346-9918273',
                'email' => 'bushra.ss@school.edu.pk',
                'address' => 'Canal Road, Warsak Colony, Peshawar',
                'salary' => 58000.00,
            ],
            [
                'id' => 11,
                'employee_id' => 'EMP-2023-0011',
                'first_name' => 'Khalid',
                'last_name' => 'Usman',
                'father_name' => 'Usman Ghani',
                'cnic' => '17301-1182938-1',
                'designation' => 'General Science Instructor',
                'gender' => 'male',
                'date_of_birth' => '1988-10-08',
                'joining_date' => '2023-09-10',
                'qualification' => 'B.Sc (Hons) Chemistry / B.Ed',
                'skills' => json_encode(['Practical Lab Safety', 'Environmental Science', 'Science Fair Coordinator']),
                'phone' => '0300-8819204',
                'email' => 'khalid.science@school.edu.pk',
                'address' => 'Street 3, Shami Road, Peshawar Cantt',
                'salary' => 62000.00,
            ],
            [
                'id' => 12,
                'employee_id' => 'EMP-2024-0012',
                'first_name' => 'Sadia',
                'last_name' => 'Malik',
                'father_name' => 'Abdul Malik',
                'cnic' => '17301-7719203-4',
                'designation' => 'Early Childhood Specialist (Nursery & Prep)',
                'gender' => 'female',
                'date_of_birth' => '1994-01-20',
                'joining_date' => '2024-01-15',
                'qualification' => 'Montessori Certified Diploma / B.A',
                'skills' => json_encode(['Montessori Apparatus Handling', 'Fine Motor Skills Development', 'Arts & Crafts']),
                'phone' => '0321-9918271',
                'email' => 'sadia.montessori@school.edu.pk',
                'address' => 'House 5, Officers Colony, Peshawar Cantt',
                'salary' => 55000.00,
            ],
            [
                'id' => 13,
                'employee_id' => 'EMP-2022-0013',
                'first_name' => 'Zubair',
                'last_name' => 'Khan',
                'father_name' => 'Sultan Khan',
                'cnic' => '17301-4401928-3',
                'designation' => 'Accountant & Finance Officer',
                'gender' => 'male',
                'date_of_birth' => '1985-04-14',
                'joining_date' => '2022-06-01',
                'qualification' => 'M.Com Finance / MBA Banking',
                'skills' => json_encode(['Fee Billing Management', 'Cash Flow Analysis', 'Payroll Reconciliation', 'Tax Compliance']),
                'phone' => '0333-5591029',
                'email' => 'accountant@school.edu.pk',
                'address' => 'Sector F-4, Phase 6, Hayatabad, Peshawar',
                'salary' => 65000.00,
            ],
            [
                'id' => 14,
                'employee_id' => 'EMP-2024-0014',
                'first_name' => 'Hina',
                'last_name' => 'Qureshi',
                'father_name' => 'Tariq Qureshi',
                'cnic' => '17301-9918271-6',
                'designation' => 'Student Affairs & Records Superintendent',
                'gender' => 'female',
                'date_of_birth' => '1993-08-04',
                'joining_date' => '2024-03-01',
                'qualification' => 'BBA / Diploma in Office Administration',
                'skills' => json_encode(['Student Records Digitization', 'Admissions Processing', 'Parent Liaison']),
                'phone' => '0345-8819203',
                'email' => 'records@school.edu.pk',
                'address' => 'Street 9, Saddar Road, Peshawar Cantt',
                'salary' => 50000.00,
            ],
            [
                'id' => 15,
                'employee_id' => 'EMP-2024-0015',
                'first_name' => 'Noman',
                'last_name' => 'Ali',
                'father_name' => 'Liaqat Ali',
                'cnic' => '17301-3391028-5',
                'designation' => 'Physical Education & Sports Director',
                'gender' => 'male',
                'date_of_birth' => '1990-11-28',
                'joining_date' => '2024-04-10',
                'qualification' => 'Master in Physical Education (MPEd)',
                'skills' => json_encode(['Cricket & Football Coaching', 'Athletics & Gymnastics', 'First Aid Certified']),
                'phone' => '0312-9918274',
                'email' => 'sports@school.edu.pk',
                'address' => 'Sports Complex Quarters, Peshawar University',
                'salary' => 52000.00,
            ],
        ];

        foreach ($staffProfiles as $staff) {
            DB::table('staff')->insert(array_merge($staff, [
                'user_id' => $staff['id'] + 1, // User 2..16
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Assign Class Teachers to Classes and Sections
        for ($cId = 1; $cId <= 7; $cId++) {
            $teacherId = ($cId % 5) + 2; // Staff 2..6
            DB::table('school_classes')->where('id', $cId)->update(['class_teacher_id' => $teacherId]);
            DB::table('sections')->where('id', $cId)->update(['class_teacher_id' => $teacherId]);
        }

        // 2. Staff Salary Advances
        $advanceData = [
            ['staff_id' => 2, 'amount' => 15000.00, 'adjusted' => 15000.00, 'date' => '2025-05-10', 'reason' => 'Family Medical Expenses'],
            ['staff_id' => 4, 'amount' => 20000.00, 'adjusted' => 20000.00, 'date' => '2025-09-12', 'reason' => 'Home Renovation Advance'],
            ['staff_id' => 7, 'amount' => 10000.00, 'adjusted' => 10000.00, 'date' => '2026-02-15', 'reason' => 'Emergency Travel Allowance'],
            ['staff_id' => 11, 'amount' => 12000.00, 'adjusted' => 6000.00, 'date' => '2026-08-10', 'reason' => 'Motorcycle Maintenance Loan'],
        ];

        foreach ($advanceData as $adv) {
            DB::table('staff_salary_advances')->insert([
                'staff_id' => $adv['staff_id'],
                'amount' => $adv['amount'],
                'adjusted_amount' => $adv['adjusted'],
                'issued_date' => $adv['date'],
                'status' => $adv['adjusted'] >= $adv['amount'] ? 'adjusted' : 'approved',
                'reason' => $adv['reason'],
                'issued_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. 24 Months of Salary Settlements (2 Years: Nov 2024 to Oct 2026)
        $settlementMonths = [];
        $startDate = new \DateTime('2024-11-01');
        for ($m = 0; $m < 24; $m++) {
            $currentMonth = clone $startDate;
            $currentMonth->modify("+{$m} months");
            $settlementMonths[] = $currentMonth->format('Y-m');
        }

        $ledgerId = 1;

        foreach ($settlementMonths as $mIdx => $mYear) {
            foreach ($staffProfiles as $staff) {
                // If staff joined after this month, skip
                if (substr($staff['joining_date'], 0, 7) > $mYear) {
                    continue;
                }

                $baseSalary = (float) $staff['salary'];
                $staffId = $staff['id'];

                // Occasional leave cutoff (1-2 days)
                $unpaidLeaves = ($mIdx % 4 === 0 && $staffId % 3 === 0) ? 1 : 0;
                $leaveDeduction = round($unpaidLeaves * ($baseSalary / 30), 2);

                // Advance deduction if applicable
                $advanceAdjusted = ($mYear === '2025-06' && $staffId === 2) ? 15000.00 : 0.00;
                if ($mYear === '2025-10' && $staffId === 4) {
                    $advanceAdjusted = 20000.00;
                }
                if ($mYear === '2026-03' && $staffId === 7) {
                    $advanceAdjusted = 10000.00;
                }
                if ($mYear === '2026-09' && $staffId === 11) {
                    $advanceAdjusted = 6000.00;
                }

                $grossPayable = $baseSalary - $leaveDeduction;
                $netPaid = $grossPayable - $advanceAdjusted;

                $paymentDate = "{$mYear}-28";
                $voucherNo = sprintf('SAL-%s-%04d', str_replace('-', '', $mYear), $staffId);

                $settlementId = DB::table('staff_salary_settlements')->insertGetId([
                    'staff_id' => $staffId,
                    'voucher_no' => $voucherNo,
                    'settlement_type' => 'monthly',
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
                    'payment_method' => $staffId % 3 === 0 ? 'cash' : 'bank_transfer',
                    'reference_no' => 'FT-'.rand(100000, 999999),
                    'payment_date' => $paymentDate,
                    'processed_by' => 1,
                    'notes' => "Monthly salary disbursement for {$mYear}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Record in Staff Ledger (Debit Salary Payment)
                DB::table('staff_ledgers')->insert([
                    'id' => $ledgerId++,
                    'staff_id' => $staffId,
                    'transaction_date' => $paymentDate,
                    'description' => "Monthly Salary for {$mYear} (Voucher #{$voucherNo})",
                    'type' => 'credit',
                    'amount' => $netPaid,
                    'balance' => 0.00,
                    'reference_type' => 'salary_settlement',
                    'reference_id' => $settlementId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
