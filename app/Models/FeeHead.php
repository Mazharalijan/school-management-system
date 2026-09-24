<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeHead extends Model
{
    protected $fillable = ['title', 'type', 'description', 'is_active'];

    public function structures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
