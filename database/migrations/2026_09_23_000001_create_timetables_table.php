<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add full-time teacher configuration flags to classes & sections
        Schema::table('school_classes', function (Blueprint $table) {
            $table->boolean('is_full_time_teacher_class')->default(false)->after('name');
            $table->foreignId('class_teacher_id')->nullable()->after('is_full_time_teacher_class')->constrained('staff')->nullOnDelete();
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->boolean('is_full_time_teacher_class')->default(false)->after('name');
            $table->foreignId('class_teacher_id')->nullable()->after('is_full_time_teacher_class')->constrained('staff')->nullOnDelete();
        });

        // Timetables schema with support for shift timings, breaks, and days
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->nullOnDelete();

            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])->default('monday');
            $table->integer('period_number');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('room_number', 50)->nullable();
            $table->boolean('is_break')->default(false);
            $table->string('break_title')->nullable();
            $table->string('academic_year', 20)->default('2025-2026');

            $table->timestamps();

            // Prevent assigning duplicate periods to the same class section on a given day
            $table->unique(
                ['school_class_id', 'section_id', 'day_of_week', 'period_number', 'academic_year'],
                'unique_class_period_slot'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetables');

        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['class_teacher_id']);
            $table->dropColumn(['is_full_time_teacher_class', 'class_teacher_id']);
        });

        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropForeign(['class_teacher_id']);
            $table->dropColumn(['is_full_time_teacher_class', 'class_teacher_id']);
        });
    }
};