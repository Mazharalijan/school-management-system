<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentAndFeeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Fee Heads (10 Types)
        $heads = [
            ['title' => 'Monthly Tuition Fee', 'type' => 'recurring'],
            ['title' => 'Admission Fee', 'type' => 'one_time'],
            ['title' => 'Exam Fee', 'type' => 'recurring'],
            ['title' => 'Computer Lab Fee', 'type' => 'recurring'],
            ['title' => 'Library Fee', 'type' => 'recurring'],
            ['title' => 'Sports Fund', 'type' => 'recurring'],
            ['title' => 'Transport Fee', 'type' => 'optional'],
            ['title' => 'Science Lab Fee', 'type' => 'recurring'],
            ['title' => 'Security Deposit', 'type' => 'one_time'],
            ['title' => 'Annual Gala Fee', 'type' => 'one_time'],
        ];
        foreach ($heads as $h) {
            DB::table('fee_heads')->insert(array_merge($h, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 2. Class Default Fee Structure
        for ($cId = 1; $cId <= 10; $cId++) {
            DB::table('fee_structures')->insert([
                'school_class_id' => $cId,
                'fee_head_id' => 1, // Monthly Tuition
                'amount' => 4500.00 + ($cId * 200),
                'session_year' => '2026-2027',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Create 10 Students with Enrollments & Profiles
        for ($i = 1; $i <= 10; $i++) {
            $sId = DB::table('students')->insertGetId([
                'admission_number' => 'ADM-2026-00' . $i,
                'roll_number' => 'ROLL-0' . $i,
                'first_name' => 'StudentFirst' . $i,
                'last_name' => 'StudentLast' . $i,
                'gender' => $i % 2 == 0 ? 'female' : 'male',
                'date_of_birth' => '2014-06-15',
                'blood_group' => 'B+',
                'guardian_name' => 'Guardian ' . $i,
                'guardian_relation' => 'Father',
                'guardian_phone' => '0333999010' . $i,
                'guardian_email' => "guardian{$i}@gmail.com",
                'address' => 'Street 4, Sector F-11, Islamabad',
                'admission_date' => '2025-08-01',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $classId = $i; // Distribute across 10 classes
            $sectionId = ($i * 2) - 1;

            DB::table('student_enrollments')->insert([
                'student_id' => $sId,
                'school_class_id' => $classId,
                'section_id' => $sectionId,
                'session_year' => '2026-2027',
                'is_current' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Custom Fee Profile
            $pId = DB::table('student_fee_profiles')->insertGetId([
                'student_id' => $sId,
                'school_class_id' => $classId,
                'session_year' => '2026-2027',
                'discount_reason' => $i % 2 == 0 ? 'Sibling Concession 10%' : null,
                'approved_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('student_fee_profile_items')->insert([
                'student_fee_profile_id' => $pId,
                'fee_head_id' => 1,
                'amount' => $i % 2 == 0 ? 4000.00 : 4500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. 10 Months Fee Invoices & Payment Scenarios for ALL Students
        $months = [
            1 => 'November', 2 => 'December', 3 => 'January', 4 => 'February', 5 => 'March',
            6 => 'April', 7 => 'May', 8 => 'June', 9 => 'July', 10 => 'August'
        ];

        foreach (range(1, 10) as $sId) {
            $arrears = 0.00;

            foreach ($months as $order => $mName) {
                $subtotal = 5000.00;
                $discount = ($sId % 2 == 0) ? 500.00 : 0.00;
                $fine = ($order == 5 && $sId == 3) ? 200.00 : 0.00; // Overdue fine case
                $totalAmount = ($subtotal + $arrears + $fine) - $discount;

                // Alternate fee payment cases
                if ($order <= 7) { 
                    // FULLY PAID
                    $status = 'paid';
                    $paidAmount = $totalAmount;
                    $dueAmount = 0.00;
                } elseif ($order == 8) { 
                    // PARTIALLY PAID
                    $status = 'partially_paid';
                    $paidAmount = 2000.00;
                    $dueAmount = $totalAmount - $paidAmount;
                } elseif ($order == 9) { 
                    // OVERDUE
                    $status = 'overdue';
                    $paidAmount = 0.00;
                    $dueAmount = $totalAmount;
                } else { 
                    // UNPAID
                    $status = 'unpaid';
                    $paidAmount = 0.00;
                    $dueAmount = $totalAmount;
                }

                $invoiceId = DB::table('fee_invoices')->insertGetId([
                    'invoice_no' => "INV-2026" . sprintf('%02d', $order) . "-00" . $sId,
                    'student_id' => $sId,
                    'school_class_id' => $sId,
                    'section_id' => ($sId * 2) - 1,
                    'month' => $mName,
                    'month_order' => $order,
                    'session_year' => '2026-2027',
                    'issue_date' => "2026-0" . min($order, 9) . "-01",
                    'due_date' => "2026-0" . min($order, 9) . "-10",
                    'subtotal' => $subtotal,
                    'previous_arrears' => $arrears,
                    'discount' => $discount,
                    'fine' => $fine,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'status' => $status,
                    'remarks' => "Monthly fee voucher for {$mName}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Line Items
                DB::table('fee_invoice_items')->insert([
                    'fee_invoice_id' => $invoiceId,
                    'fee_head_id' => 1,
                    'title' => 'Monthly Tuition Fee',
                    'amount' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Generate Receipt if payment was made
                if ($paidAmount > 0) {
                    $paymentId = DB::table('fee_payments')->insertGetId([
                        'receipt_no' => "REC-2026" . sprintf('%02d', $order) . "-00" . $sId,
                        'student_id' => $sId,
                        'received_by' => 1,
                        'amount_paid' => $paidAmount,
                        'payment_date' => "2026-0" . min($order, 9) . "-05",
                        'payment_method' => $sId % 2 == 0 ? 'online' : 'cash',
                        'transaction_reference' => 'TXN-' . rand(10000, 99999),
                        'note' => 'Paid via counter/portal',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('fee_invoice_payment')->insert([
                        'fee_invoice_id' => $invoiceId,
                        'fee_payment_id' => $paymentId,
                        'amount_allocated' => $paidAmount,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Carry forward unpaid amounts as arrears for the next month
                $arrears = $dueAmount;
            }
        }
    }
}