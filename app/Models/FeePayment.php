<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FeePayment extends Model
{
    protected $fillable = [
        'receipt_no', 'student_id', 'received_by', 'amount_paid',
        'payment_date', 'payment_method', 'transaction_reference', 'note'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function invoices(): BelongsToMany
    {
        return $this->belongsToMany(FeeInvoice::class, 'fee_invoice_payment')
                    ->withPivot('amount_allocated')
                    ->withTimestamps();
    }
}