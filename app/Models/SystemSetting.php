<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_name',
        'school_tagline',
        'logo_path',
        'registration_number',
        'current_session_year',
        'currency_symbol',
        'currency_code',
        'timezone',
        'date_format',
        'phone',
        'alt_phone',
        'email',
        'website',
        'address',
        'invoice_prefix',
        'receipt_footer_note',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }
}
