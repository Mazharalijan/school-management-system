<?php

namespace App\Services\Exam;

use App\Models\ExamClassPaper;
use Illuminate\Support\Facades\DB;

class ExamPaperService
{
    /**
     * Create or update a complete exam paper with sections and questions.
     */
    public function createPaperWithSections(array $data): ExamClassPaper
    {
        return DB::transaction(function () use ($data) {
            $paper = ExamClassPaper::create([
                'exam_schedule_id' => $data['exam_schedule_id'] ?? null,
                'school_class_id' => $data['school_class_id'],
                'subject_id' => $data['subject_id'],
                'paper_title' => $data['paper_title'],
                'total_marks' => $data['total_marks'],
                'duration_minutes' => $data['duration_minutes'],
                'instructions' => $data['instructions'] ?? null,
                'total_copies_needed' => $data['total_copies_needed'] ?? 0,
            ]);

            foreach ($data['sections'] as $sectionData) {
                $section = $paper->sections()->create([
                    'section_name' => $sectionData['section_name'],
                    'title' => $sectionData['title'],
                    'total_marks' => $sectionData['total_marks'],
                    'total_questions' => $sectionData['total_questions'],
                    'order' => $sectionData['order'],
                ]);

                foreach ($sectionData['questions'] as $questionData) {
                    $section->questions()->create([
                        'question_bank_id' => $questionData['question_bank_id'],
                        'marks' => $questionData['marks'],
                        'order' => $questionData['order'],
                    ]);
                }
            }

            return $paper->load('sections.questions.questionBank');
        });
    }

    /**
     * Update paper print status and track printed physical copies.
     */
    public function updatePrintStatus(ExamClassPaper $paper, array $data): ExamClassPaper
    {
        $updateData = [
            'print_status' => $data['print_status'],
        ];

        if ($data['print_status'] === 'printed') {
            $updateData['total_copies_printed'] = $data['total_copies_printed'];
            $updateData['printed_at'] = now();
        }

        $paper->update($updateData);

        return $paper;
    }
}
