<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'school_class_id',
        'subject_id',
        'exam_date',
        'start_time',
        'end_time',
        'total_marks',
        'passing_marks',
    ];

    protected $casts = [
        'exam_date'     => 'date',
        'total_marks'   => 'decimal:2',
        'passing_marks' => 'decimal:2',
    ];

    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classPapers(): HasMany
    {
        return $this->hasMany(ExamClassPaper::class);
    }
}