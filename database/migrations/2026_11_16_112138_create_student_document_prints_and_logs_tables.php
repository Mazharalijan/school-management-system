<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_document_prints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('document_type'); // 'certificate', 'dmc', 'fee_invoice'
            $table->string('sub_type'); // 'character', 'leaving', 'bonafide', 'merit', 'dmc_term'
            $table->string('document_number')->unique()->index(); // e.g. "CERT-2026-0001", "DMC-2026-0001"
            $table->string('title');
            $table->foreignId('exam_session_id')->nullable()->constrained('exam_sessions')->nullOnDelete();
            $table->foreignId('exam_result_id')->nullable()->constrained('exam_results')->nullOnDelete();
            $table->date('issue_date');
            $table->json('metadata')->nullable(); // conduct, reason_for_leaving, remarks, custom_fields
            $table->unsignedInteger('print_count')->default(1);
            $table->timestamp('last_printed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('document_print_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_document_print_id')->constrained('student_document_prints')->cascadeOnDelete();
            $table->unsignedInteger('print_number')->default(1);
            $table->string('printer_type')->default('standard'); // 'standard', 'mini'
            $table->string('copy_label')->default('ORIGINAL'); // 'ORIGINAL', 'DUPLICATE', 'TRIPLICATE'
            $table->foreignId('printed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('printed_at')->useCurrent();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_print_logs');
        Schema::dropIfExists('student_document_prints');
    }
};
