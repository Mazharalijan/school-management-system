<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuestionBankService
{
    /**
     * Create a new subject.
     */
    public function createSubject(array $data): Subject
    {
        return DB::transaction(function () use ($data) {
            return Subject::create([
                'subject_name' => $data['subject_name'],
            ]);
        });
    }

    /**
     * Update an existing subject.
     */
    public function updateSubject(Subject $subject, array $data): Subject
    {
        return DB::transaction(function () use ($subject, $data) {
            $subject->update([
                'subject_name' => $data['subject_name'] ?? $subject->subject_name,
            ]);

            return $subject->fresh(['schoolClass']);
        });
    }

    /**
     * Delete a subject.
     */
    public function deleteSubject(Subject $subject): bool
    {
        return DB::transaction(function () use ($subject) {
            return $subject->delete();
        });
    }

    /**
     * Create a new chapter.
     */
    public function createChapter(array $data): Chapter
    {
        return DB::transaction(function () use ($data) {
            return Chapter::create([
                'school_class_id' => $data['school_class_id'],
                'subject_id' => $data['subject_id'],
                'chapter_name' => $data['chapter_name'],
            ]);
        });
    }

    /**
     * Update an existing chapter.
     */
    public function updateChapter(Chapter $chapter, array $data): Chapter
    {
        return DB::transaction(function () use ($chapter, $data) {
            $chapter->update([
                'school_class_id' => $data['school_class_id'] ?? $chapter->school_class_id,
                'subject_id' => $data['subject_id'] ?? $chapter->subject_id,
                'chapter_name' => $data['chapter_name'] ?? $chapter->chapter_name,
            ]);

            return $chapter->fresh(['schoolClass', 'subject']);
        });
    }

    /**
     * Delete a chapter.
     */
    public function deleteChapter(Chapter $chapter): bool
    {
        return DB::transaction(function () use ($chapter) {
            return $chapter->delete();
        });
    }

    /**
     * Create a new topic.
     */
    public function createTopic(array $data): Topic
    {
        return DB::transaction(function () use ($data) {
            return Topic::create([
                'chapter_id' => $data['chapter_id'],
                'topic_name' => $data['topic_name'],
            ]);
        });
    }

    /**
     * Update an existing topic.
     */
    public function updateTopic(Topic $topic, array $data): Topic
    {
        return DB::transaction(function () use ($topic, $data) {
            $chapterId = $data['chapter_id'] ?? $topic->chapter_id;

            if (array_key_exists('chapter_id', $data)) {
                $chapter = Chapter::find($chapterId);
                if (! $chapter) {
                    throw ValidationException::withMessages([
                        'chapter_id' => 'The selected chapter does not exist.',
                    ]);
                }
            }

            $topic->update([
                'chapter_id' => $chapterId,
                'topic_name' => $data['topic_name'] ?? $topic->topic_name,
            ]);

            return $topic->fresh(['chapter.subject']);
        });
    }

    /**
     * Delete a topic.
     */
    public function deleteTopic(Topic $topic): bool
    {
        return DB::transaction(function () use ($topic) {
            return $topic->delete();
        });
    }

    /**
     * Create a new question bank entry with strict hierarchical validation.
     */
    public function createQuestion(array $data): QuestionBank
    {
        return DB::transaction(function () use ($data) {
            $this->validateHierarchy($data['subject_id'], $data['chapter_id'] ?? null, $data['topic_id'] ?? null);

            return QuestionBank::create([
                'school_class_id' => $data['school_class_id'],
                'subject_id' => $data['subject_id'],
                'chapter_id' => $data['chapter_id'] ?? null,
                'topic_id' => $data['topic_id'] ?? null,
                'question_type' => $data['question_type'],
                'question' => $data['question'],
                'default_marks' => $data['default_marks'] ?? 1.00,
            ]);
        });
    }

    /**
     * Update an existing question bank entry with hierarchical validation.
     */
    public function updateQuestion(QuestionBank $questionBank, array $data): QuestionBank
    {
        return DB::transaction(function () use ($questionBank, $data) {
            $subjectId = $data['subject_id'] ?? $questionBank->subject_id;
            $chapterId = array_key_exists('chapter_id', $data) ? $data['chapter_id'] : $questionBank->chapter_id;
            $topicId = array_key_exists('topic_id', $data) ? $data['topic_id'] : $questionBank->topic_id;

            $this->validateHierarchy($subjectId, $chapterId, $topicId);

            $questionBank->update([
                'school_class_id' => $data['school_class_id'] ?? $questionBank->school_class_id,
                'subject_id' => $subjectId,
                'chapter_id' => $chapterId,
                'topic_id' => $topicId,
                'question_type' => $data['question_type'] ?? $questionBank->question_type,
                'question' => $data['question'] ?? $questionBank->question,
                'default_marks' => $data['default_marks'] ?? $questionBank->default_marks,
            ]);

            return $questionBank->fresh(['chapter', 'topic', 'subject', 'schoolClass']);
        });
    }

    /**
     * Delete a question bank entry.
     */
    public function deleteQuestion(QuestionBank $questionBank): bool
    {
        return DB::transaction(function () use ($questionBank) {
            return $questionBank->delete();
        });
    }

    /**
     * Create multiple questions across multiple topic cards in a single transaction.
     */
    public function createBatchQuestions(array $data): int
    {
        return DB::transaction(function () use ($data) {
            $createdCount = 0;

            foreach ($data['topic_cards'] as $card) {
                $schoolClassId = $card['school_class_id'];
                $subjectId = $card['subject_id'];
                $chapterId = $card['chapter_id'] ?? null;
                $topicId = $card['topic_id'] ?? null;

                $this->validateHierarchy($subjectId, $chapterId, $topicId);

                foreach ($card['questions'] as $q) {
                    QuestionBank::create([
                        'school_class_id' => $schoolClassId,
                        'subject_id' => $subjectId,
                        'chapter_id' => $chapterId,
                        'topic_id' => $topicId,
                        'question_type' => $q['question_type'],
                        'question' => $q['question'],
                        'default_marks' => $q['default_marks'] ?? 1.00,
                    ]);
                    $createdCount++;
                }
            }

            return $createdCount;
        });
    }

    /**
     * Validate that chapters belong to the given subject and topics belong to the given chapter.
     */
    protected function validateHierarchy(int $subjectId, ?int $chapterId, ?int $topicId): void
    {
        if ($chapterId) {
            $chapter = Chapter::find($chapterId);
            if (! $chapter || $chapter->subject_id !== $subjectId) {
                throw ValidationException::withMessages([
                    'chapter_id' => 'The selected chapter does not belong to the chosen subject.',
                ]);
            }
        }

        if ($topicId) {
            $topic = Topic::find($topicId);
            if (! $topic || ! $chapterId || $topic->chapter_id !== $chapterId) {
                throw ValidationException::withMessages([
                    'topic_id' => 'The selected topic does not belong to the chosen chapter.',
                ]);
            }
        }
    }
}
