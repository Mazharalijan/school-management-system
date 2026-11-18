<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('expenses')->truncate();
        Schema::enableForeignKeyConstraints();

        // ---------------------------------------------------------------------
        // 1. All 10 Standard School Expense Categories
        // ---------------------------------------------------------------------
        $categories = [
            ['id' => 1, 'name' => 'Utility Bills (Power, Water, Net)', 'code' => 'EXP-UTIL', 'description' => 'Electricity, natural gas, municipal water supply, and high-speed fiber internet.'],
            ['id' => 2, 'name' => 'Campus Maintenance & Repairs', 'code' => 'EXP-MAINT', 'description' => 'Building repairs, plumbing, electrical fixtures, whitewashing, and AC servicing.'],
            ['id' => 3, 'name' => 'Stationery, Books & Printing', 'code' => 'EXP-STAT', 'description' => 'Paper reams, office stationery, exam printing, registers, and certificates.'],
            ['id' => 4, 'name' => 'Science & IT Lab Supplies', 'code' => 'EXP-LAB', 'description' => 'Chemistry lab chemicals, physics apparatus, computer peripherals, and toner.'],
            ['id' => 5, 'name' => 'Sports, Gala & Student Events', 'code' => 'EXP-EVENT', 'description' => 'Annual sports day equipment, stage setups, sound systems, trophies, and awards.'],
            ['id' => 6, 'name' => 'Transport Fuel & Maintenance', 'code' => 'EXP-TRANS', 'description' => 'Diesel/petrol for school vans, generator fuel, oil changes, and tire replacements.'],
            ['id' => 7, 'name' => 'Janitorial & Campus Hygiene', 'code' => 'EXP-HYG', 'description' => 'Disinfectants, hand wash, cleaning supplies, trash bags, and waste management.'],
            ['id' => 8, 'name' => 'Security & Surveillance', 'code' => 'EXP-SEC', 'description' => 'CCTV camera maintenance, security guard supplies, biometric scanner repairs.'],
            ['id' => 9, 'name' => 'Teacher Training & Workshops', 'code' => 'EXP-TRAIN', 'description' => 'Faculty pedagogy training programs, digital curriculum licenses, and seminars.'],
            ['id' => 10, 'name' => 'Administrative & General Overhead', 'code' => 'EXP-MISC', 'description' => 'Refreshments for meetings, courier, postal charges, and petty cash expenses.'],
        ];

        foreach ($categories as $cat) {
            DB::table('expense_categories')->updateOrInsert(
                ['id' => $cat['id']],
                array_merge($cat, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ---------------------------------------------------------------------
        // 2. 2 Full Years of Monthly Expenses (Nov 2024 to Nov 2026)
        // ---------------------------------------------------------------------
        $months = [];
        $start = Carbon::parse('2024-11-01');
        $end = Carbon::parse('2026-11-01');

        while ($start <= $end) {
            $months[] = $start->copy();
            $start->addMonth();
        }

        $expenseId = 1;

        // Templates of recurring monthly items and occasional seasonal items
        foreach ($months as $mDate) {
            $yearMonth = $mDate->format('Ym');
            $monthStr = $mDate->format('F Y');
            $mNum = (int) $mDate->format('n');
            $yearStr = $mDate->format('Y');

            $monthExpenses = [
                // 1. Electricity Bill (Seasonal variation: higher in summer months May-Sep)
                [
                    'cat_id' => 1,
                    'title' => "Monthly Electricity Grid Bill (PESCO) - {$monthStr}",
                    'amount' => in_array($mNum, [5, 6, 7, 8, 9]) ? 88500.00 : 52000.00,
                    'day' => 10,
                    'method' => 'bank_transfer',
                    'ref' => "PESCO-{$yearMonth}-".rand(1000, 9999),
                    'paid_to' => 'Peshawar Electric Supply Co. (PESCO)',
                    'notes' => "Main academic complex and lab grid electricity consumption charges for {$monthStr}.",
                ],
                // 2. High-Speed Internet
                [
                    'cat_id' => 1,
                    'title' => "Dedicated Fiber Optic Internet 100Mbps - {$monthStr}",
                    'amount' => 12500.00,
                    'day' => 12,
                    'method' => 'online',
                    'ref' => "PTCL-FIB-{$yearMonth}",
                    'paid_to' => 'PTCL Optical Fiber Corporate Division',
                    'notes' => 'Campus high-speed internet and administrative portal bandwidth.',
                ],
                // 3. Van & Generator Fuel
                [
                    'cat_id' => 6,
                    'title' => "School Transport Fleet & Backup Generator Diesel - {$monthStr}",
                    'amount' => in_array($mNum, [6, 7]) ? 18000.00 : 36500.00, // Less in summer vacation
                    'day' => 15,
                    'method' => 'cash',
                    'ref' => "PSO-DSL-{$yearMonth}",
                    'paid_to' => 'PSO Mall Road Filling Station Peshawar',
                    'notes' => 'Diesel fuel refill for 2 school transport vans and 35kVA backup generator.',
                ],
                // 4. Janitorial & Campus Hygiene Consumables
                [
                    'cat_id' => 7,
                    'title' => "Janitorial Sanitation & Disinfectant Supplies - {$monthStr}",
                    'amount' => 14800.00,
                    'day' => 18,
                    'method' => 'cash',
                    'ref' => "HYG-SUP-{$yearMonth}",
                    'paid_to' => 'CleanPro Janitorial Store Peshawar',
                    'notes' => 'Floor phenyl, liquid hand wash, bleach, mop cloths, and garbage bags.',
                ],
                // 5. General Administrative Petty Cash & Refreshments
                [
                    'cat_id' => 10,
                    'title' => "Staff Tea, Meeting Refreshments & Petty Cash - {$monthStr}",
                    'amount' => 8500.00,
                    'day' => 20,
                    'method' => 'cash',
                    'ref' => "PETTY-{$yearMonth}",
                    'paid_to' => 'Principal Office Staff Kitty',
                    'notes' => 'Monthly tea, coffee, milk, guest biscuits, and minor courier dispatches.',
                ],
            ];

            // Add Category-specific occasional / seasonal expenses
            if ($mNum === 3 || $mNum === 9) {
                // Exam Stationery / Paper Reams
                $monthExpenses[] = [
                    'cat_id' => 3,
                    'title' => "Bulk A4 Printing Paper Reams (35 Boxes) - {$monthStr}",
                    'amount' => 28000.00,
                    'day' => 5,
                    'method' => 'cheque',
                    'ref' => "CHQ-PAP-{$yearMonth}",
                    'paid_to' => 'Al-Madina Paper Mart Saddar',
                    'notes' => 'High quality 80gsm A4 reams for term exam papers and administrative circulars.',
                ];
            }

            if ($mNum === 4 || $mNum === 10) {
                // Campus Maintenance & Repairs
                $monthExpenses[] = [
                    'cat_id' => 2,
                    'title' => "Washrooms Plumbing Overhaul & Electric Fixtures Repair - {$monthStr}",
                    'amount' => 19500.00,
                    'day' => 22,
                    'method' => 'cash',
                    'ref' => "MAINT-{$yearMonth}",
                    'paid_to' => 'Rehman Sanitary & Hardware Store',
                    'notes' => 'Water taps replacement, classroom fluorescent tube lights, and switch repairs.',
                ];
            }

            if ($mNum === 5 || $mNum === 11) {
                // Science & IT Lab Consumables
                $monthExpenses[] = [
                    'cat_id' => 4,
                    'title' => "Science Practical Kits & Computer Lab Peripherals - {$monthStr}",
                    'amount' => 26400.00,
                    'day' => 25,
                    'method' => 'cheque',
                    'ref' => "LAB-EQP-{$yearMonth}",
                    'paid_to' => 'Khyber Scientific & Technology Solutions',
                    'notes' => 'Biology specimen jars, primary test tube racks, and replacement keyboards.',
                ];
            }

            if ($mNum === 2 || $mNum === 12) {
                // Sports Day / Annual Gala / Co-Curricular
                $monthExpenses[] = [
                    'cat_id' => 5,
                    'title' => "Annual Sports Day Equipment, Trophies & Sound System - {$monthStr}",
                    'amount' => 42000.00,
                    'day' => 26,
                    'method' => 'bank_transfer',
                    'ref' => "EVT-SPT-{$yearMonth}",
                    'paid_to' => 'Champion Sports & Event Decor Peshawar',
                    'notes' => 'Track event markings, footballs, badminton sets, brass medals, and sound rental.',
                ];
            }

            if ($mNum === 1 || $mNum === 8) {
                // Security & Surveillance or Teacher Training
                $monthExpenses[] = [
                    'cat_id' => 8,
                    'title' => "CCTV Cameras Bi-Annual Servicing & Biometric Scanner Calibration - {$monthStr}",
                    'amount' => 16500.00,
                    'day' => 28,
                    'method' => 'cash',
                    'ref' => "SEC-SRV-{$yearMonth}",
                    'paid_to' => 'SafeZone Security & Automation',
                    'notes' => 'Firmware upgrade, outdoor bullet camera lens cleaning, and biometric sync.',
                ];

                $monthExpenses[] = [
                    'cat_id' => 9,
                    'title' => "Teacher Professional Development Workshop & Training Kits - {$monthStr}",
                    'amount' => 25000.00,
                    'day' => 14,
                    'method' => 'cheque',
                    'ref' => "TRAIN-{$yearMonth}",
                    'paid_to' => 'Academy for Educational Excellence & Pedagogy',
                    'notes' => 'Early childhood education and modern student engagement pedagogy workshop.',
                ];
            }

            // Insert expenses for this month with unique expense_no
            $monthSeq = 1;
            foreach ($monthExpenses as $exp) {
                $expenseDate = sprintf('%04d-%02d-%02d', (int) $mDate->format('Y'), (int) $mDate->format('m'), $exp['day']);
                $expenseNo = sprintf('EXP-%s-%04d', $yearMonth, $monthSeq++);

                DB::table('expenses')->insert([
                    'id' => $expenseId++,
                    'expense_no' => $expenseNo,
                    'expense_category_id' => $exp['cat_id'],
                    'title' => $exp['title'],
                    'amount' => $exp['amount'],
                    'expense_date' => $expenseDate,
                    'payment_method' => $exp['method'],
                    'reference_no' => $exp['ref'],
                    'paid_to' => $exp['paid_to'],
                    'notes' => $exp['notes'],
                    'status' => 'paid',
                    'created_by' => 1,
                    'created_at' => Carbon::parse($expenseDate),
                    'updated_at' => Carbon::parse($expenseDate),
                ]);
            }
        }
    }
}
