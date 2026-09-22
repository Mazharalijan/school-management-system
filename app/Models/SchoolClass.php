<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'numeric_value',
        'code',
        'description',
    ];

    public function sections(): HasMany
    {
        return $table = $this->hasMany(Section::class)->orderBy('name');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'school_class_id');
    }
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
    }

    public function questionBanks(): HasMany
    {
        return $this->hasMany(QuestionBank::class);
    }
}