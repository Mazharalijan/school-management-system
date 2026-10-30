<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffSalaryAdvance extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'amount',
        'adjusted_amount',
        'issued_date',
        'status',
        'reason',
        'issued_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'adjusted_amount' => 'decimal:2',
        'issued_date' => 'date:Y-m-d',
    ];

    protected $appends = ['remaining_amount'];

    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->amount - (float) ($this->adjusted_amount ?? 0));
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
