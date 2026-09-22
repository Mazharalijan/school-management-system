<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'school_class_id',
        'student_id',
        'total_obtained_marks',
        'total_max_marks',
        'percentage',
        'grade',
        'status',
        'position_in_class',
        'teacher_remarks',
    ];

    protected $casts = [
        'total_obtained_marks' => 'decimal:2',
        'total_max_marks'      => 'decimal:2',
        'percentage'           => 'decimal:2',
        'position_in_class'    => 'integer',
    ];

    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}