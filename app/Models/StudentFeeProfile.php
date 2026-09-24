<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentFeeProfile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'school_class_id',
        'session_year',
        'base_monthly_fee',
        'monthly_discount',
        'net_monthly_fee',
        'waive_admission_fee',
        'discount_reason',
        'is_locked',
        'approved_by',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_monthly_fee' => 'decimal:2',
        'monthly_discount' => 'decimal:2',
        'net_monthly_fee' => 'decimal:2',
        'waive_admission_fee' => 'boolean',
        'is_locked' => 'boolean',
    ];

    /* -------------------------------------------------------------------------- */
    /*                                RELATIONSHIPS */
    /* -------------------------------------------------------------------------- */

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(StudentFeeProfileItem::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /* -------------------------------------------------------------------------- */
    /*                                HELPER METHODS */
    /* -------------------------------------------------------------------------- */

    /**
     * Lock the profile against further edits.
     */
    public function lock(): bool
    {
        return $this->update(['is_locked' => true]);
    }

    /**
     * Check if concession/discount exists on this profile.
     */
    public function hasDiscount(): bool
    {
        return $this->monthly_discount > 0 || $this->waive_admission_fee;
    }
}
