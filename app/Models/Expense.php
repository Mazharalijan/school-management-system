<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'expense_no',
        'expense_category_id',
        'title',
        'amount',
        'expense_date',
        'payment_method',
        'reference_no',
        'paid_to',
        'notes',
        'created_by',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date:Y-m-d',
    ];

    protected static function booted(): void
    {
        static::creating(function (Expense $expense) {
            if (empty($expense->expense_no)) {
                $yearMonth = now()->format('Ym');
                $latest = static::withTrashed()
                    ->where('expense_no', 'like', "EXP-{$yearMonth}-%")
                    ->orderByDesc('id')
                    ->first();

                $sequence = 1;
                if ($latest && preg_match('/EXP-\d{6}-(\d{4})/', $latest->expense_no, $matches)) {
                    $sequence = ((int) $matches[1]) + 1;
                }

                $expense->expense_no = sprintf('EXP-%s-%04d', $yearMonth, $sequence);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForPeriod(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }
}
