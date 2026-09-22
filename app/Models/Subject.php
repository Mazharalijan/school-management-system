<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['subject_name'];

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    public function questionBanks(): HasMany
    {
        return $this->hasMany(QuestionBank::class);
    }

    public function examSchedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class);
    }

    public function examClassPapers(): HasMany
    {
        return $this->hasMany(ExamClassPaper::class);
    }

    public function studentMarks(): HasMany
    {
        return $this->hasMany(StudentMark::class);
    }

    public function schoolClasses(): HasManyThrough
    {
        return $this->hasManyThrough(
            SchoolClass::class,
            Chapter::class,
            'subject_id',      
            'id',   
            'id',            
            'school_class_id'
        )->distinct();
    }
}