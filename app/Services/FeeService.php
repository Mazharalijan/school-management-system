<?php

namespace App\Services;

use App\Models\FeeHead;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\StudentFeeProfile;
use Exception;
use Illuminate\Support\Facades\DB;

class FeeService
{
    /**
     * 1. Save or Update Class Default Fees
     */
    public function saveClassFeeStructure(int $classId, string $sessionYear, array $fees): void
    {
        DB::transaction(function () use ($classId, $sessionYear, $fees) {
            foreach ($fees as $fee) {
                FeeStructure::updateOrCreate(
                    [
                        'school_class_id' => $classId,
                        'fee_head_id'     => $fee['fee_head_id'],
                        'session_year'   => $sessionYear,
                    ],
                    ['amount' => $fee['amount']]
                );
            }
        });
    }

    /**
     * 2. Save Principal Custom Discount / Personal Fee Profile for a Student
     * Enforces lockdown if any invoice in the session is already paid.
     */
    public function saveStudentFeeProfile(
        int $studentId,
        int $classId,
        string $sessionYear,
        float $baseMonthlyFee,
        float $monthlyDiscount = 0,
        bool $waiveAdmissionFee = false,
        ?string $reason = null,
        ?int $approvedById = null
    ): StudentFeeProfile {
        return DB::transaction(function () use (
            $studentId,
            $classId,
            $sessionYear,
            $baseMonthlyFee,
            $monthlyDiscount,
            $waiveAdmissionFee,
            $reason,
            $approvedById
        ) {
            // Check if any invoice has already been paid or partially paid for this student in this session
            $hasPaidInvoice = FeeInvoice::where('student_id', $studentId)
                ->where('session_year', $sessionYear)
                ->whereIn('status', ['paid', 'partially_paid'])
                ->exists();

            if ($hasPaidInvoice) {
                throw new Exception("Discount cannot be modified after payments have been processed for this session.");
            }

            $netMonthlyFee = max(0, $baseMonthlyFee - $monthlyDiscount);

            return StudentFeeProfile::updateOrCreate(
                [
                    'student_id'   => $studentId,
                    'session_year' => $sessionYear,
                ],
                [
                    'school_class_id'     => $classId,
                    'base_monthly_fee'    => $baseMonthlyFee,
                    'monthly_discount'    => $monthlyDiscount,
                    'net_monthly_fee'      => $netMonthlyFee,
                    'waive_admission_fee'  => $waiveAdmissionFee,
                    'discount_reason'      => $reason,
                    'approved_by'          => $approvedById,
                ]
            );
        });
    }

    /**
     * 3. Generate Monthly Invoices Incorporating Student Discounts & Past Arrears
     */
    public function generateMonthlyInvoices(
        string $sessionYear,
        string $month,
        int $monthOrder,
        string $issueDate,
        string $dueDate,
        ?int $classId = null,
        bool $includeOneTime = false
    ): int {
        // Retrieve active students through current enrollment
        $query = Student::where('status', 'active')
            ->whereHas('current_enrollment', function ($q) use ($classId) {
                if ($classId) {
                    $q->where('school_class_id', $classId);
                }
            });

        $students = $query->with(['current_enrollment'])->get();
        $generatedCount = 0;

        foreach ($students as $student) {
            DB::transaction(function () use (
                $student,
                $sessionYear,
                $month,
                $monthOrder,
                $issueDate,
                $dueDate,
                $includeOneTime,
                &$generatedCount
            ) {
                // Prevent duplicate invoice creation for same month and session
                $exists = FeeInvoice::where('student_id', $student->id)
                    ->where('month', $month)
                    ->where('session_year', $sessionYear)
                    ->exists();

                if ($exists) {
                    return;
                }

                $enrollment = $student->current_enrollment;
                $studentClassId = $enrollment?->school_class_id;

                // Check for Student Personal Profile
                $customProfile = StudentFeeProfile::where('student_id', $student->id)
                    ->where('session_year', $sessionYear)
                    ->first();

                $subtotal = 0;
                $discount = 0;

                if ($customProfile) {
                    $subtotal = $customProfile->base_monthly_fee;
                    $discount = $customProfile->monthly_discount;
                } else {
                    // Fallback to class default fee structures
                    $classDefaults = FeeStructure::where('school_class_id', $studentClassId)
                        ->where('session_year', $sessionYear)
                        ->get();

                    $subtotal = $classDefaults->sum('amount');
                }

                // Add One-Time / Admission Fees if requested and not waived
                $admissionFeeAmount = 0;
                if ($includeOneTime && (!$customProfile || !$customProfile->waive_admission_fee)) {
                    $admissionHead = FeeHead::where('type', 'one_time')
                        ->where('name', 'like', '%admission%')
                        ->first();

                    if ($admissionHead) {
                        $classAdmissionFee = FeeStructure::where('school_class_id', $studentClassId)
                            ->where('fee_head_id', $admissionHead->id)
                            ->where('session_year', $sessionYear)
                            ->value('amount');

                        $admissionFeeAmount = $classAdmissionFee ?: 1000.00;
                    }
                }

                $netMonthly = max(0, $subtotal - $discount) + $admissionFeeAmount;

                // Calculate cumulative unpaid balance from past months (Arrears)
                $previousArrears = FeeInvoice::where('student_id', $student->id)
                    ->where('due_amount', '>', 0)
                    ->sum('due_amount');

                $totalAmount = $netMonthly + $previousArrears;

                $invoice = FeeInvoice::create([
                    'invoice_number'   => 'INV-' . date('Ym') . '-' . str_pad($student->id, 4, '0', STR_PAD_LEFT) . '-' . rand(10, 99),
                    'student_id'       => $student->id,
                    'school_class_id'  => $studentClassId,
                    'section_id'       => $enrollment?->section_id,
                    'month'            => $month,
                    'month_order'      => $monthOrder,
                    'session_year'     => $sessionYear,
                    'issue_date'       => $issueDate,
                    'due_date'         => $dueDate,
                    'subtotal'         => $subtotal + $admissionFeeAmount,
                    'discount'         => $discount,
                    'previous_arrears' => $previousArrears,
                    'fine'             => 0.00,
                    'total_amount'     => $totalAmount,
                    'paid_amount'      => 0.00,
                    'due_amount'       => $totalAmount,
                    'status'           => 'unpaid',
                ]);

                $generatedCount++;
            });
        }

        return $generatedCount;
    }

    /**
     * 4. Process Payment, Lock Fee Profile & Apply FIFO Distribution
     */
    public function processPayment(array $data, int $collectorId): FeePayment
    {
        return DB::transaction(function () use ($data, $collectorId) {
            $payment = FeePayment::create([
                'receipt_no'            => 'REC-' . date('Ym') . '-' . rand(1000, 9999),
                'student_id'            => $data['student_id'],
                'received_by'           => $collectorId,
                'amount_paid'           => $data['amount_paid'],
                'payment_date'          => $data['payment_date'],
                'payment_method'        => $data['payment_method'],
                'transaction_reference' => $data['transaction_reference'] ?? null,
                'note'                  => $data['note'] ?? null,
            ]);

            $remainingCash = (float) $data['amount_paid'];

            // Fetch unpaid or partially paid invoices sequentially (FIFO)
            $unpaidInvoices = FeeInvoice::where('student_id', $data['student_id'])
                ->where('due_amount', '>', 0)
                ->orderBy('session_year', 'asc')
                ->orderBy('month_order', 'asc')
                ->get();

            foreach ($unpaidInvoices as $invoice) {
                if ($remainingCash <= 0) {
                    break;
                }

                $allocation = min($remainingCash, $invoice->due_amount);
                $newPaidAmount = $invoice->paid_amount + $allocation;
                $newDueAmount = $invoice->total_amount - $newPaidAmount;
                $status = $newDueAmount <= 0 ? 'paid' : 'partially_paid';

                $invoice->update([
                    'paid_amount' => $newPaidAmount,
                    'due_amount'  => $newDueAmount,
                    'status'      => $status,
                ]);

                // Lock student fee profile for this session once a payment is recorded
                StudentFeeProfile::where('student_id', $data['student_id'])
                    ->where('session_year', $invoice->session_year)
                    ->update(['is_locked' => true]);

                // Record allocation pivot
                $payment->invoices()->attach($invoice->id, [
                    'amount_allocated' => $allocation,
                ]);

                $remainingCash -= $allocation;
            }

            return $payment;
        });
    }
}