<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_class_id',
        'name',
        'capacity',
        'room_number',
        'is_active',
        'class_teacher_id',
        'is_full_time_teacher_class',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_full_time_teacher_class' => 'boolean',
        'capacity' => 'integer',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'class_teacher_id');
    }

    /**
     * Timetable entries for this Section
     */
    public function timetables(): HasMany
    {
        return $this->hasMany(Timetable::class, 'section_id');
    }
}
