<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionBank extends Model
{
    protected $fillable = [
        'school_class_id',
        'subject_id',
        'chapter_id',
        'topic_id',
        'question_type',
        'question',
        'default_marks',
    ];

    protected $casts = [
        'default_marks' => 'float',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function sectionQuestions(): HasMany
    {
        return $this->hasMany(ExamPaperSectionQuestion::class);
    }
}
