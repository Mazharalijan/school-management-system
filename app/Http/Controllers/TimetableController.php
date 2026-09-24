<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShiftSchoolTimingsRequest;
use App\Http\Requests\StoreTimetableSlotRequest;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\Timetable;
use App\Services\TimetableService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    public function __construct(protected TimetableService $timetableService) {}

    public function index(Request $request): Response
    {
        $academicYear = $request->get('academic_year', '2025-2026');

        $timetables = Timetable::with(['schoolClass', 'section', 'subject', 'staff'])
            ->where('academic_year', $academicYear)
            ->get();

        $classes = SchoolClass::with('sections')->get();
        $subjects = Subject::all();
        $staffMembers = Staff::all();

        return Inertia::render('Timetable/Index', [
            'timetables' => $timetables,
            'classes' => $classes,
            'subjects' => $subjects,
            'staffMembers' => $staffMembers,
            'academicYear' => $academicYear,
        ]);
    }

    public function autoGenerate(Request $request)
    {
        // 1. Validate Input
        $validated = $request->validate([
            'class_id' => ['required', 'exists:school_classes,id'],
            'section_id' => ['nullable', 'exists:sections,id'],
            'days' => ['required', 'array', 'min:1'],
            'days.*' => ['required', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'break_after_period' => ['required', 'integer', 'min:1'],
            'break_duration' => ['required', 'integer', 'min:0'],
            'break_start_time' => ['nullable', 'string'],
            'break_end_time' => ['nullable', 'string'],
            'slots' => ['required', 'array', 'min:1'],
            'slots.*.school_class_id' => ['required', 'exists:school_classes,id'],
            'slots.*.section_id' => ['nullable', 'exists:sections,id'],
            'slots.*.period_number' => ['required', 'integer', 'min:1'],
            'slots.*.subject_id' => ['required', 'exists:subjects,id'],
            'slots.*.staff_id' => ['required', 'exists:staff,id'],
            'slots.*.start_time' => ['required', 'string'],
            'slots.*.end_time' => ['required', 'string'],
            'slots.*.duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $classId = $validated['class_id'];
        $sectionId = $validated['section_id'] ?? null;
        $days = $validated['days'];
        $academicYear = $validated['academic_year'] ?? '2025-2026';
        $slots = $validated['slots'];

        // Format times into 'HH:MM:SS' for database storage
        $formatTime = function ($timeStr) {
            if (! $timeStr) {
                return null;
            }

            return date('H:i:s', strtotime($timeStr));
        };

        // 2. Teacher Conflict Checking Across Selected Days
        foreach ($days as $day) {
            foreach ($slots as $slot) {
                if (! empty($slot['staff_id'])) {
                    $hasConflict = $this->timetableService->hasTeacherConflict(
                        $slot['staff_id'],
                        $day,
                        $slot['period_number'],
                        null,
                        $academicYear
                    );

                    // Verify if conflict isn't just the existing record for the exact same class/section
                    if ($hasConflict) {
                        $startTime24 = $formatTime($slot['start_time']);
                        $endTime24 = $formatTime($slot['end_time']);

                        $externalConflict = Timetable::where('staff_id', $slot['staff_id'])
                            ->where('day_of_week', $day)
                            ->where('academic_year', $academicYear)
                            ->where('is_break', false)
                            ->where(function ($q) use ($startTime24, $endTime24) {
                                $q->where('start_time', '<', $endTime24)
                                    ->where('end_time', '>', $startTime24);
                            })
                            ->where(function ($q) use ($classId, $sectionId) {
                                $q->where('school_class_id', '!=', $classId);
                                if ($sectionId) {
                                    $q->orWhere('section_id', '!=', $sectionId);
                                }
                            })
                            ->exists();

                        if ($externalConflict) {
                            $staff = Staff::find($slot['staff_id']);
                            $staffName = $staff ? "{$staff->first_name} {$staff->last_name}" : 'Teacher';
                            throw ValidationException::withMessages([
                                'slots' => "{$staffName} is already assigned to another class on ".ucfirst($day)." during Period {$slot['period_number']}.",
                            ]);
                        }
                    }
                }
            }
        }

        // 3. Database Sync via Transaction using updateOrCreate
        DB::transaction(function () use ($classId, $sectionId, $days, $academicYear, $slots, $validated, $formatTime) {
            foreach ($days as $day) {
                // Upsert standard period slots
                foreach ($slots as $slot) {
                    Timetable::updateOrCreate(
                        [
                            'school_class_id' => $classId,
                            'section_id' => $sectionId,
                            'day_of_week' => $day,
                            'period_number' => $slot['period_number'],
                            'academic_year' => $academicYear,
                        ],
                        [
                            'subject_id' => $slot['subject_id'],
                            'staff_id' => $slot['staff_id'],
                            'start_time' => $formatTime($slot['start_time']),
                            'end_time' => $formatTime($slot['end_time']),
                            'is_break' => false,
                            'break_title' => null,
                        ]
                    );
                }

                // Upsert recess / break slot if configured
                if (! empty($validated['break_duration']) && $validated['break_duration'] > 0) {
                    Timetable::updateOrCreate(
                        [
                            'school_class_id' => $classId,
                            'section_id' => $sectionId,
                            'day_of_week' => $day,
                            'period_number' => $validated['break_after_period'],
                            'academic_year' => $academicYear,
                        ],
                        [
                            'subject_id' => null,
                            'staff_id' => null,
                            'start_time' => $formatTime($validated['break_start_time'] ?? null),
                            'end_time' => $formatTime($validated['break_end_time'] ?? null),
                            'is_break' => true,
                            'break_title' => 'Recess / Break',
                        ]
                    );
                }
            }
        });

        return back()->with('success', 'Timetable auto-generated and saved successfully.');
    }

    public function storeSlot(StoreTimetableSlotRequest $request)
    {
        $validated = $request->validated();

        // Check teacher assignment overlap
        if (! empty($validated['staff_id'])) {
            $conflict = $this->timetableService->hasTeacherConflict(
                $validated['staff_id'],
                $validated['day_of_week'] ?? 'monday',
                $validated['period_number'],
                null,
                $validated['academic_year'] ?? '2025-2026'
            );

            if ($conflict) {
                return back()->withErrors(['staff_id' => 'This teacher is already assigned to another class during this period.']);
            }
        }

        Timetable::updateOrCreate(
            [
                'school_class_id' => $validated['school_class_id'],
                'section_id' => $validated['section_id'] ?? null,
                'day_of_week' => $validated['day_of_week'] ?? 'monday',
                'period_number' => $validated['period_number'],
                'academic_year' => $validated['academic_year'] ?? '2025-2026',
            ],
            $validated
        );

        return back()->with('success', 'Timetable slot assigned successfully.');
    }

    public function updateSchoolTimings(ShiftSchoolTimingsRequest $request)
    {
        $deltaMinutes = (int) $request->input('delta_minutes');
        // $academicYear = $request->input('academic_year', '2025-2026');

        $updatedSlots = $this->timetableService->shiftSchoolTimings($deltaMinutes);

        return redirect()->back()->with('success', 'School timings updated successfully.');
    }

    public function updateFullTimeTeacherConfig(Request $request)
    {
        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'is_full_time_teacher_class' => 'required|boolean',
            'class_teacher_id' => [
                $request->is_full_time_teacher_class ? 'required' : 'nullable',
                'exists:staff,id',
            ],
        ]);

        $isFullTime = (bool) $request->is_full_time_teacher_class;
        $teacherId = $request->class_teacher_id;
        $classId = $request->school_class_id;
        $sectionId = $request->section_id;

        // 1. Target either Section or SchoolClass
        if ($sectionId) {
            $entity = Section::findOrFail($sectionId);
        } else {
            $entity = SchoolClass::findOrFail($classId);
        }

        // 2. CONFLICT CHECK: Validate teacher availability if assigning a full-time teacher
        if ($isFullTime && $teacherId) {

            // Check A: Is this teacher already assigned to any standard period slots?
            $assignedPeriodSlots = Timetable::where('staff_id', $teacherId)
                ->where('is_break', false)
                ->where(function ($query) use ($classId, $sectionId) {
                    // Ignore slots already belonging to this current class/section
                    $query->where('school_class_id', '!=', $classId)
                        ->orWhere('section_id', '!=', $sectionId);
                })
                ->exists();

            if ($assignedPeriodSlots) {
                throw ValidationException::withMessages([
                    'class_teacher_id' => 'This teacher is already assigned to active subject periods in another class timetable.',
                ]);
            }

            // Check B: Is this teacher already set as full-time teacher in another Section?
            $anotherFullTimeSection = Section::where('class_teacher_id', $teacherId)
                ->where('is_full_time_teacher_class', true)
                ->where('id', '!=', $sectionId)
                ->exists();

            // Check C: Is this teacher already set as full-time teacher in another SchoolClass?
            $anotherFullTimeClass = SchoolClass::where('class_teacher_id', $teacherId)
                ->where('is_full_time_teacher_class', true)
                ->where('id', '!=', $classId)
                ->exists();

            if ($anotherFullTimeSection || $anotherFullTimeClass) {
                throw ValidationException::withMessages([
                    'class_teacher_id' => 'This teacher is already designated as a Full-Time Class Teacher for another class or section.',
                ]);
            }
        }

        // 3. Update the Class / Section model
        $entity->update([
            'is_full_time_teacher_class' => $isFullTime,
            'class_teacher_id' => $teacherId,
        ]);

        // 4. TIMETABLE CLEANUP: Clear out conflicting entries
        if ($isFullTime) {
            // Deleting old period-by-period subject assignments since the teacher covers the full day
            Timetable::where('school_class_id', $classId)
                ->when($sectionId, function ($q) use ($sectionId) {
                    $q->where('section_id', $sectionId);
                })
                ->where('is_break', false)
                ->delete();
        }

        return back()->with('success', 'Full-time teacher configuration updated successfully.');
    }

    public function updateBreakConfig(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'afterPeriod' => 'required|integer|min:1',
        ]);

        $selectedAfterPeriod = (int) $validated['afterPeriod']; // e.g. 4
        $breakTitle = $validated['title'];

        DB::transaction(function () use ($selectedAfterPeriod, $breakTitle) {
            // 1. Calculate existing break duration (default: 30 mins)
            $existingBreak = Timetable::where('is_break', true)->first();

            $breakDurationMinutes = 30;
            if ($existingBreak && $existingBreak->start_time && $existingBreak->end_time) {
                $breakDurationMinutes = Carbon::parse($existingBreak->start_time)
                    ->diffInMinutes(Carbon::parse($existingBreak->end_time));

                if ($breakDurationMinutes <= 0) {
                    $breakDurationMinutes = 30;
                }
            }

            // 2. Fetch standard day start time from Period 1 (or default to 08:00:00)
            $firstPeriod = Timetable::where('period_number', 1)
                ->where('is_break', false)
                ->first();

            $dayStartTime = $firstPeriod && $firstPeriod->start_time
                ? Carbon::parse($firstPeriod->start_time)
                : Carbon::createFromTimeString('08:00:00');

            // 3. Get all unique teaching periods currently in DB sorted sequentially (e.g., 1 to 8)
            $distinctPeriods = Timetable::where('is_break', false)
                ->pluck('period_number')
                ->unique()
                ->sort();

            $currentCursor = clone $dayStartTime;

            // 4. Recalculate start_time & end_time for all teaching periods, inserting break after $selectedAfterPeriod
            foreach ($distinctPeriods as $pNum) {
                $sampleSlot = Timetable::where('period_number', $pNum)
                    ->where('is_break', false)
                    ->first();

                $periodDuration = 45; // Default length
                if ($sampleSlot && $sampleSlot->start_time && $sampleSlot->end_time) {
                    $measuredDuration = Carbon::parse($sampleSlot->start_time)
                        ->diffInMinutes(Carbon::parse($sampleSlot->end_time));

                    if ($measuredDuration > 0) {
                        $periodDuration = $measuredDuration;
                    }
                }

                $newStart = clone $currentCursor;
                $newEnd = (clone $newStart)->addMinutes($periodDuration);

                // Update all non-break slots for this period without altering period_number
                Timetable::where('period_number', $pNum)
                    ->where('is_break', false)
                    ->update([
                        'start_time' => $newStart->format('H:i:s'),
                        'end_time' => $newEnd->format('H:i:s'),
                    ]);

                $currentCursor = $newEnd;

                // 5. If this is the period after which the break sits, calculate and assign break times
                if ($pNum === $selectedAfterPeriod) {
                    $breakStart = clone $currentCursor;
                    $breakEnd = (clone $breakStart)->addMinutes($breakDurationMinutes);

                    Timetable::where('is_break', true)->update([
                        'break_title' => $breakTitle,
                        'period_number' => $selectedAfterPeriod, // Break belongs directly after this period
                        'start_time' => $breakStart->format('H:i:s'),
                        'end_time' => $breakEnd->format('H:i:s'),
                    ]);

                    // Resume next class period after break finishes
                    $currentCursor = $breakEnd;
                }
            }
        });

        return back()->with('success', 'Break position and class schedule updated successfully.');
    }
}
