<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExamAndQuestionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('exam_paper_section_questions')->truncate();
        DB::table('exam_paper_sections')->truncate();
        DB::table('exam_class_papers')->truncate();
        DB::table('exam_schedules')->truncate();
        DB::table('exam_results')->truncate();
        DB::table('student_marks')->truncate();
        DB::table('exam_sessions')->truncate();
        DB::table('question_banks')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Question Bank (20 Sample Questions)
        $qTypes = ['mcq', 'short', 'long', 'letter', 'essay'];
        for ($i = 1; $i <= 20; $i++) {
            DB::table('question_banks')->insert([
                'id' => $i,
                'school_class_id' => (($i - 1) % 10) + 1,
                'subject_id' => (($i - 1) % 10) + 1,
                'chapter_id' => $i,
                'topic_id' => $i,
                'question_type' => $qTypes[$i % 5],
                'question' => "Sample Question {$i}: Explain the core academic concepts in detail with clear examples.",
                'default_marks' => $i % 2 === 0 ? 5.00 : 1.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. The 3 Examination Terms
        $termsData = [
            [
                'id' => 1,
                'title' => 'First Term',
                'session_year' => '2026-2027',
                'start_date' => '2026-03-01',
                'end_date' => '2026-03-20',
                'status' => 'published',
            ],
            [
                'id' => 2,
                'title' => 'Second Term',
                'session_year' => '2026-2027',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-20',
                'status' => 'published',
            ],
            [
                'id' => 3,
                'title' => 'Third Term',
                'session_year' => '2026-2027',
                'start_date' => '2026-11-20',
                'end_date' => '2026-12-15',
                'status' => 'published',
            ],
        ];

        foreach ($termsData as $term) {
            DB::table('exam_sessions')->insert(array_merge($term, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 3. Schedules, Class Papers & Sections across all 10 Classes & 3 Terms
        // Subjects: 1: Mathematics, 2: English Literature, 3: Physics, 4: Chemistry, 5: Biology, 6: Computer Science
        $classes = DB::table('school_classes')->orderBy('numeric_value')->get();
        $subjects = DB::table('subjects')->get();

        if ($classes->isEmpty()) {
            return;
        }

        $paperCounter = 1;

        foreach ($classes as $class) {
            foreach ($termsData as $term) {
                // Each term has 2-3 subject papers per class
                $termSubjects = match ($term['id']) {
                    1 => [1, 2],       // Math, English
                    2 => [1, 2, 3],    // Math, English, Physics/General Science
                    3 => [1, 2, 6],    // Math, English, Computer Science
                    default => [1, 2],
                };

                foreach ($termSubjects as $subId) {
                    $subjectRecord = $subjects->firstWhere('id', $subId);
                    $subjectName = $subjectRecord ? $subjectRecord->subject_name : 'Subject';

                    // Schedule / Date Sheet
                    $scheduleId = DB::table('exam_schedules')->insertGetId([
                        'exam_session_id' => $term['id'],
                        'school_class_id' => $class->id,
                        'subject_id' => $subId,
                        'exam_date' => date('Y-m-d', strtotime("{$term['start_date']} +{$subId} days")),
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                        'total_marks' => 100.00,
                        'passing_marks' => 33.00,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Exam Class Paper
                    $paperId = DB::table('exam_class_papers')->insertGetId([
                        'exam_schedule_id' => $scheduleId,
                        'exam_session_id' => $term['id'],
                        'school_class_id' => $class->id,
                        'subject_id' => $subId,
                        'paper_title' => "{$class->name} {$term['title']} {$subjectName} Paper",
                        'total_marks' => 100.00,
                        'duration_minutes' => 180,
                        'instructions' => 'Read all questions carefully. All sections are mandatory. Calculators allowed where permitted.',
                        'print_status' => $term['id'] === 1 ? 'printed' : ($term['id'] === 2 ? 'queued' : 'pending'),
                        'total_copies_needed' => 40,
                        'total_copies_printed' => $term['id'] === 1 ? 40 : 0,
                        'printed_at' => $term['id'] === 1 ? now() : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Paper Sections: Section A (MCQs) and Section B (Subjective)
                    $sectionNames = ['A', 'B'];
                    foreach ($sectionNames as $sIdx => $secName) {
                        $sectionId = DB::table('exam_paper_sections')->insertGetId([
                            'exam_class_paper_id' => $paperId,
                            'section_name' => $secName,
                            'title' => $secName === 'A' ? 'Objective MCQs' : 'Subjective & Conceptual Answers',
                            'total_marks' => 50.00,
                            'total_questions' => 5,
                            'order' => $sIdx + 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Attach Question
                        DB::table('exam_paper_section_questions')->insert([
                            'exam_paper_section_id' => $sectionId,
                            'question_bank_id' => min($subId, 20),
                            'marks' => 10.00,
                            'order' => 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    $paperCounter++;
                }
            }
        }

        // 4. Student Marks Entry (across active First Term)
        for ($stId = 1; $stId <= 10; $stId++) {
            DB::table('student_marks')->insert([
                'exam_session_id' => 1,
                'school_class_id' => $stId,
                'student_id' => $stId,
                'subject_id' => 1,
                'obtained_marks' => 70.00 + ($stId * 2),
                'total_marks' => 100.00,
                'is_absent' => false,
                'remarks' => 'Good performance in First Term',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Results / DMCs
            $totalObtained = 430.00 + ($stId * 5);
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
