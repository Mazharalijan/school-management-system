<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'staff';

    protected $fillable = [
        'user_id',
        'employee_id',
        'first_name',
        'last_name',
        'father_name',
        'cnic',
        'designation',
        'gender',
        'date_of_birth',
        'joining_date',
        'qualification',
        'skills',
        'phone',
        'email',
        'address',
        'salary',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'joining_date' => 'date:Y-m-d',
        'salary' => 'decimal:2',
        'skills' => 'array',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Optional link to the system authentication account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Classes assigned to this staff member.
     */
    public function assigned_sections(): BelongsToMany
    {
        return $this->belongsToMany(Section::class, 'class_subject_teacher')
                    ->withPivot('school_class_id', 'subject_id')
                    ->withTimestamps();
    }

    public function salaryAdvances()
    {
        return $this->hasMany(StaffSalaryAdvance::class);
    }

    public function salarySettlements()
    {
        return $this->hasMany(StaffSalarySettlement::class);
    }

    public function ledgers()
    {
        return $this->hasMany(StaffLedger::class)->orderBy('id', 'desc');
    }

    public function getPendingAdvancesSumAttribute()
    {
        return $this->salaryAdvances()->where('status', 'pending_adjustment')->sum('amount');
    }
}