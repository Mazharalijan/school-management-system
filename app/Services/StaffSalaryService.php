<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffSalaryAdvance;
use App\Models\StaffSalarySettlement;
use App\Models\StaffLedger;
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
                'issued_date' => $data['issued_date'],
                'reason' => $data['reason'] ?? 'Advance against salary',
                'issued_by' => $userId,
                'status' => 'pending_adjustment',
            ]);

            $lastBalance = StaffLedger::where('staff_id', $data['staff_id'])->latest('id')->value('balance') ?? 0;
            
            StaffLedger::create([
                'staff_id' => $data['staff_id'],
                'transaction_date' => $data['issued_date'],
                'description' => 'Advance Salary Issued',
                'type' => 'debit',
                'amount' => $data['amount'],
                'balance' => $lastBalance - $data['amount'],
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
            $baseSalary = $staff->base_salary ?? 0;

            $date = Carbon::parse($data['payment_date']);
            $daysInMonth = $date->daysInMonth;
            
            $workedDays = ($data['settlement_type'] === 'resignation_prorated') ? $date->day : $daysInMonth;

            $dailyRate = $daysInMonth > 0 ? ($baseSalary / $daysInMonth) : 0;
            $grossPayable = $dailyRate * $workedDays;

            $leaveCutoffAmount = 0;
            if ($data['apply_leave_cutoff'] && !empty($data['unpaid_leaves'])) {
                $leaveCutoffAmount = $dailyRate * (int)$data['unpaid_leaves'];
                $grossPayable -= $leaveCutoffAmount;
            }

            $pendingAdvances = StaffSalaryAdvance::where('staff_id', $staff->id)
                ->where('status', 'pending_adjustment')
                ->sum('amount');

            $netPaid = max(0, $grossPayable - $pendingAdvances);

            $settlement = StaffSalarySettlement::create([
                'staff_id' => $staff->id,
                'voucher_no' => 'SAL-' . date('Ym') . '-' . rand(100, 999),
                'settlement_type' => $data['settlement_type'],
                'month_year' => $data['month_year'],
                'base_salary' => $baseSalary,
                'worked_days' => $workedDays,
                'total_days_in_month' => $daysInMonth,
                'unpaid_leaves' => $data['unpaid_leaves'] ?? 0,
                'apply_leave_cutoff' => $data['apply_leave_cutoff'],
                'leave_cutoff_amount' => $leaveCutoffAmount,
                'advance_adjusted' => $pendingAdvances,
                'gross_payable' => $grossPayable,
                'net_paid' => $netPaid,
                'payment_method' => $data['payment_method'],
                'reference_no' => $data['reference_no'] ?? null,
                'payment_date' => $data['payment_date'],
                'processed_by' => $userId,
                'notes' => $data['notes'] ?? null,
            ]);

            StaffSalaryAdvance::where('staff_id', $staff->id)
                ->where('status', 'pending_adjustment')
                ->update(['status' => 'adjusted']);

            $lastBalance = StaffLedger::where('staff_id', $staff->id)->latest('id')->value('balance') ?? 0;
            
            StaffLedger::create([
                'staff_id' => $staff->id,
                'transaction_date' => $data['payment_date'],
                'description' => $data['settlement_type'] === 'resignation_prorated' 
                    ? "Resignation Prorated Settlement ({$workedDays}/{$daysInMonth} Days)" 
                    : "Monthly Salary Settlement ({$data['month_year']})",
                'type' => 'credit',
                'amount' => $netPaid,
                'balance' => $lastBalance + $netPaid,
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