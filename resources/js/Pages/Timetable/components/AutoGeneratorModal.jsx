import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Sparkles, 
    Clock, 
    AlertTriangle, 
    X, 
    CalendarCheck,
    BookOpen,
    CheckCircle2,
    Calendar
} from 'lucide-react';

export default function AutoGeneratorModal({
    isOpen,
    onClose,
    classes = [],
    subjects = [],
    staffMembers = [],
    timetables = [],
    academicYear = '2025-2026',
}) {
    if (!isOpen) return null;

    const basePeriods = [1, 2, 3, 4, 5, 6, 7, 8];
    const ALL_DAYS = [
        { id: 'monday', label: 'Mon' },
        { id: 'tuesday', label: 'Tue' },
        { id: 'wednesday', label: 'Wed' },
        { id: 'thursday', label: 'Thu' },
        { id: 'friday', label: 'Fri' },
        { id: 'saturday', label: 'Sat' },
        { id: 'sunday', label: 'Sun' },
    ];

    // Target Class / Section Selection
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    // Target Days Selection (Default: Monday - Friday)
    const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);

    // School Operational Time Limits
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('14:00');
    
    // Break Configuration
    const [breakAfterPeriod, setBreakAfterPeriod] = useState(4);
    const [breakDurationMinutes, setBreakDurationMinutes] = useState(30);

    // Period Durations (Default: 30 Mins)
    const [defaultDuration, setDefaultDuration] = useState(30);
    const [periodDurations, setPeriodDurations] = useState(
        basePeriods.reduce((acc, p) => ({ ...acc, [p]: 30 }), {})
    );

    // Period Assignments Matrix: { [periodNum]: { subject_id: '', staff_id: '' } }
    const [periodAssignments, setPeriodAssignments] = useState(
        basePeriods.reduce((acc, p) => ({
            ...acc,
            [p]: { subject_id: '', staff_id: '' }
        }), {})
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Reset local error and submission state when modal state changes
    useEffect(() => {
        if (isOpen) {
            setValidationError('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Convert HH:mm to minutes from midnight
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };

    // Convert minutes from midnight to 12hr time format (e.g. "08:30 AM")
    const minutesToTimeStr = (totalMinutes) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const formattedH = String(displayH).padStart(2, '0');
        const formattedM = String(m).padStart(2, '0');
        return `${formattedH}:${formattedM} ${period}`;
    };

    // Time Math & Schedule Breakdown
    const timingCalculation = useMemo(() => {
        const startMins = timeToMinutes(startTime);
        const endMins = timeToMinutes(endTime);
        const totalSchoolMins = Math.max(0, endMins - startMins);

        const breakMins = Number(breakDurationMinutes) || 0;
        const netAvailableMins = Math.max(0, totalSchoolMins - breakMins);

        const totalPeriodsMins = Object.values(periodDurations).reduce((sum, d) => sum + Number(d), 0);
        const remainingUnallocatedMins = netAvailableMins - totalPeriodsMins;

        let currentMins = startMins;
        const scheduleSlots = {};
        let breakStartTimeFormatted = '';
        let breakEndTimeFormatted = '';

        basePeriods.forEach((p) => {
            if (p === breakAfterPeriod + 1 && breakMins > 0) {
                const breakStart = currentMins;
                const breakEnd = currentMins + breakMins;
                breakStartTimeFormatted = minutesToTimeStr(breakStart);
                breakEndTimeFormatted = minutesToTimeStr(breakEnd);
                currentMins += breakMins;
            }

            const pDuration = Number(periodDurations[p]) || 0;
            const slotStart = currentMins;
            const slotEnd = currentMins + pDuration;

            scheduleSlots[p] = {
                startMins: slotStart,
                endMins: slotEnd,
                startTimeFormatted: minutesToTimeStr(slotStart),
                endTimeFormatted: minutesToTimeStr(slotEnd),
                duration: pDuration,
            };

            currentMins = slotEnd;
        });

        return {
            totalSchoolMins,
            breakMins,
            netAvailableMins,
            totalPeriodsMins,
            remainingUnallocatedMins,
            scheduleSlots,
            breakStartTimeFormatted,
            breakEndTimeFormatted,
            isOverflow: remainingUnallocatedMins < 0,
        };
    }, [startTime, endTime, breakDurationMinutes, breakAfterPeriod, periodDurations]);

    const availableSections = useMemo(() => {
        if (!selectedClassId) return [];
        const cls = classes.find((c) => String(c.id) === String(selectedClassId));
        return cls?.sections || [];
    }, [selectedClassId, classes]);

    // Day Checkbox Toggle
    const toggleDay = (dayId) => {
        setSelectedDays((prev) =>
            prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
        );
    };

    // Handle Default Duration Change across all periods
    const handleDefaultDurationChange = (minutes) => {
        const mins = Number(minutes) || 0;
        setDefaultDuration(mins);
        const updated = {};
        basePeriods.forEach((p) => {
            updated[p] = mins;
        });
        setPeriodDurations(updated);
    };

    // Handle Individual Period Duration Change
    const handlePeriodDurationChange = (period, minutes) => {
        setPeriodDurations((prev) => ({
            ...prev,
            [period]: Number(minutes) || 0,
        }));
    };

    // Update Subject or Teacher Selection for a specific period
    const handleAssignmentChange = (period, field, value) => {
        setPeriodAssignments((prev) => {
            const currentSlot = prev[period] || { subject_id: '', staff_id: '' };
            const updatedSlot = { ...currentSlot, [field]: value };

            // Auto-recommend first non-conflicting teacher if subject changes and staff isn't set
            if (field === 'subject_id' && value && !updatedSlot.staff_id) {
                const candidate = staffMembers.find(
                    (s) => Number(s.subject_id) === Number(value) && !isTeacherOccupied(s.id, period)
                );
                if (candidate) {
                    updatedSlot.staff_id = candidate.id;
                }
            }

            return {
                ...prev,
                [period]: updatedSlot,
            };
        });
    };

    /**
     * DYNAMIC TEACHER AVAILABILITY CHECKER
     * Checks if a teacher is occupied in existing timetables at the period's calculated time range
     */
    const isTeacherOccupied = (staffId, periodNum) => {
        if (!staffId || selectedDays.length === 0) return false;

        const slotTiming = timingCalculation.scheduleSlots[periodNum];
        if (!slotTiming) return false;

        return timetables.some((t) => {
            // Ignore current class/section being constructed
            const isSameClass = String(t.school_class_id) === String(selectedClassId);
            const isSameSection = selectedSectionId
                ? String(t.section_id) === String(selectedSectionId)
                : !t.section_id;

            if (isSameClass && isSameSection) {
                return false;
            }

            // Check matching staff and selected day
            if (Number(t.staff_id) === Number(staffId) && selectedDays.includes(t.day_of_week?.toLowerCase())) {
                if (Number(t.period_number) === Number(periodNum)) {
                    return true;
                }

                if (t.start_time && t.end_time) {
                    const existingStart = timeToMinutes(t.start_time);
                    const existingEnd = timeToMinutes(t.end_time);
                    return slotTiming.startMins < existingEnd && slotTiming.endMins > existingStart;
                }
            }
            return false;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');

        if (!selectedClassId) {
            setValidationError('Please select a target Class.');
            return;
        }

        if (selectedDays.length === 0) {
            setValidationError('Please select at least one day for schedule generation.');
            return;
        }

        if (timingCalculation.isOverflow) {
            setValidationError('Total period durations + break duration exceed total available school hours.');
            return;
        }

        // Validate that all periods have a subject & teacher selected
        for (const period of basePeriods) {
            const assignment = periodAssignments[period];
            if (!assignment?.subject_id) {
                setValidationError(`Please select a Subject for Period ${period}.`);
                return;
            }
            if (!assignment?.staff_id) {
                setValidationError(`Please select an available Teacher for Period ${period}.`);
                return;
            }
        }

        setIsSubmitting(true);

        // Format payload slots
        const finalSlots = basePeriods.map((period) => {
            const slotTiming = timingCalculation.scheduleSlots[period];
            const assignment = periodAssignments[period];

            return {
                school_class_id: selectedClassId,
                section_id: selectedSectionId || null,
                period_number: period,
                subject_id: assignment.subject_id,
                staff_id: assignment.staff_id,
                start_time: slotTiming.startTimeFormatted,
                end_time: slotTiming.endTimeFormatted,
                duration_minutes: slotTiming.duration,
            };
        });

        router.post(
            '/timetable/auto-generate',
            {
                class_id: selectedClassId,
                section_id: selectedSectionId || null,
                days: selectedDays,
                academic_year: academicYear,
                slots: finalSlots,
                break_after_period: breakAfterPeriod,
                break_duration: breakDurationMinutes,
                break_start_time: timingCalculation.breakStartTimeFormatted,
                break_end_time: timingCalculation.breakEndTimeFormatted,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setValidationError(Object.values(errors)[0] || 'Failed to generate timetable slots.');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-6xl w-full p-6 space-y-6 my-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Class Timetable Generator</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Configure daily operational hours, period slots, and non-conflicting teacher assignments.
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {validationError && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{validationError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* STEP 1: CLASS, SECTION & DAYS SELECTION */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold text-slate-700 mb-1 block">Target Class *</Label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value);
                                        setSelectedSectionId('');
                                    }}
                                    required
                                    className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">-- Choose Class --</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700 mb-1 block">Target Section (Optional)</Label>
                                <select
                                    value={selectedSectionId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    disabled={!selectedClassId || availableSections.length === 0}
                                    className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                                >
                                    <option value="">All Sections / Default</option>
                                    {availableSections.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            Section {sec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='flex items-center gap-8'>
                            <Label className="text-[14px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Applicable Days :
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_DAYS.map((day) => {
                                    const isChecked = selectedDays.includes(day.id);
                                    return (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => toggleDay(day.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                isChecked
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: SCHOOL TIMINGS & BREAK CONFIGURATION */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-600" /> Operational Timings & Break
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                                <Label className="text-[11px] font-bold text-slate-600 mb-1 block">School Start Time</Label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div>
                                <Label className="text-[11px] font-bold text-slate-600 mb-1 block">School End Time</Label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div>
                                <Label className="text-[11px] font-bold text-slate-600 mb-1 block">Break After Period</Label>
                                <select
                                    value={breakAfterPeriod}
                                    onChange={(e) => setBreakAfterPeriod(Number(e.target.value))}
                                    className="w-full h-9 px-2 text-xs rounded-lg border border-slate-200 font-medium bg-white"
                                >
                                    {basePeriods.slice(0, -1).map((p) => (
                                        <option key={p} value={p}>
                                            After Period {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-[11px] font-bold text-slate-600 mb-1 block">Break Duration (Mins)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={breakDurationMinutes}
                                    onChange={(e) => setBreakDurationMinutes(Number(e.target.value))}
                                    required
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: PERIOD-BY-PERIOD SUBJECT & TEACHER SELECTION MATRIX */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-indigo-600" /> Assign Subject & Teacher Per Period
                            </h3>

                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-600">Default Duration All:</span>
                                <Input
                                    type="number"
                                    value={defaultDuration}
                                    onChange={(e) => handleDefaultDurationChange(e.target.value)}
                                    className="w-16 h-7 text-xs font-bold text-center"
                                />
                                <span className="text-[11px] text-slate-500">mins</span>
                            </div>
                        </div>

                        {/* Period Rows List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {basePeriods.map((period) => {
                                const timing = timingCalculation.scheduleSlots[period];
                                const currentAssignment = periodAssignments[period] || { subject_id: '', staff_id: '' };

                                return (
                                    <React.Fragment key={period}>
                                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                            {/* Period Meta & Timing */}
                                            <div className="sm:col-span-3">
                                                <div className="text-xs font-black text-slate-900">Period {period}</div>
                                                <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
                                                    {timing?.startTimeFormatted} - {timing?.endTimeFormatted}
                                                </div>
                                            </div>

                                            {/* Period Duration input */}
                                            <div className="sm:col-span-2">
                                                <Label className="text-[11px] font-bold text-slate-500 block mb-0.5">Duration</Label>
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        min="10"
                                                        max="120"
                                                        value={periodDurations[period]}
                                                        onChange={(e) => handlePeriodDurationChange(period, e.target.value)}
                                                        className="h-8 text-xs font-bold bg-white"
                                                    />
                                                    <span className="text-[11px] text-slate-400">m</span>
                                                </div>
                                            </div>

                                            {/* Subject Dropdown */}
                                            <div className="sm:col-span-3">
                                                <Label className="text-[11px] font-bold text-slate-500 block mb-0.5">Subject *</Label>
                                                <select
                                                    value={currentAssignment.subject_id}
                                                    onChange={(e) => handleAssignmentChange(period, 'subject_id', e.target.value)}
                                                    required
                                                    className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">-- Choose Subject --</option>
                                                    {subjects.map((sub) => (
                                                        <option key={sub.id} value={sub.id}>
                                                            {sub.subject_name || sub.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Teacher Dropdown with Dynamic Conflict Filtering */}
                                            <div className="sm:col-span-4">
                                                <Label className="text-[11px] font-bold text-slate-500 block mb-0.5">Assigned Teacher *</Label>
                                                <select
                                                    value={currentAssignment.staff_id}
                                                    onChange={(e) => handleAssignmentChange(period, 'staff_id', e.target.value)}
                                                    required
                                                    className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="">-- Choose Teacher --</option>
                                                    {staffMembers.map((staff) => {
                                                        const occupied = isTeacherOccupied(staff.id, period);
                                                        return (
                                                            <option key={staff.id} value={staff.id} disabled={occupied}>
                                                                {staff.first_name} {staff.last_name} {occupied ? '(Occupied)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Insert Visual Break Indicator */}
                                        {period === Number(breakAfterPeriod) && breakDurationMinutes > 0 && (
                                            <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
                                                <span>RECESS / BREAK SLOT ({breakDurationMinutes} Mins: {timingCalculation.breakStartTimeFormatted} - {timingCalculation.breakEndTimeFormatted})</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* STEP 4: TIME DEDUCTION & ALLOCATION SUMMARY */}
                    <div
                        className={`p-3 rounded-xl border space-y-2 ${
                            timingCalculation.isOverflow
                                ? 'bg-red-50 border-red-200 text-red-900'
                                : 'bg-slate-900 text-white border-slate-800'
                        }`}
                    >
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="flex items-center gap-1.5">
                                <CalendarCheck className="w-4 h-4 text-indigo-400" /> Total Operational Time Deduction
                            </span>
                            <span className="text-[11px]">{timingCalculation.totalSchoolMins} mins total</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-center text-[11px]">
                            <div>
                                <div className="text-slate-400">Break Deducted</div>
                                <div className="font-extrabold text-amber-400">{timingCalculation.breakMins} Mins</div>
                            </div>
                            <div>
                                <div className="text-slate-400">Periods Total</div>
                                <div className="font-extrabold text-indigo-300">{timingCalculation.totalPeriodsMins} Mins</div>
                            </div>
                            <div>
                                <div className="text-slate-400">Remaining Buffer</div>
                                <div
                                    className={`font-extrabold ${
                                        timingCalculation.isOverflow ? 'text-red-400' : 'text-emerald-400'
                                    }`}
                                >
                                    {timingCalculation.remainingUnallocatedMins} Mins
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || timingCalculation.isOverflow}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            {isSubmitting ? (
                                'Saving Timetable...'
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Class Timetable
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}