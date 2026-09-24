<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeInvoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_no', 'student_id', 'school_class_id', 'section_id',
        'month', 'month_order', 'session_year', 'issue_date', 'due_date',
        'subtotal', 'previous_arrears', 'discount', 'fine',
        'total_amount', 'paid_amount', 'due_amount', 'status', 'remarks',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(FeeInvoiceItem::class);
    }

    public function payments(): BelongsToMany
    {
        return $this->belongsToMany(FeePayment::class, 'fee_invoice_payment')
            ->withPivot('amount_allocated')
            ->withTimestamps();
    }
}
