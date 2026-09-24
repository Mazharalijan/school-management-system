<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'numeric_value',
        'code',
        'description',
        'class_teacher_id',
        'is_full_time_teacher_class',
    ];

    protected $casts = [
        'numeric_value' => 'integer',
        'is_full_time_teacher_class' => 'boolean',
    ];

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'class_teacher_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'school_class_id')->orderBy('name');
    }

    public function subjects(): HasManyThrough
    {
        return $this->hasManyThrough(
            Subject::class,
            Chapter::class,
            'school_class_id',
            'id',
            'id',
            'subject_id'
        )->distinct();
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    public function questionBanks(): HasMany
    {
        return $this->hasMany(QuestionBank::class);
    }

    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class);
    }
}
