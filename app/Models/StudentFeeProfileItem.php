<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentFeeProfileItem extends Model
{
    protected $fillable = ['student_fee_profile_id', 'fee_head_id', 'amount'];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(StudentFeeProfile::class, 'student_fee_profile_id');
    }

    public function feeHead(): BelongsTo
    {
        return $this->belongsTo(FeeHead::class);
    }
}