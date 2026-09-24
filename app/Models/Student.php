<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'admission_number',
        'roll_number',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'blood_group',
        'guardian_name',
        'guardian_relation',
        'guardian_phone',
        'guardian_email',
        'address',
        'admission_date',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'admission_date' => 'date:Y-m-d',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the current active enrollment for the student.
     */
    public function current_enrollment(): HasOne
    {
        return $this->hasOne(StudentEnrollment::class)->ofMany([
            'id' => 'max',
        ], function ($query) {
            $query->where('student_enrollments.is_current', true);
        });
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(FeeInvoice::class);
    }

    public function feeProfile(): HasOne
    {
        return $this->hasOne(StudentFeeProfile::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }
}
