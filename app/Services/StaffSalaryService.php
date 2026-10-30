<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffLedger;
use App\Models\StaffSalaryAdvance;
use App\Models\StaffSalarySettlement;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StaffSalaryService
{
    public function issueAdvance(array $data, int $userId): StaffSalaryAdvance
    {
        return DB::transaction(function () use ($data, $userId) {
            $advance = StaffSalaryAdvance::create([
                'staff_id' => $data['staff_id'],
                'amount' => $data['amount'],
                'adjusted_amount' => 0.00,
                'issued_date' => $data['issued_date'],
                'reason' => $data['reason'] ?? 'Advance against salary',
                'issued_by' => $userId,
                'status' => 'pending_adjustment',
            ]);

            $lastBalance = (float) (StaffLedger::where('staff_id', $data['staff_id'])->latest('id')->value('balance') ?? 0);

            StaffLedger::create([
                'staff_id' => $data['staff_id'],
                'transaction_date' => $data['issued_date'],
                'description' => 'Advance Salary Issued'.(! empty($data['reason']) ? " ({$data['reason']})" : ''),
                'type' => 'debit',
                'amount' => $data['amount'],
                'balance' => $lastBalance - (float) $data['amount'],
                'reference_type' => StaffSalaryAdvance::class,
                'reference_id' => $advance->id,
            ]);

            return $advance;
        });
    }

    public function processSettlement(array $data, int $userId): StaffSalarySettlement
    {
        return DB::transaction(function () use ($data, $userId) {
            $staff = Staff::findOrFail($data['staff_id']);
            $baseSalary = (float) ($staff->salary ?? 0);

            $date = Carbon::parse($data['payment_date']);
            $daysInMonth = $date->daysInMonth;

            $workedDays = ($data['settlement_type'] === 'resignation_prorated') ? $date->day : $daysInMonth;

            $dailyRate = $daysInMonth > 0 ? ($baseSalary / $daysInMonth) : 0;
            $grossPayable = round($dailyRate * $workedDays, 2);

            $leaveCutoffAmount = 0.0;
            if (! empty($data['apply_leave_cutoff']) && ! empty($data['unpaid_leaves'])) {
                $leaveCutoffAmount = round($dailyRate * (int) $data['unpaid_leaves'], 2);
                $grossPayable = max(0.0, $grossPayable - $leaveCutoffAmount);
            }

            // Retrieve all pending and partially adjusted advances in FIFO order
            $pendingAdvances = StaffSalaryAdvance::where('staff_id', $staff->id)
                ->whereIn('status', ['pending_adjustment', 'partially_adjusted'])
                ->orderBy('issued_date', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            $totalPendingAdvanceDebt = (float) $pendingAdvances->sum(fn ($adv) => max(0.0, (float) $adv->amount - (float) ($adv->adjusted_amount ?? 0)));

            // Calculate advance to adjust (either full, custom partial, or none)
            $requestedAdjustment = array_key_exists('advance_adjusted', $data) && $data['advance_adjusted'] !== null
                ? (float) $data['advance_adjusted']
                : $totalPendingAdvanceDebt;

            $advanceToAdjust = min($requestedAdjustment, $totalPendingAdvanceDebt);
            $advanceToAdjust = min($advanceToAdjust, $grossPayable);
            $advanceToAdjust = round(max(0.0, $advanceToAdjust), 2);

            $netPaid = round(max(0.0, $grossPayable - $advanceToAdjust), 2);

            $voucherNo = 'SAL-'.date('Ym').'-'.str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT);

            $settlement = StaffSalarySettlement::create([
                'staff_id' => $staff->id,
                'voucher_no' => $voucherNo,
                'settlement_type' => $data['settlement_type'],
                'month_year' => $data['month_year'],
                'base_salary' => $baseSalary,
                'worked_days' => $workedDays,
                'total_days_in_month' => $daysInMonth,
                'unpaid_leaves' => $data['unpaid_leaves'] ?? 0,
                'apply_leave_cutoff' => ! empty($data['apply_leave_cutoff']),
                'leave_cutoff_amount' => $leaveCutoffAmount,
                'advance_adjusted' => $advanceToAdjust,
                'gross_payable' => $grossPayable,
                'net_paid' => $netPaid,
                'payment_method' => $data['payment_method'],
                'reference_no' => $data['reference_no'] ?? null,
                'payment_date' => $data['payment_date'],
                'processed_by' => $userId,
                'notes' => $data['notes'] ?? null,
            ]);

            // Allocate deduction across pending advances (FIFO)
            $remainingToDeduct = $advanceToAdjust;
            foreach ($pendingAdvances as $advance) {
                if ($remainingToDeduct <= 0) {
                    break;
                }
                $currentAdjusted = (float) ($advance->adjusted_amount ?? 0);
                $advanceBalance = max(0.0, (float) $advance->amount - $currentAdjusted);
                if ($advanceBalance <= 0) {
                    continue;
                }

                $deductThis = min($remainingToDeduct, $advanceBalance);
                $newAdjusted = round($currentAdjusted + $deductThis, 2);
                $newStatus = ($newAdjusted >= (float) $advance->amount) ? 'adjusted' : 'partially_adjusted';

                $advance->update([
                    'adjusted_amount' => $newAdjusted,
                    'status' => $newStatus,
                ]);

                $remainingToDeduct = round($remainingToDeduct - $deductThis, 2);
            }

            // Ledger records
            $lastBalance = (float) (StaffLedger::where('staff_id', $staff->id)->latest('id')->value('balance') ?? 0);

            // 1. Credit earned gross salary
            $earnedBalance = $lastBalance + $grossPayable;
            StaffLedger::create([
                'staff_id' => $staff->id,
                'transaction_date' => $data['payment_date'],
                'description' => $data['settlement_type'] === 'resignation_prorated'
                    ? "Resignation Prorated Salary ({$workedDays}/{$daysInMonth} Days)"
                    : "Monthly Salary ({$data['month_year']})",
                'type' => 'credit',
                'amount' => $grossPayable,
                'balance' => $earnedBalance,
                'reference_type' => StaffSalarySettlement::class,
                'reference_id' => $settlement->id,
            ]);

            // 2. Debit disbursed net salary
            $finalBalance = $earnedBalance - $netPaid;
            StaffLedger::create([
                'staff_id' => $staff->id,
                'transaction_date' => $data['payment_date'],
                'description' => "Salary Disbursed ({$data['payment_method']}) - Voucher: {$voucherNo}".($advanceToAdjust > 0 ? ' (Advance Adjusted: PKR '.number_format($advanceToAdjust, 2).')' : ''),
                'type' => 'debit',
                'amount' => $netPaid,
                'balance' => $finalBalance,
                'reference_type' => StaffSalarySettlement::class,
                'reference_id' => $settlement->id,
            ]);

            if ($data['settlement_type'] === 'resignation_prorated') {
                $staff->update(['status' => 'resigned']);
            }

            return $settlement;
        });
    }
}
