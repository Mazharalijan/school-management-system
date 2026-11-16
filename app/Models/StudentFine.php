<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFine extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_class_id',
        'fine_type',
        'collection_mode',
        'amount',
        'paid_amount',
        'reason',
        'fine_date',
        'status',
        'receipt_no',
        'paid_date',
        'payment_method',
        'fee_invoice_id',
        'waived_reason',
        'imposed_by',
        'collected_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'fine_date' => 'date:Y-m-d',
        'paid_date' => 'date:Y-m-d',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function feeInvoice(): BelongsTo
    {
        return $this->belongsTo(FeeInvoice::class);
    }

    public function imposedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imposed_by');
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }
}
