<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentPrintLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_document_print_id',
        'print_number',
        'printer_type',
        'copy_label',
        'printed_by',
        'printed_at',
        'notes',
    ];

    protected $casts = [
        'print_number' => 'integer',
        'printed_at' => 'datetime',
    ];

    public function documentPrint(): BelongsTo
    {
        return $this->belongsTo(StudentDocumentPrint::class, 'student_document_print_id');
    }

    public function printedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }
}
