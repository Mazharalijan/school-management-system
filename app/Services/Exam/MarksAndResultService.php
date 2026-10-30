<?php

namespace App\Services\Exam;

use App\Models\ExamClassPaper;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentMark;
use App\Models\Subject;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MarksAndResultService
{
    /**
     * Get all structured data needed for Marks Entry & Result Preparation UI.
     */
    public function getMarksEntryData(int $examSessionId, int $schoolClassId, ?int $sectionId = null): array
    {
        $session = ExamSession::find($examSessionId);
        $class = SchoolClass::with('sections')->find($schoolClassId);

        // 1. Resolve Subjects / Papers for this class and exam session
        $papers = ExamClassPaper::with('subject')
            ->where('school_class_id', $schoolClassId)
            ->where(function ($q) use ($examSessionId) {
                $q->where('exam_session_id', $examSessionId)
                    ->orWhereHas('examSchedule', fn ($sq) => $sq->where('exam_session_id', $examSessionId));
            })
            ->get();

        $subjectsList = [];

        if ($papers->isNotEmpty()) {
            foreach ($papers as $paper) {
                $schedule = $paper->examSchedule;
                $subjectsList[] = [
                    'id' => $paper->id,
                    'subject_id' => $paper->subject_id,
                    'subject_name' => $paper->subject?->subject_name ?? 'Subject',
                    'total_marks' => (float) $paper->total_marks,
                    'passing_marks' => (float) ($schedule?->passing_marks ?? round($paper->total_marks * 0.33, 2)),
                ];
            }
        } else {
            // Check Exam Schedules
            $schedules = ExamSchedule::with('subject')
                ->where('school_class_id', $schoolClassId)
                ->where('exam_session_id', $examSessionId)
                ->get();

            if ($schedules->isNotEmpty()) {
                foreach ($schedules as $schedule) {
                    $subjectsList[] = [
                        'id' => $schedule->id,
                        'subject_id' => $schedule->subject_id,
                        'subject_name' => $schedule->subject?->subject_name ?? 'Subject',
                        'total_marks' => (float) $schedule->total_marks,
                        'passing_marks' => (float) $schedule->passing_marks,
                    ];
                }
            } else {
                // Fallback to subjects table
                $allSubjects = Subject::orderBy('subject_name')->get();
                foreach ($allSubjects as $sub) {
                    $subjectsList[] = [
                        'id' => $sub->id,
                        'subject_id' => $sub->id,
                        'subject_name' => $sub->subject_name,
                        'total_marks' => 100.00,
                        'passing_marks' => 33.00,
                    ];
                }
            }
        }

        // 2. Resolve Enrolled Students
        $studentsQuery = Student::whereHas('enrollments', function ($q) use ($schoolClassId, $sectionId) {
            $q->where('school_class_id', $schoolClassId)
                ->where('is_current', true)
                ->when($sectionId, fn ($sq) => $sq->where('section_id', $sectionId));
        })->with(['current_enrollment.section']);

        $students = $studentsQuery->orderBy('roll_number')->get();

        if ($students->isEmpty()) {
            $students = Student::where('status', 'active')->orderBy('roll_number')->get();
        }

        // 3. Fetch Existing Marks & Exam Results
        $existingMarks = StudentMark::where('exam_session_id', $examSessionId)
            ->where('school_class_id', $schoolClassId)
            ->get();

        $existingResults = ExamResult::where('exam_session_id', $examSessionId)
            ->where('school_class_id', $schoolClassId)
            ->get()
            ->keyBy('student_id');

        // 4. Transform into students grid payload
        $studentsGrid = $students->map(function ($student) use ($existingMarks, $existingResults, $subjectsList) {
            $studentMarks = $existingMarks->where('student_id', $student->id);
            $marksMap = [];
            $absentMap = [];
            $remarksMap = [];

            foreach ($subjectsList as $sub) {
                $subId = $sub['subject_id'];
                $mark = $studentMarks->firstWhere('subject_id', $subId);

                $marksMap[$subId] = $mark ? ($mark->is_absent ? '' : (float) $mark->obtained_marks) : '';
                $absentMap[$subId] = $mark ? (bool) $mark->is_absent : false;
                $remarksMap[$subId] = $mark?->remarks ?? '';
            }

            $res = $existingResults->get($student->id);

            return [
                'id' => $student->id,
                'roll_no' => $student->roll_number ?: "STU-{$student->id}",
                'name' => $student->full_name,
                'gender' => $student->gender,
                'section_name' => $student->current_enrollment?->section?->name ?? 'A',
                'marks' => $marksMap,
                'absent' => $absentMap,
                'remarks' => $remarksMap,
                'result' => $res ? [
                    'id' => $res->id,
                    'total_obtained_marks' => (float) $res->total_obtained_marks,
                    'total_max_marks' => (float) $res->total_max_marks,
                    'percentage' => (float) $res->percentage,
                    'grade' => $res->grade,
                    'status' => $res->status,
                    'position_in_class' => $res->position_in_class,
                    'teacher_remarks' => $res->teacher_remarks,
                ] : null,
            ];
        });

        return [
            'session' => $session,
            'class' => $class,
            'subjects' => $subjectsList,
            'students' => $studentsGrid->values()->toArray(),
        ];
    }

    /**
     * Store or update bulk subject marks and optionally prepare final exam results.
     */
    public function storeBulkMarks(array $data): bool
    {
        return DB::transaction(function () use ($data) {
            $sessionId = (int) $data['exam_session_id'];
            $classId = (int) $data['school_class_id'];
            $teacherRemarks = [];

            // Case A: Matrix payload by student
            if (! empty($data['students'])) {
                foreach ($data['students'] as $studentData) {
                    $studentId = (int) $studentData['student_id'];

                    if (! empty($studentData['teacher_remarks'])) {
                        $teacherRemarks[] = [
                            'student_id' => $studentId,
                            'remarks' => $studentData['teacher_remarks'],
                        ];
                    }

                    if (! empty($studentData['marks'])) {
                        foreach ($studentData['marks'] as $key => $markInfo) {
                            $subId = is_array($markInfo) ? (int) ($markInfo['subject_id'] ?? $key) : (int) $key;
                            $isAbsent = is_array($markInfo) ? (bool) ($markInfo['is_absent'] ?? false) : false;
                            $obtained = is_array($markInfo) ? ($markInfo['obtained_marks'] ?? 0) : $markInfo;
                            $total = is_array($markInfo) ? ($markInfo['total_marks'] ?? 100) : 100;
                            $remarks = is_array($markInfo) ? ($markInfo['remarks'] ?? null) : null;

                            // If value is empty string and not absent, default to 0
                            $obtained = ($obtained === '' || $obtained === null) ? 0.00 : (float) $obtained;
                            $total = max(1.00, (float) $total);

                            StudentMark::updateOrCreate(
                                [
                                    'exam_session_id' => $sessionId,
                                    'school_class_id' => $classId,
                                    'subject_id' => $subId,
                                    'student_id' => $studentId,
                                ],
                                [
                                    'obtained_marks' => $isAbsent ? 0.00 : $obtained,
                                    'total_marks' => $total,
                                    'is_absent' => $isAbsent,
                                    'remarks' => $remarks,
                                ]
                            );
                        }
                    }
                }
            }
            // Case B: Flat marks array (single or multi-subject)
            elseif (! empty($data['marks'])) {
                $defaultSubjectId = $data['subject_id'] ?? null;
                foreach ($data['marks'] as $markEntry) {
                    $subId = $markEntry['subject_id'] ?? $defaultSubjectId;
                    if (! $subId) {
                        continue;
                    }

                    $isAbsent = (bool) ($markEntry['is_absent'] ?? false);
                    $obtained = $markEntry['obtained_marks'] ?? 0;
                    $obtained = ($obtained === '' || $obtained === null) ? 0.00 : (float) $obtained;
                    $total = max(1.00, (float) ($markEntry['total_marks'] ?? 100));

                    StudentMark::updateOrCreate(
                        [
                            'exam_session_id' => $sessionId,
                            'school_class_id' => $classId,
                            'subject_id' => (int) $subId,
                            'student_id' => (int) $markEntry['student_id'],
                        ],
                        [
                            'obtained_marks' => $isAbsent ? 0.00 : $obtained,
                            'total_marks' => $total,
                            'is_absent' => $isAbsent,
                            'remarks' => $markEntry['remarks'] ?? null,
                        ]
                    );
                }
            }

            // Always prepare results if requested or by default
            $shouldPrepareResults = $data['prepare_results'] ?? true;
            if ($shouldPrepareResults) {
                $this->processClassResults($sessionId, $classId, $teacherRemarks);
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

            // Fetch all marks for this class & session to evaluate passing criteria per subject
            $allMarks = StudentMark::where('exam_session_id', $examSessionId)
                ->where('school_class_id', $schoolClassId)
                ->get();

            // Fetch schedules or papers for passing mark thresholds
            $schedules = ExamSchedule::where('exam_session_id', $examSessionId)
                ->where('school_class_id', $schoolClassId)
                ->pluck('passing_marks', 'subject_id');

            $groupedMarks = $allMarks->groupBy('student_id');

            $resultsData = collect();

            foreach ($groupedMarks as $studentId => $marks) {
                $totalObtained = 0.00;
                $totalMax = 0.00;
                $hasFailedSubject = false;

                foreach ($marks as $mark) {
                    $obtained = $mark->is_absent ? 0.00 : (float) $mark->obtained_marks;
                    $total = (float) $mark->total_marks;
                    $passThreshold = (float) ($schedules[$mark->subject_id] ?? round($total * 0.33, 2));

                    $totalObtained += $obtained;
                    $totalMax += $total;

                    if ($mark->is_absent || $obtained < $passThreshold) {
                        $hasFailedSubject = true;
                    }
                }

                $percentage = $totalMax > 0 ? ($totalObtained / $totalMax) * 100 : 0.00;
                $grade = $this->calculateGrade($percentage);
                $status = (! $hasFailedSubject && $percentage >= 33.00) ? 'pass' : 'fail';

                $resultsData->push([
                    'student_id' => $studentId,
                    'total_obtained_marks' => round($totalObtained, 2),
                    'total_max_marks' => round($totalMax, 2),
                    'percentage' => round($percentage, 2),
                    'grade' => $grade,
                    'status' => $status,
                    'teacher_remarks' => $remarksMap[$studentId]['remarks'] ?? null,
                ]);
            }

            // Sort by total obtained descending to assign positions
            $sortedResults = $resultsData->sortByDesc('total_obtained_marks')->values();

            $processedResults = collect();
            $rank = 1;

            foreach ($sortedResults as $data) {
                $result = ExamResult::updateOrCreate(
                    [
                        'exam_session_id' => $examSessionId,
                        'school_class_id' => $schoolClassId,
                        'student_id' => $data['student_id'],
                    ],
                    [
                        'total_obtained_marks' => $data['total_obtained_marks'],
                        'total_max_marks' => $data['total_max_marks'],
                        'percentage' => $data['percentage'],
                        'grade' => $data['grade'],
                        'status' => $data['status'],
                        'position_in_class' => $rank++,
                        'teacher_remarks' => $data['teacher_remarks'],
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
    public function calculateGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            $percentage >= 33 => 'E',
            default => 'F',
        };
    }
}
