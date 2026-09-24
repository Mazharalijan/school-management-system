<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffSalarySettlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'voucher_no',
        'settlement_type',
        'month_year',
        'base_salary',
        'worked_days',
        'total_days_in_month',
        'unpaid_leaves',
        'apply_leave_cutoff',
        'leave_cutoff_amount',
        'advance_adjusted',
        'gross_payable',
        'net_paid',
        'payment_method',
        'reference_no',
        'payment_date',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'leave_cutoff_amount' => 'decimal:2',
        'advance_adjusted' => 'decimal:2',
        'gross_payable' => 'decimal:2',
        'net_paid' => 'decimal:2',
        'apply_leave_cutoff' => 'boolean',
        'payment_date' => 'date',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
