<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        if (ExpenseCategory::count() > 0) {
            return;
        }

        $userId = User::first()?->id ?? 1;

        $categories = [
            ['name' => 'Utility Bills (Power, Water, Net)', 'code' => 'EXP-UTIL', 'description' => 'Electricity, natural gas, municipal water supply, and high-speed fiber internet.'],
            ['name' => 'Campus Maintenance & Repairs', 'code' => 'EXP-MAINT', 'description' => 'Building repairs, plumbing, electrical fixtures, whitewashing, and AC servicing.'],
            ['name' => 'Stationery, Books & Printing', 'code' => 'EXP-STAT', 'description' => 'Paper reams, office stationery, exam printing, registers, and certificates.'],
            ['name' => 'Science & IT Lab Supplies', 'code' => 'EXP-LAB', 'description' => 'Chemistry lab chemicals, physics apparatus, computer peripherals, and toner.'],
            ['name' => 'Sports, Gala & Student Events', 'code' => 'EXP-EVENT', 'description' => 'Annual sports day equipment, stage setups, sound systems, trophies, and awards.'],
            ['name' => 'Transport Fuel & Maintenance', 'code' => 'EXP-TRANS', 'description' => 'Diesel/petrol for school vans, generator fuel, oil changes, and tire replacements.'],
            ['name' => 'Janitorial & Campus Hygiene', 'code' => 'EXP-HYG', 'description' => 'Disinfectants, hand wash, cleaning supplies, trash bags, and waste management.'],
            ['name' => 'Security & Surveillance', 'code' => 'EXP-SEC', 'description' => 'CCTV camera maintenance, security guard supplies, biometric scanner repairs.'],
            ['name' => 'Teacher Training & Workshops', 'code' => 'EXP-TRAIN', 'description' => 'Faculty pedagogy training programs, digital curriculum licenses, and seminars.'],
            ['name' => 'Administrative & General Overhead', 'code' => 'EXP-MISC', 'description' => 'Refreshments for meetings, courier, postal charges, and petty cash expenses.'],
        ];

        $categoryMap = [];
        foreach ($categories as $cat) {
            $created = ExpenseCategory::create($cat);
            $categoryMap[$cat['code']] = $created->id;
        }

        $today = Carbon::today();
        $sampleExpenses = [
            // Current Month
            [
                'expense_category_id' => $categoryMap['EXP-UTIL'],
                'title' => 'Monthly Electricity Grid Bill (PESCO)',
                'amount' => 92500.00,
                'expense_date' => $today->copy()->subDays(2)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'reference_no' => 'BILL-OCT-99821',
                'paid_to' => 'Peshawar Electric Supply Co.',
                'notes' => 'Main academic block and computer lab submeter consumption.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-TRANS'],
                'title' => 'Backup Generator Diesel Refueling (120 Liters)',
                'amount' => 38400.00,
                'expense_date' => $today->copy()->subDays(5)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'INV-DIESEL-412',
                'paid_to' => 'PSO Mall Road Filling Station',
                'notes' => 'Loadshedding backup diesel refill.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-STAT'],
                'title' => 'Bulk A4 Printing Paper Reams (30 Boxes)',
                'amount' => 24500.00,
                'expense_date' => $today->copy()->subDays(8)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'REC-PAPER-881',
                'paid_to' => 'Al-Madina Paper Mart',
                'notes' => 'Midterm exam question papers and syllabus printing.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-MAINT'],
                'title' => 'Primary Block Washroom Plumbing Overhaul & Taps',
                'amount' => 17800.00,
                'expense_date' => $today->copy()->subDays(12)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'PLUMB-7721',
                'paid_to' => 'Rehman Sanitary Store',
                'notes' => 'Water mixer taps and valve replacements.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-LAB'],
                'title' => 'Science Lab Glassware & Chemical Reagents',
                'amount' => 31200.00,
                'expense_date' => $today->copy()->subDays(15)->format('Y-m-d'),
                'payment_method' => 'cheque',
                'reference_no' => 'CHQ-552910',
                'paid_to' => 'Khyber Scientific Instruments Ltd',
                'notes' => 'Grade 9 & 10 physics and chemistry practical kits.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-HYG'],
                'title' => 'Monthly School Disinfectants & Cleaning Consumables',
                'amount' => 14600.00,
                'expense_date' => $today->copy()->subDays(18)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'JAN-1092',
                'paid_to' => 'CleanPro Supplies',
                'notes' => 'Floor cleaners, hand sanitizers, and waste bins.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-EVENT'],
                'title' => 'Badminton & Football Tournament Gear Replacements',
                'amount' => 26000.00,
                'expense_date' => $today->copy()->subDays(22)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'SPT-881',
                'paid_to' => 'Winner Sports Peshawar',
                'notes' => 'Inter-class tournament shuttlecocks, nets, and footballs.',
            ],

            // Previous Month (September)
            [
                'expense_category_id' => $categoryMap['EXP-UTIL'],
                'title' => 'Electricity Grid Bill (September)',
                'amount' => 88000.00,
                'expense_date' => $today->copy()->subMonth()->setDay(10)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'reference_no' => 'BILL-SEP-4491',
                'paid_to' => 'Peshawar Electric Supply Co.',
                'notes' => 'Paid via online banking portal.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-UTIL'],
                'title' => 'High-Speed Fiber Internet Bill',
                'amount' => 12500.00,
                'expense_date' => $today->copy()->subMonth()->setDay(12)->format('Y-m-d'),
                'payment_method' => 'online',
                'reference_no' => 'PTCL-90812',
                'paid_to' => 'PTCL Optical Fiber',
                'notes' => '100 Mbps dedicated enterprise connection.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-MAINT'],
                'title' => 'Computer Lab Air Conditioner Servicing (4 Units)',
                'amount' => 16000.00,
                'expense_date' => $today->copy()->subMonth()->setDay(18)->format('Y-m-d'),
                'payment_method' => 'cash',
                'reference_no' => 'AC-SERV-190',
                'paid_to' => 'CoolTech Engineering',
                'notes' => 'Gas top-up and filter servicing before examinations.',
            ],
            [
                'expense_category_id' => $categoryMap['EXP-TRANS'],
                'title' => 'School Van 3 Engine Tuning & Brake Pad Replacement',
                'amount' => 28500.00,
                'expense_date' => $today->copy()->subMonth()->setDay(25)->format('Y-m-d'),
                'payment_method' => 'cheque',
                'reference_no' => 'CHQ-99120',
                'paid_to' => 'Toyota Peshawar Motors',
                'notes' => 'Scheduled safety check and preventative maintenance.',
            ],
        ];

        foreach ($sampleExpenses as $exp) {
            Expense::create(array_merge($exp, [
                'created_by' => $userId,
                'status' => 'paid',
            ]));
        }
    }
}
