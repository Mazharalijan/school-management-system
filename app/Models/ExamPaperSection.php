<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPaperSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_class_paper_id',
        'section_name',
        'title',
        'total_marks',
        'total_questions',
        'order',
    ];

    protected $casts = [
        'total_marks'     => 'decimal:2',
        'total_questions' => 'integer',
        'order'           => 'integer',
    ];

    public function examClassPaper(): BelongsTo
    {
        return $this->belongsTo(ExamClassPaper::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamPaperSectionQuestion::class)->orderBy('order');
    }

    /**
     * Alias for questions() to satisfy sectionQuestions relationship calls
     */
    public function sectionQuestions(): HasMany
    {
        return $this->questions();
    }
}