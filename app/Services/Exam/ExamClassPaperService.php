<?php

namespace App\Services\Exam;

use App\Models\ExamClassPaper;
use App\Models\ExamPaperSection;
use App\Models\ExamPaperSectionQuestion;
use Illuminate\Support\Facades\DB;

class ExamClassPaperService
{
    /**
     * Create a new exam class paper with optional nested sections and questions.
     */
    public function createPaper(array $data): ExamClassPaper
    {
        return DB::transaction(function () use ($data) {
            $paper = ExamClassPaper::create([
                'paper_title' => $data['paper_title'] ?? $data['title'] ?? 'Exam Paper',
                'school_class_id' => $data['school_class_id'],
                'subject_id' => $data['subject_id'],
                'exam_schedule_id' => $data['exam_schedule_id'] ?? null,
                'total_marks' => $data['total_marks'],
                'duration_minutes' => $data['duration_minutes'],
                'instructions' => $data['instructions'] ?? null,
                'total_copies_needed' => $data['total_copies_needed'] ?? 0,
                'print_status' => $data['print_status'] ?? 'pending',
            ]);

            if (! empty($data['sections'])) {
                foreach ($data['sections'] as $sectionData) {
                    $this->storeSection($paper, $sectionData);
                }
            }

            return $paper->load('sections.sectionQuestions.questionBank');
        });
    }

    /**
     * Update an existing exam class paper, syncing sections and questions.
     */
    public function updatePaper(ExamClassPaper $paper, array $data): ExamClassPaper
    {
        return DB::transaction(function () use ($paper, $data) {
            $paper->update([
                'paper_title' => $data['paper_title'] ?? $data['title'] ?? $paper->paper_title,
                'school_class_id' => $data['school_class_id'] ?? $paper->school_class_id,
                'subject_id' => $data['subject_id'] ?? $paper->subject_id,
                'exam_schedule_id' => $data['exam_schedule_id'] ?? $paper->exam_schedule_id,
                'total_marks' => $data['total_marks'] ?? $paper->total_marks,
                'duration_minutes' => $data['duration_minutes'] ?? $paper->duration_minutes,
                'instructions' => $data['instructions'] ?? $paper->instructions,
                'print_status' => $data['print_status'] ?? $paper->print_status,
                'total_copies_needed' => $data['total_copies_needed'] ?? $paper->total_copies_needed,
            ]);

            if (isset($data['sections'])) {
                $incomingSectionIds = collect($data['sections'])->pluck('id')->filter()->toArray();

                // Delete sections that are removed in the update request
                $paper->sections()->whereNotIn('id', $incomingSectionIds)->delete();

                foreach ($data['sections'] as $sectionData) {
                    if (! empty($sectionData['id'])) {
                        $section = ExamPaperSection::find($sectionData['id']);
                        if ($section && $section->exam_class_paper_id === $paper->id) {
                            $this->updateSection($section, $sectionData);

                            continue;
                        }
                    }

                    $this->storeSection($paper, $sectionData);
                }
            }

            return $paper->load('sections.sectionQuestions.questionBank');
        });
    }

    /**
     * Delete an exam class paper.
     */
    public function deletePaper(ExamClassPaper $paper): bool
    {
        return DB::transaction(function () use ($paper) {
            return $paper->delete();
        });
    }

    /**
     * Create Section and sync questions either via $data['question_ids'] array or $data['questions'].
     */
    public function addSection(array $data): ExamPaperSection
    {
        // Find the model using the ID passed from the frontend
        $paper = ExamClassPaper::findOrFail($data['exam_class_paper_id']);

        return DB::transaction(function () use ($paper, $data) {
            return $this->storeSection($paper, $data);
        });
    }

    /**
     * Update an existing section and sync/replace attached questions.
     */
    public function updateSection(ExamPaperSection $section, array $data): ExamPaperSection
    {
        return DB::transaction(function () use ($section, $data) {
            // Calculate total questions if question_ids array provided
            $totalQuestions = isset($data['question_ids'])
                ? count($data['question_ids'])
                : ($data['total_questions'] ?? $section->total_questions);

            $section->update([
                'exam_class_paper_id' => $data['exam_class_paper_id'] ?? $section->exam_class_paper_id,
                'section_name' => $data['section_name'] ?? $section->section_name,
                'title' => $data['title'] ?? $section->title,
                'total_marks' => $data['total_marks'] ?? $section->total_marks,
                'question_type' => $data['question_type'] ?? $section->question_type,
                'total_questions' => $totalQuestions,
                'order' => $data['order'] ?? $section->order,
            ]);

            // Option 1: Handle question_ids array (from Checkbox UI Builder)
            if (isset($data['question_ids'])) {
                $section->sectionQuestions()->delete();
                foreach ($data['question_ids'] as $index => $qId) {
                    $this->storeSectionQuestion($section, [
                        'question_bank_id' => $qId,
                        'marks' => 1.00,
                        'order' => $index + 1,
                    ]);
                }
            }
            // Option 2: Handle structured questions array
            elseif (isset($data['questions'])) {
                $incomingQuestionIds = collect($data['questions'])->pluck('id')->filter()->toArray();

                $section->sectionQuestions()->whereNotIn('id', $incomingQuestionIds)->delete();

                foreach ($data['questions'] as $questionData) {
                    if (! empty($questionData['id'])) {
                        $sectionQuestion = ExamPaperSectionQuestion::find($questionData['id']);
                        if ($sectionQuestion && $sectionQuestion->exam_paper_section_id === $section->id) {
                            $this->updateSectionQuestion($sectionQuestion, $questionData);

                            continue;
                        }
                    }

                    $this->storeSectionQuestion($section, $questionData);
                }
            }

            return $section->fresh('sectionQuestions.questionBank');
        });
    }

    /**
     * Delete a specific section from a paper.
     */
    public function deleteSection(ExamPaperSection $section): bool
    {
        return DB::transaction(function () use ($section) {
            return $section->delete();
        });
    }

    /**
     * Attach a single question to a section.
     */
    public function addQuestionToSection(ExamPaperSection $section, array $data): ExamPaperSectionQuestion
    {
        return DB::transaction(function () use ($section, $data) {
            return $this->storeSectionQuestion($section, $data);
        });
    }

    /**
     * Update a question inside a section (marks, order).
     */
    public function updateSectionQuestion(ExamPaperSectionQuestion $sectionQuestion, array $data): ExamPaperSectionQuestion
    {
        return DB::transaction(function () use ($sectionQuestion, $data) {
            $sectionQuestion->update([
                'question_bank_id' => $data['question_bank_id'] ?? $sectionQuestion->question_bank_id,
                'marks' => $data['marks'] ?? $sectionQuestion->marks,
                'order' => $data['order'] ?? $sectionQuestion->order,
            ]);

            return $sectionQuestion->fresh('questionBank');
        });
    }

    /**
     * Remove a question from a section.
     */
    public function removeQuestionFromSection(ExamPaperSectionQuestion $sectionQuestion): bool
    {
        return DB::transaction(function () use ($sectionQuestion) {
            return $sectionQuestion->delete();
        });
    }

    /**
     * Update print status for bulk or single papers.
     */
    public function updatePrintStatuses(array $paperIds, string $status = 'printed'): void
    {
        ExamClassPaper::whereIn('id', $paperIds)->update([
            'print_status' => $status,
        ]);
    }

    /**
     * Internal helper to store a section and its questions.
     */
    protected function storeSection(ExamClassPaper $paper, array $sectionData): ExamPaperSection
    {
        $questionIds = $sectionData['question_ids'] ?? [];
        $totalQuestions = ! empty($questionIds)
            ? count($questionIds)
            : ($sectionData['total_questions'] ?? 0);

        $section = $paper->sections()->create([
            'section_name' => $sectionData['section_name'],
            'title' => $sectionData['title'],
            'total_marks' => $sectionData['total_marks'],
            'question_type' => $sectionData['question_type'],
            'total_questions' => $totalQuestions,
            'order' => $sectionData['order'] ?? 1,
        ]);

        // Process flat question_ids array from UI checkbox builder
        if (! empty($questionIds)) {
            foreach ($questionIds as $index => $qId) {
                $this->storeSectionQuestion($section, [
                    'question_bank_id' => $qId,
                    'marks' => 1.00,
                    'order' => $index + 1,
                ]);
            }
        }
        // Process nested questions array
        elseif (! empty($sectionData['questions'])) {
            foreach ($sectionData['questions'] as $questionData) {
                $this->storeSectionQuestion($section, $questionData);
            }
        }

        return $section;
    }

    /**
     * Internal helper to store a section question record.
     */
    protected function storeSectionQuestion(ExamPaperSection $section, array $questionData): ExamPaperSectionQuestion
    {
        return $section->sectionQuestions()->create([
            'question_bank_id' => $questionData['question_bank_id'],
            'marks' => $questionData['marks'] ?? 1.00,
            'order' => $questionData['order'] ?? 1,
        ]);
    }
}
