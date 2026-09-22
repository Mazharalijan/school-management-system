<?php

namespace App\Services\Exam;

use App\Models\StudentMark;
use App\Models\ExamResult;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class MarksAndResultService
{
    /**
     * Store or update bulk subject marks for an entire class section.
     */
    public function storeBulkMarks(array $data): bool
    {
        return DB::transaction(function () use ($data) {
            foreach ($data['marks'] as $markEntry) {
                StudentMark::updateOrCreate(
                    [
                        'exam_session_id' => $data['exam_session_id'],
                        'school_class_id' => $data['school_class_id'],
                        'subject_id'      => $data['subject_id'],
                        'student_id'      => $markEntry['student_id'],
                    ],
                    [
                        'obtained_marks' => $markEntry['is_absent'] ? 0.00 : $markEntry['obtained_marks'],
                        'total_marks'    => $markEntry['total_marks'],
                        'is_absent'      => $markEntry['is_absent'] ?? false,
                        'remarks'        => $markEntry['remarks'] ?? null,
                    ]
                );
            }
            return true;
        });
    }

    /**
     * Process, grade, rank, and store final results for a class session.
     */
    public function processClassResults(int $examSessionId, int $schoolClassId, array $teacherRemarks = []): Collection
    {
        return DB::transaction(function () use ($examSessionId, $schoolClassId, $teacherRemarks) {
            $remarksMap = collect($teacherRemarks)->keyBy('student_id');

            // Fetch total marks grouped by student
            $studentTotals = StudentMark::where('exam_session_id', $examSessionId)
                ->where('school_class_id', $schoolClassId)
                ->selectRaw('student_id, SUM(obtained_marks) as total_obtained, SUM(total_marks) as total_max')
                ->groupBy('student_id')
                ->get();

            // Calculate percentage and initial result payload
            $resultsData = $studentTotals->map(function ($record) use ($remarksMap) {
                $percentage = $record->total_max > 0 ? ($record->total_obtained / $record->total_max) * 100 : 0;
                $grade = $this->calculateGrade($percentage);
                $status = $percentage >= 33.00 ? 'pass' : 'fail';

                return [
                    'student_id'           => $record->student_id,
                    'total_obtained_marks' => $record->total_obtained,
                    'total_max_marks'      => $record->total_max,
                    'percentage'           => round($percentage, 2),
                    'grade'                => $grade,
                    'status'               => $status,
                    'teacher_remarks'      => $remarksMap[$record->student_id]['remarks'] ?? null,
                ];
            });

            // Sort by total obtained descending to assign ranks
            $sortedResults = $resultsData->sortByDesc('total_obtained_marks')->values();

            $processedResults = collect();
            $rank = 1;

            foreach ($sortedResults as $data) {
                $result = ExamResult::updateOrCreate(
                    [
                        'exam_session_id' => $examSessionId,
                        'school_class_id' => $schoolClassId,
                        'student_id'      => $data['student_id'],
                    ],
                    [
                        'total_obtained_marks' => $data['total_obtained_marks'],
                        'total_max_marks'      => $data['total_max_marks'],
                        'percentage'           => $data['percentage'],
                        'grade'                => $data['grade'],
                        'status'               => $data['status'],
                        'position_in_class'    => $rank++,
                        'teacher_remarks'      => $data['teacher_remarks'],
                    ]
                );

                $processedResults->push($result);
            }

            return $processedResults;
        });
    }

    /**
     * Standard grading criteria logic.
     */
    private function calculateGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            $percentage >= 33 => 'E',
            default           => 'F',
        };
    }
}