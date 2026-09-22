<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamAndQuestionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Question Bank (15 Questions)
        $qTypes = ['mcq', 'short', 'long', 'letter', 'essay'];
        for ($i = 1; $i <= 15; $i++) {
            DB::table('question_banks')->insert([
                'id' => $i,
                'school_class_id' => ($i % 10) + 1,
                'subject_id' => ($i % 10) + 1,
                'chapter_id' => $i,
                'topic_id' => $i,
                'question_type' => $qTypes[$i % 5],
                'question' => "Sample Question {$i}: Explain the core concepts in detail with examples.",
                'default_marks' => $i % 2 == 0 ? 5.00 : 1.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Exam Sessions (10 Sessions)
        for ($s = 1; $s <= 10; $s++) {
            $sessionId = DB::table('exam_sessions')->insertGetId([
                'title' => "Exam Session Term {$s} - 2026",
                'session_year' => '2026-2027',
                'start_date' => '2026-03-01',
                'end_date' => '2026-03-15',
                'status' => $s == 1 ? 'published' : 'draft',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Exam Schedule / Date Sheet (10 per session)
            $scheduleId = DB::table('exam_schedules')->insertGetId([
                'exam_session_id' => $sessionId,
                'school_class_id' => min($s, 10),
                'subject_id' => min($s, 10),
                'exam_date' => '2026-03-05',
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'total_marks' => 100.00,
                'passing_marks' => 33.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 4. Assembled Exam Class Papers
            $paperId = DB::table('exam_class_papers')->insertGetId([
                'exam_schedule_id' => $scheduleId,
                'school_class_id' => min($s, 10),
                'subject_id' => min($s, 10),
                'paper_title' => "Term {$s} Mid-Year Examination Paper",
                'total_marks' => 100.00,
                'duration_minutes' => 180,
                'instructions' => 'Read all questions carefully. Attempt all sections.',
                'print_status' => 'printed',
                'total_copies_needed' => 40,
                'total_copies_printed' => 40,
                'printed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 5. Paper Sections
            $sectionNames = ['A', 'B'];
            foreach ($sectionNames as $sIndex => $secName) {
                $paperSectionId = DB::table('exam_paper_sections')->insertGetId([
                    'exam_class_paper_id' => $paperId,
                    'section_name' => $secName,
                    'title' => $secName == 'A' ? 'Objective MCQs' : 'Subjective Short Answers',
                    'total_marks' => 50.00,
                    'total_questions' => 5,
                    'order' => $sIndex + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 6. Paper Section Questions
                DB::table('exam_paper_section_questions')->insert([
                    'exam_paper_section_id' => $paperSectionId,
                    'question_bank_id' => min($s, 15),
                    'marks' => 10.00,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 7. Student Marks Entry (10 Students across active Session 1)
        for ($stId = 1; $stId <= 10; $stId++) {
            DB::table('student_marks')->insert([
                'exam_session_id' => 1,
                'school_class_id' => $stId,
                'student_id' => $stId,
                'subject_id' => $stId,
                'obtained_marks' => 65.00 + ($stId * 2),
                'total_marks' => 100.00,
                'is_absent' => false,
                'remarks' => 'Good Performance',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 8. Exam Results / DMCs
            $totalObtained = 420.00 + ($stId * 10);
            $totalMax = 500.00;
            $percentage = ($totalObtained / $totalMax) * 100;

            DB::table('exam_results')->insert([
                'exam_session_id' => 1,
                'school_class_id' => $stId,
                'student_id' => $stId,
                'total_obtained_marks' => $totalObtained,
                'total_max_marks' => $totalMax,
                'percentage' => $percentage,
                'grade' => $percentage >= 80 ? 'A+' : 'A',
                'status' => 'pass',
                'position_in_class' => $stId,
                'teacher_remarks' => 'Promoted to next grade.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}