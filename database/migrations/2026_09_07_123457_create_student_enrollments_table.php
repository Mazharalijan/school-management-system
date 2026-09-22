<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('session_year'); // e.g. "2026-2027"
            $table->boolean('is_current')->default(true);
            $table->timestamps();

            $table->index(['student_id', 'session_year']);
            $table->index(['school_class_id', 'section_id', 'is_current']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};