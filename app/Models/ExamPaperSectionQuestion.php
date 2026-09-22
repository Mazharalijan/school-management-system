<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamPaperSectionQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_paper_section_id',
        'question_bank_id',
        'marks',
        'order',
    ];

    protected $casts = [
        'marks' => 'decimal:2',
        'order' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(ExamPaperSection::class, 'exam_paper_section_id');
    }

    public function questionBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class);
    }
}