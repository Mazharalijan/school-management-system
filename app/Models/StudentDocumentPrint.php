<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentDocumentPrint extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'document_type',
        'sub_type',
        'document_number',
        'title',
        'exam_session_id',
        'exam_result_id',
        'issue_date',
        'metadata',
        'print_count',
        'last_printed_at',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date:Y-m-d',
        'metadata' => 'array',
        'print_count' => 'integer',
        'last_printed_at' => 'datetime',
    ];

    protected $appends = ['copy_label'];

    public static function getCopyLabelForNumber(int $number): string
    {
        return match ($number) {
            1 => 'ORIGINAL',
            2 => 'DUPLICATE (Copy #2)',
            3 => 'TRIPLICATE (Copy #3)',
            default => "COPY #{$number}",
        };
    }

    public function getCopyLabelAttribute(): string
    {
        return self::getCopyLabelForNumber((int) ($this->print_count ?: 1));
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function examResult(): BelongsTo
    {
        return $this->belongsTo(ExamResult::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function printLogs(): HasMany
    {
        return $this->hasMany(DocumentPrintLog::class)->orderByDesc('id');
    }

    /**
     * Record a new print event and increment the print count.
     */
    public function recordPrint(string $printerType = 'standard', ?int $userId = null, ?string $notes = null, bool $increment = true): DocumentPrintLog
    {
        if ($increment && $this->printLogs()->exists()) {
            $this->increment('print_count');
        }

        $this->update(['last_printed_at' => now()]);

        return $this->printLogs()->create([
            'print_number' => $this->print_count,
            'printer_type' => $printerType,
            'copy_label' => self::getCopyLabelForNumber((int) $this->print_count),
            'printed_by' => $userId,
            'printed_at' => now(),
            'notes' => $notes,
        ]);
    }
}
