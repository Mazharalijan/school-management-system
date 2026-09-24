<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Timetable;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TimetableGeneratorService
{
    /**
     * Auto-generate weekly timetable for a specific Class/Section.
     */
    public function generateClassTimetable(array $data): int
    {
        return DB::transaction(function () use ($data) {
            $classId = $data['school_class_id'];
            $sectionId = $data['section_id'] ?? null;
            $academicYear = $data['academic_year'] ?? '2025-2026';
            $workingDays = $data['working_days'] ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            $periodsPerDay = (int) $data['periods_per_day'];
            $startTimeStr = $data['start_time'];
            $durationMinutes = (int) $data['period_duration_minutes'];
            $breakPeriod = isset($data['break_period']) ? (int) $data['break_period'] : null;
            $allocations = $data['allocations'];
            $isFullTimeTeacherClass = (bool) ($data['is_full_time_teacher_class'] ?? false);
            $classTeacherId = $data['class_teacher_id'] ?? null;

            // Update Class/Section metadata
            if ($sectionId) {
                Section::where('id', $sectionId)->update([
                    'class_teacher_id' => $classTeacherId,
                    'is_full_time_teacher_class' => $isFullTimeTeacherClass,
                ]);
            } else {
                SchoolClass::where('id', $classId)->update([
                    'class_teacher_id' => $classTeacherId,
                    'is_full_time_teacher_class' => $isFullTimeTeacherClass,
                ]);
            }

            // 1. Wipe existing timetable for this class/section
            Timetable::where('school_class_id', $classId)
                ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId), fn ($q) => $q->whereNull('section_id'))
                ->where('academic_year', $academicYear)
                ->delete();

            // 2. Pre-calculate period start and end times
            $periodTimes = [];
            $currentTime = Carbon::createFromTimeString($startTimeStr);

            for ($p = 1; $p <= $periodsPerDay; $p++) {
                $pStart = $currentTime->format('H:i');
                $pEnd = $currentTime->copy()->addMinutes($durationMinutes)->format('H:i');
                $periodTimes[$p] = ['start' => $pStart, 'end' => $pEnd];

                // Step to next period
                $currentTime->addMinutes($durationMinutes);
            }

            // 3. Prepare subjects pool according to allocated periods_per_week
            $subjectsPool = [];
            foreach ($allocations as $alloc) {
                $count = (int) $alloc['periods_per_week'];
                // If single full-time teacher for class, override all subjects' staff_id
                $assignedStaff = ($isFullTimeTeacherClass && $classTeacherId) ? $classTeacherId : ($alloc['staff_id'] ?? null);

                for ($i = 0; $i < $count; $i++) {
                    $subjectsPool[] = [
                        'subject_id' => $alloc['subject_id'],
                        'staff_id' => $assignedStaff,
                        'room_number' => $alloc['room_number'] ?? null,
                    ];
                }
            }

            // Shuffle pool to distribute subjects across days
            shuffle($subjectsPool);

            // 4. Populate weekly timetable slots
            $slotsCreated = 0;
            $dailySubjectCounts = []; // [day][subject_id] => count

            foreach ($workingDays as $day) {
                $dailySubjectCounts[$day] = [];

                for ($period = 1; $period <= $periodsPerDay; $period++) {
                    // Check if this period is designated as recess / break
                    if ($breakPeriod && $period === $breakPeriod) {
                        Timetable::create([
                            'school_class_id' => $classId,
                            'section_id' => $sectionId,
                            'subject_id' => null,
                            'staff_id' => null,
                            'day_of_week' => $day,
                            'period_number' => $period,
                            'start_time' => $periodTimes[$period]['start'],
                            'end_time' => $periodTimes[$period]['end'],
                            'room_number' => null,
                            'is_break' => true,
                            'academic_year' => $academicYear,
                        ]);
                        $slotsCreated++;

                        continue;
                    }

                    // Find a suitable subject from pool (max 1 period per subject per day)
                    $assignedIndex = null;

                    foreach ($subjectsPool as $index => $item) {
                        $subjId = $item['subject_id'];
                        $staffId = $item['staff_id'];

                        // Rule: Maximum 1 period for each subject in a day
                        $currentDaySubjCount = $dailySubjectCounts[$day][$subjId] ?? 0;
                        if ($currentDaySubjCount >= 1 && count($subjectsPool) > 1) {
                            continue;
                        }

                        // Check teacher conflict across ALL other classes for this day/period
                        if ($staffId && $this->isTeacherBusy($staffId, $day, $period, $academicYear, $classId, $sectionId)) {
                            continue;
                        }

                        // Selected!
                        $assignedIndex = $index;

                        break;
                    }

                    // If strict 1-period constraint didn't find candidate, fallback to any available subject in pool
                    if ($assignedIndex === null && ! empty($subjectsPool)) {
                        foreach ($subjectsPool as $index => $item) {
                            $staffId = $item['staff_id'];
                            if (! $staffId || ! $this->isTeacherBusy($staffId, $day, $period, $academicYear, $classId, $sectionId)) {
                                $assignedIndex = $index;
                                break;
                            }
                        }
                        if ($assignedIndex === null) {
                            $assignedIndex = 0;
                        }
                    }

                    if ($assignedIndex !== null) {
                        $chosen = $subjectsPool[$assignedIndex];
                        array_splice($subjectsPool, $assignedIndex, 1);

                        $subjId = $chosen['subject_id'];
                        $dailySubjectCounts[$day][$subjId] = ($dailySubjectCounts[$day][$subjId] ?? 0) + 1;

                        Timetable::create([
                            'school_class_id' => $classId,
                            'section_id' => $sectionId,
                            'subject_id' => $chosen['subject_id'],
                            'staff_id' => $chosen['staff_id'],
                            'day_of_week' => $day,
                            'period_number' => $period,
                            'start_time' => $periodTimes[$period]['start'],
                            'end_time' => $periodTimes[$period]['end'],
                            'room_number' => $chosen['room_number'],
                            'is_break' => false,
                            'academic_year' => $academicYear,
                        ]);
                        $slotsCreated++;
                    }
                }
            }

            return $slotsCreated;
        });
    }

    /**
     * Store or update a single timetable slot manually with conflict validation.
     */
    public function saveSlot(array $data, ?Timetable $slot = null): Timetable
    {
        return DB::transaction(function () use ($data, $slot) {
            $classId = $data['school_class_id'];
            $sectionId = $data['section_id'] ?? null;
            $day = $data['day_of_week'];
            $period = (int) $data['period_number'];
            $staffId = $data['staff_id'] ?? null;
            $academicYear = $data['academic_year'] ?? '2025-2026';

            // 1. Check if teacher is busy elsewhere
            if ($staffId && $this->isTeacherBusy($staffId, $day, $period, $academicYear, $classId, $sectionId, $slot?->id)) {
                throw ValidationException::withMessages([
                    'staff_id' => 'This teacher is already assigned to another class section during this period.',
                ]);
            }

            $attributes = [
                'school_class_id' => $classId,
                'section_id' => $sectionId,
                'day_of_week' => $day,
                'period_number' => $period,
                'academic_year' => $academicYear,
            ];

            $isBreak = (bool) ($data['is_break'] ?? false);

            $values = [
                'subject_id' => $isBreak ? null : ($data['subject_id'] ?? null),
                'staff_id' => $isBreak ? null : $staffId,
                'start_time' => $data['start_time'] ?? null,
                'end_time' => $data['end_time'] ?? null,
                'room_number' => $data['room_number'] ?? null,
                'is_break' => $isBreak,
            ];

            if ($slot) {
                $slot->update(array_merge($attributes, $values));

                return $slot->fresh(['schoolClass', 'section', 'subject', 'staff']);
            }

            return Timetable::updateOrCreate($attributes, $values)
                ->fresh(['schoolClass', 'section', 'subject', 'staff']);
        });
    }

    /**
     * Delete a single timetable slot.
     */
    public function deleteSlot(Timetable $slot): bool
    {
        return DB::transaction(fn () => $slot->delete());
    }

    /**
     * Clear all timetable slots for a class section.
     */
    public function clearTimetable(int $schoolClassId, ?int $sectionId = null, string $academicYear = '2025-2026'): int
    {
        return DB::transaction(function () use ($schoolClassId, $sectionId, $academicYear) {
            return Timetable::where('school_class_id', $schoolClassId)
                ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId), fn ($q) => $q->whereNull('section_id'))
                ->where('academic_year', $academicYear)
                ->delete();
        });
    }

    /**
     * Check if a teacher is already assigned to another class section during the given day and period.
     */
    protected function isTeacherBusy(
        int $staffId,
        string $day,
        int $period,
        string $academicYear,
        int $currentClassId,
        ?int $currentSectionId,
        ?int $ignoreSlotId = null
    ): bool {
        return Timetable::where('staff_id', $staffId)
            ->where('day_of_week', $day)
            ->where('period_number', $period)
            ->where('academic_year', $academicYear)
            ->where(function ($q) use ($currentClassId, $currentSectionId) {
                $q->where('school_class_id', '!=', $currentClassId)
                    ->orWhere('section_id', '!=', $currentSectionId);
            })
            ->when($ignoreSlotId, fn ($q) => $q->where('id', '!=', $ignoreSlotId))
            ->exists();
    }
}
