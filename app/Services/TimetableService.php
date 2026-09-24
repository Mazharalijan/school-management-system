<?php

namespace App\Services;

use App\Models\Timetable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimetableService
{
    /**
     * Shift all slot start/end times by the given minute delta.
     */
    public function shiftSchoolTimings(int $deltaMinutes): int
    {
        if ($deltaMinutes === 0) {
            return 0;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $startTimeExpression = DB::raw("time(start_time, '{$deltaMinutes} minutes')");
            $endTimeExpression = DB::raw("time(end_time, '{$deltaMinutes} minutes')");
        } elseif ($driver === 'pgsql') {
            $startTimeExpression = DB::raw("start_time + interval '{$deltaMinutes} minutes'");
            $endTimeExpression = DB::raw("end_time + interval '{$deltaMinutes} minutes'");
        } else { // mysql / mariadb
            $startTimeExpression = DB::raw("ADDTIME(start_time, SEC_TO_TIME({$deltaMinutes} * 60))");
            $endTimeExpression = DB::raw("ADDTIME(end_time, SEC_TO_TIME({$deltaMinutes} * 60))");
        }
        $query = Timetable::whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->update([
                'start_time' => $startTimeExpression,
                'end_time' => $endTimeExpression,
                'updated_at' => now(),
            ]);
            return $query;
    }

    /**
     * Check if a staff member is double-booked for a specific day and period.
     */
    public function hasTeacherConflict(?int $staffId, string $day, int $period, ?int $ignoreSlotId = null, string $academicYear = '2025-2026'): bool
    {
        if (! $staffId) {
            return false;
        }

        $query = Timetable::where('staff_id', $staffId)
            ->where('day_of_week', strtolower($day))
            ->where('period_number', $period)
            ->where('academic_year', $academicYear);

        if ($ignoreSlotId) {
            $query->where('id', '!=', $ignoreSlotId);
        }

        return $query->exists();
    }
}
