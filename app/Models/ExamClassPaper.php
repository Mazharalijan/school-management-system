<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamClassPaper extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_schedule_id',
        'school_class_id',
        'subject_id',
        'paper_title',
        'total_marks',
        'duration_minutes',
        'instructions',
        'print_status',
        'total_copies_needed',
        'total_copies_printed',
        'printed_at',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'duration_minutes' => 'integer',
        'total_copies_needed' => 'integer',
        'total_copies_printed' => 'integer',
        'printed_at' => 'datetime',
    ];

    public function examSchedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(ExamPaperSection::class)->orderBy('order');
    }
}
