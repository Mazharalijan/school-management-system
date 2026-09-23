<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Subjects (Independent of Class)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('subject_name');
            $table->timestamps();
        });

        // 2. Chapters (Tied to Class and Subject)
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('chapter_name');
            $table->timestamps();
        });

        // 3. Topics (Linked only to Chapter)
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->cascadeOnDelete();
            $table->string('topic_name');
            $table->timestamps();
        });

        // 4. Question Bank
        Schema::create('question_banks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('chapter_id')->nullable()->constrained('chapters')->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            
            $table->enum('question_type', ['mcq', 'short', 'long', 'letter', 'essay'])->default('mcq');
            $table->text('question');
            $table->decimal('default_marks', 5, 2)->default(1.00);
            $table->timestamps();
        });

        // ==========================================
        // EXAMS & PAPER MANAGEMENT SECTION
        // ==========================================

        // 5. Exam Sessions (e.g., Midterm 2026, Annual 2026)
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g., "Annual Examination 2026"
            $table->string('session_year'); // e.g., "2025-2026"
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['draft', 'published', 'completed'])->default('draft');
            $table->timestamps();
        });

        // 6. Exam Schedules / Date Sheets (Class & Subject wise paper schedule)
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->date('exam_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('total_marks', 6, 2)->default(100.00);
            $table->decimal('passing_marks', 6, 2)->default(33.00);
            $table->timestamps();
        });

        // 7. Exam Class Papers (Assembled Question Papers)
        Schema::create('exam_class_papers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_schedule_id')->nullable()->constrained('exam_schedules')->nullOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->string('paper_title');
            $table->decimal('total_marks', 6, 2);
            $table->unsignedInteger('duration_minutes');
            $table->text('instructions')->nullable();
            
            // Print & Distribution Management
            $table->enum('print_status', ['pending', 'queued', 'printed'])->default('pending');
            $table->unsignedInteger('total_copies_needed')->default(0);
            $table->unsignedInteger('total_copies_printed')->default(0);
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
        });

        // 8. Exam Paper Sections
        Schema::create('exam_paper_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_class_paper_id')->constrained('exam_class_papers')->cascadeOnDelete();
            $table->enum('section_name', ['A', 'B', 'C', 'D'])->default('A');
            $table->string('title');
            $table->decimal('total_marks', 6, 2);
            $table->unsignedInteger('total_questions');
            $table->enum('question_type', ['mcq', 'short', 'long', 'letter', 'essay'])->default('mcq');
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();
        });

        // 9. Exam Paper Section Questions
        Schema::create('exam_paper_section_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_paper_section_id')->constrained('exam_paper_sections')->cascadeOnDelete();
            $table->foreignId('question_bank_id')->constrained('question_banks')->cascadeOnDelete();
            $table->decimal('marks', 5, 2);
            $table->unsignedInteger('order')->default(1);
            $table->timestamps();
        });

        // ==========================================
        // MARKS, RESULTS & DMC SECTION
        // ==========================================

        // 10. Student Subject Marks Entry
        Schema::create('student_marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            
            $table->decimal('obtained_marks', 6, 2)->default(0.00);
            $table->decimal('total_marks', 6, 2)->default(100.00);
            $table->boolean('is_absent')->default(false);
            $table->string('remarks')->nullable();
            
            $table->unique(['exam_session_id', 'student_id', 'subject_id'], 'unique_student_subject_mark');
            $table->timestamps();
        });

        // 11. Final Calculated Results & DMCs
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            
            $table->decimal('total_obtained_marks', 7, 2);
            $table->decimal('total_max_marks', 7, 2);
            $table->decimal('percentage', 5, 2);
            $table->string('grade', 5)->nullable();
            $table->enum('status', ['pass', 'fail', 'promoted', 'withheld'])->default('pass');
            $table->unsignedInteger('position_in_class')->nullable();
            $table->text('teacher_remarks')->nullable();
            
            $table->unique(['exam_session_id', 'student_id'], 'unique_student_exam_result');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('student_marks');
        Schema::dropIfExists('exam_paper_section_questions');
        Schema::dropIfExists('exam_paper_sections');
        Schema::dropIfExists('exam_class_papers');
        Schema::dropIfExists('exam_schedules');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('question_banks');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('subjects');
    }
};