import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import Dialog Modals
import SlotFormModal from './components/SlotFormModal';
import ClassTeacherModal from './components/ClassTeacherModal';
import AutoGeneratorModal from './components/AutoGeneratorModal';
import ChangeSchoolTimingsModal from './components/ChangeSchoolTimingsModal';
import BreakConfigModal from './components/BreakConfigModal';

import {
    Calendar,
    UserCheck,
    Sparkles,
    Clock,
    Utensils,
    PlusIcon
} from 'lucide-react';

/**
 * Helper: Converts HH:mm (or HH:mm:ss) into total minutes from midnight.
 */
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Helper: Formats total minutes from midnight into standard 12-hour AM/PM format.
 */
const minutesToFormattedTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const pad = (n) => String(n).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${pad(mins)} ${ampm}`;
};

/**
 * Recalculates start_time and end_time for all timetable slots dynamically.
 */
const recalculateTimetableSlots = (
    slots = [],
    breakAfterPeriod = 5,
    breakDurationMinutes = 30,
    dayStartTimeStr = "08:00",
    defaultPeriodDurationMinutes = 45
) => {
    if (!slots || slots.length === 0) return [];

    const nonBreakSlots = slots.filter((s) => !s.is_break);
    const periodsMap = {};
    let currentCursor = timeToMinutes(dayStartTimeStr);

    // Calculate start & end times for each distinct period in sequential order
    const sortedPeriods = Array.from(
        new Set(nonBreakSlots.map((s) => Number(s.period_number)))
    ).sort((a, b) => a - b);

    sortedPeriods.forEach((pNum) => {
        const startMins = currentCursor;
        const endMins = startMins + defaultPeriodDurationMinutes;

        periodsMap[pNum] = {
            start_time: minutesToFormattedTime(startMins),
            end_time: minutesToFormattedTime(endMins),
        };

        currentCursor = endMins;

        // Shift cursor forward if this period is directly followed by a break
        if (Number(pNum) === Number(breakAfterPeriod)) {
            currentCursor += breakDurationMinutes;
        }
    });

    return slots.map((slot) => {
        if (slot.is_break) return slot;

        const pNum = Number(slot.period_number);
        const calculatedTimes = periodsMap[pNum];

        if (!calculatedTimes) return slot;

        return {
            ...slot,
            start_time: calculatedTimes.start_time,
            end_time: calculatedTimes.end_time,
        };
    });
};

export default function TimetableIndex({
    timetables = [],
    classes = [],
    subjects = [],
    staffMembers = [],
    academicYear = '2025-2026',
    initialBreakConfig = null,
    initialSchoolTimings = null,
}) {
    const [activeTab, setActiveTab] = useState('class_view');
    const [selectedStaffId, setSelectedStaffId] = useState('');

    // Local State for Timetable Slots (Enables instant optimistic UI shifts)
    const [localTimetables, setLocalTimetables] = useState(timetables);

    // Sync state when Inertia reloads prop updates from backend
    useEffect(() => {
        setLocalTimetables(timetables);
    }, [timetables]);

    // 1. LOGIC: Extract Break Record info directly from timetables prop/state
    const detectedBreakRecord = useMemo(() => {
        return localTimetables.find((t) => Boolean(t.is_break));
    }, [localTimetables]);

    // Break Management State initialized with DB break record data
    const [breakConfig, setBreakConfig] = useState(() => {
        if (detectedBreakRecord) {
            // Note: If break is stored at period_number (e.g., 5), the afterPeriod is (period_number - 1)
            const breakPNum = Number(detectedBreakRecord.period_number) || 5;
            return {
                afterPeriod: breakPNum > 1 ? breakPNum - 1 : breakPNum,
                startTime: detectedBreakRecord.start_time || '10:30',
                endTime: detectedBreakRecord.end_time || '11:00',
                title: detectedBreakRecord.break_title || 'Recess / Lunch Break',
                durationMinutes: 30,
            };
        }
        return initialBreakConfig || {
            afterPeriod: 4,
            startTime: '10:30',
            endTime: '11:00',
            title: 'Recess / Lunch Break',
            durationMinutes: 30,
        };
    });

    // Update breakConfig state if DB record updates dynamically
    useEffect(() => {
        if (detectedBreakRecord) {
            const breakPNum = Number(detectedBreakRecord.period_number) || 5;
            setBreakConfig({
                afterPeriod: breakPNum > 1 ? breakPNum - 1 : breakPNum,
                startTime: detectedBreakRecord.start_time || '10:30',
                endTime: detectedBreakRecord.end_time || '11:00',
                title: detectedBreakRecord.break_title || 'Recess / Lunch Break',
                durationMinutes: 30,
            });
        }
    }, [detectedBreakRecord]);

    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

    // School Operational Timing State
    const [schoolTimings, setSchoolTimings] = useState(
        initialSchoolTimings || {
            startTime: '08:00',
            endTime: '14:00',
        }
    );
    const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);

    // External Modal States
    const [slotModalState, setSlotModalState] = useState({
        isOpen: false,
        slot: null,
        classId: '',
        sectionId: '',
        period: 1,
    });
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [generatorModalOpen, setGeneratorModalOpen] = useState(false);

    // 2. LOGIC: Dynamically calculate unique periods from non-break timetable slots
    const dynamicPeriods = useMemo(() => {
        const nonBreakSlots = localTimetables.filter((t) => !t.is_break);
        if (nonBreakSlots.length === 0) {
            return [1, 2, 3, 4, 5, 6, 7, 8]; // Fallback default
        }
        const periodSet = new Set(nonBreakSlots.map((t) => Number(t.period_number)));
        return Array.from(periodSet).sort((a, b) => a - b);
    }, [localTimetables]);

    // 3. LOGIC: Split dynamic periods around breakConfig.afterPeriod
    const periodsBeforeBreak = useMemo(() => {
        return dynamicPeriods.filter((p) => p <= Number(breakConfig.afterPeriod));
    }, [dynamicPeriods, breakConfig.afterPeriod]);

    const periodsAfterBreak = useMemo(() => {
        return dynamicPeriods.filter((p) => p > Number(breakConfig.afterPeriod));
    }, [dynamicPeriods, breakConfig.afterPeriod]);

    // Trigger optimistic UI recalculations upon break configuration updates
    const triggerOptimisticShift = (updatedBreakConfig = breakConfig, updatedSchoolTimings = schoolTimings) => {
        const breakDuration = updatedBreakConfig.durationMinutes || 30;
        const recalculated = recalculateTimetableSlots(
            localTimetables,
            updatedBreakConfig.afterPeriod,
            breakDuration,
            updatedSchoolTimings.startTime,
            45
        );
        setLocalTimetables(recalculated);
    };

    // Build flat list of Class & Section rows
    const classRows = [];
    classes.forEach((cls) => {
        if (cls.sections && cls.sections.length > 0) {
            cls.sections.forEach((sec) => {
                classRows.push({
                    key: `${cls.id}-${sec.id}`,
                    classId: cls.id,
                    sectionId: sec.id,
                    title: `${cls.name} (${sec.name})`,
                    isFullTime: Boolean(sec.is_full_time_teacher_class || cls.is_full_time_teacher_class),
                    classTeacherId: sec.class_teacher_id || cls.class_teacher_id,
                });
            });
        } else {
            classRows.push({
                key: `${cls.id}-default`,
                classId: cls.id,
                sectionId: '',
                title: cls.name,
                isFullTime: Boolean(cls.is_full_time_teacher_class),
                classTeacherId: cls.class_teacher_id,
            });
        }
    });

    // 4. LOGIC: Pass specific cell info to SlotFormModal when adding or editing
    const handleOpenAddSlot = (classId, sectionId, period) => {
        setSlotModalState({
            isOpen: true,
            slot: null,
            classId,
            sectionId,
            period,
        });
    };

    const handleOpenEditSlot = (slot) => {
        setSlotModalState({
            isOpen: true,
            slot,
            classId: slot.school_class_id,
            sectionId: slot.section_id,
            period: slot.period_number,
        });
    };

    const renderPeriodTd = (row, period) => {
        const slot = localTimetables.find(
            (t) =>
                !t.is_break &&
                String(t.school_class_id) === String(row.classId) &&
                (row.sectionId ? String(t.section_id) === String(row.sectionId) : true) &&
                Number(t.period_number) === Number(period)
        );

        if (!slot) {
            return (
                <td key={period} className="p-3 border-r border-slate-200 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[11px] text-slate-300 font-medium">Free</span>
                        <Button
                            onClick={() => handleOpenAddSlot(row.classId, row.sectionId, period)}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-indigo-600 hover:bg-indigo-50 px-2"
                        >
                            <PlusIcon className="w-3 h-3 mr-0.5" /> Assign
                        </Button>
                    </div>
                </td>
            );
        }

        return (
            <td key={period} className="p-2 border-r border-slate-200 bg-indigo-50/20 align-middle">
                <div
                    onClick={() => handleOpenEditSlot(slot)}
                    className="p-2.5 bg-white border border-indigo-200 rounded-xl shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-0.5 group"
                >
                    <div className="font-bold text-indigo-900 group-hover:text-indigo-600 text-xs">
                        {slot.subject?.subject_name || 'Subject'}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                        {slot.staff ? `${slot.staff.first_name} ${slot.staff.last_name}` : 'Unassigned'}
                    </div>
                    {slot.start_time && slot.end_time && (
                        <div className="text-[10px] text-indigo-600 font-bold">
                            {slot.start_time} - {slot.end_time}
                        </div>
                    )}
                    {slot.room_number && (
                        <div className="text-[10px] text-slate-400 font-medium">
                            Room: {slot.room_number}
                        </div>
                    )}
                </div>
            </td>
        );
    };

    return (
        <AppLayout title="Timetable Management">
            <Head title="Timetable Engine" />

            <div className="max-w-9xl mx-auto py-6 px-2 sm:px-6 lg:px-8 space-y-6">
                {/* Header Actions Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md border border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-indigo-600" /> Timetable Engine
                        </h1>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                            Manage schedules, breaks, and teacher assignments for {academicYear}.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        <Button
                            onClick={() => setIsTimingModalOpen(true)}
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                            <Clock className="w-4 h-4 mr-1.5 text-amber-600" /> Shift School Timings
                        </Button>
                        <Button
                            onClick={() => setIsBreakModalOpen(true)}
                            variant="outline"
                            className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold"
                        >
                            <Utensils className="w-4 h-4 mr-1.5 text-amber-600" /> Manage Break Time
                        </Button>
                        <Button
                            onClick={() => setTeacherModalOpen(true)}
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                        >
                            <UserCheck className="w-4 h-4 mr-1.5" /> Full-Time Teacher Config
                        </Button>
                        <Button
                            onClick={() => setGeneratorModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 mr-1.5" /> Auto-Generate Schedule
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-md border border-slate-200 grid grid-cols-2 max-w-full mb-6">
                        <TabsTrigger value="class_view" className="rounded-md font-bold text-md">
                            Master View
                        </TabsTrigger>
                        <TabsTrigger value="teacher_view" className="rounded-md font-bold text-md">
                            Teacher Workload View
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: MASTER VIEW */}
                    <TabsContent value="class_view" className="space-y-3">
                        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm border-collapse">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold uppercase text-xs w-72 min-w-[280px] border-r border-slate-800 sticky left-0 bg-slate-900 z-20">
                                                Class / Section
                                            </th>

                                            {/* Periods Before Break */}
                                            {periodsBeforeBreak.map((period) => (
                                                <th
                                                    key={period}
                                                    className="px-4 py-3.5 text-center font-bold uppercase text-xs border-r border-slate-800 min-w-[150px]"
                                                >
                                                    Period {period}
                                                </th>
                                            ))}

                                            {/* DYNAMIC BREAK COLUMN HEADER */}
                                            <th className="px-4 py-3.5 text-center font-bold uppercase text-xs bg-amber-500 text-slate-950 border-r border-amber-600 min-w-[140px]">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Utensils className="w-3.5 h-3.5" /> {breakConfig.title || 'Break Time'}
                                                </div>
                                            </th>

                                            {/* Periods After Break */}
                                            {periodsAfterBreak.map((period) => (
                                                <th
                                                    key={period}
                                                    className="px-4 py-3.5 text-center font-bold uppercase text-xs border-r border-slate-800 min-w-[150px]"
                                                >
                                                    Period {period}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {classRows.map((row) => {
                                            const teacher = staffMembers.find((s) => String(s.id) === String(row.classTeacherId));

                                            return (
                                                <tr key={row.key} className="hover:bg-slate-50/50">
                                                    {/* COLUMN 1: CLASS / SECTION NAME */}
                                                    <td className="px-6 py-4 bg-slate-100 font-bold text-slate-800 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 w-72 min-w-[280px]">
                                                        <div className="text-base font-extrabold text-slate-900">{row.title}</div>
                                                        {row.isFullTime ? (
                                                            <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase mt-1 inline-block tracking-wider">
                                                                Full-Day Teacher Mode
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                                                {teacher ? `Teacher: ${teacher.first_name} ${teacher.last_name}` : 'No Class Teacher'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* FULL-TIME CLASS TEACHER MODE DISPLAY */}
                                                    {row.isFullTime ? (
                                                        <>
                                                            <td
                                                                colSpan={periodsBeforeBreak.length}
                                                                className="p-3 bg-indigo-50/40 text-center border-r border-indigo-200 align-middle h-full"
                                                            >
                                                                <div className="flex flex-col items-center justify-center h-full min-h-[90px] p-4 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1">
                                                                    <UserCheck className="w-6 h-6 text-indigo-600" />
                                                                    <div className="font-black text-indigo-950 text-sm">
                                                                        {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned Class Teacher'}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 font-medium">
                                                                        Dedicated Full-Day Class Teacher (Morning Session)
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="p-3 bg-amber-100/70 border-r border-amber-300 text-center align-middle">
                                                                <div className="text-xs font-black text-amber-900 uppercase tracking-wider">{breakConfig.title}</div>
                                                                <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                                                                    {breakConfig.startTime} - {breakConfig.endTime}
                                                                </div>
                                                            </td>

                                                            <td
                                                                colSpan={periodsAfterBreak.length}
                                                                className="p-3 bg-indigo-50/40 text-center border-r border-indigo-200 align-middle h-full"
                                                            >
                                                                <div className="flex flex-col items-center justify-center h-full min-h-[90px] p-4 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1">
                                                                    <UserCheck className="w-6 h-6 text-indigo-600" />
                                                                    <div className="font-black text-indigo-950 text-sm">
                                                                        {teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned Class Teacher'}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 font-medium">
                                                                        Dedicated Full-Day Class Teacher (Afternoon Session)
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        /* REGULAR CLASS PERIOD SLOTS */
                                                        <>
                                                            {periodsBeforeBreak.map((period) => renderPeriodTd(row, period))}

                                                            <td className="p-3 bg-amber-50/80 border-r border-amber-200 text-center align-middle">
                                                                <div className="text-xs font-extrabold text-amber-900 uppercase">{breakConfig.title}</div>
                                                                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                                                    {breakConfig.startTime} - {breakConfig.endTime}
                                                                </div>
                                                            </td>

                                                            {periodsAfterBreak.map((period) => renderPeriodTd(row, period))}
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 2: TEACHER WORKLOAD VIEW */}
                    <TabsContent value="teacher_view">
                        <div className="space-y-5">
                            {/* Top Controls & Workload Summary */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="w-full md:w-80">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                                        Select Teacher / Staff Member
                                    </Label>
                                    <select
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        className="w-full h-11 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-hidden"
                                    >
                                        <option value="">-- Choose Teacher --</option>
                                        {staffMembers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name} ({s.designation || 'Teacher'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Workload Quick Stats Summary */}
                                {selectedStaffId && (() => {
                                    // Get all non-break slots for this teacher
                                    const rawSlots = localTimetables.filter(
                                        (t) => !t.is_break && Number(t.staff_id) === Number(selectedStaffId)
                                    );

                                    // Deduplicate by period + class + section + subject for accurate count
                                    const uniqueAssignedPeriods = new Set(
                                        rawSlots.map(
                                            (s) => `${s.period_number}-${s.school_class_id}-${s.section_id}-${s.subject_id}`
                                        )
                                    ).size;

                                    const isFullDayTeacher = classRows.some(
                                        (r) => r.isFullTime && Number(r.classTeacherId) === Number(selectedStaffId)
                                    );

                                    return (
                                        <div className="flex flex-wrap items-center gap-2.5 pt-1 md:pt-0">
                                            {isFullDayTeacher && (
                                                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                    Full-Day Teacher
                                                </div>
                                            )}
                                            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
                                                Assigned Periods: <span className="font-extrabold text-indigo-900">{uniqueAssignedPeriods}</span>
                                            </div>
                                            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/70 text-xs font-bold">
                                                Free Periods: <span className="font-extrabold text-slate-800">{Math.max(0, dynamicPeriods.length - uniqueAssignedPeriods)}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {!selectedStaffId ? (
                                <div className="bg-white py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
                                        i
                                    </div>
                                    <div className="text-slate-700 font-bold text-base">No Teacher Selected</div>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                        Select a staff member from the dropdown above to inspect their daily timetable schedule and teaching workload.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* 1. FULL-DAY TEACHER BANNER */}
                                    {(() => {
                                        const fullTimeClasses = classRows.filter(
                                            (r) => r.isFullTime && Number(r.classTeacherId) === Number(selectedStaffId)
                                        );

                                        if (fullTimeClasses.length === 0) return null;

                                        return (
                                            <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 border border-amber-200/80 rounded-2xl shadow-2xs space-y-2">
                                                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                                                    <UserCheck className="w-5 h-5 text-amber-600" />
                                                    Dedicated Full-Day Class Teacher Mode
                                                </div>
                                                <p className="text-xs text-amber-800/90 font-medium">
                                                    This teacher is assigned to conduct all learning sessions for the following class(es):
                                                </p>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {fullTimeClasses.map((cls) => (
                                                        <span
                                                            key={cls.key}
                                                            className="px-3 py-1 bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-2xs"
                                                        >
                                                            {cls.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* 2. DYNAMIC PERIOD TIMELINE CARDS */}
                                    <div className="space-y-3">
                                        {dynamicPeriods.map((period) => {
                                            // Fetch matching slots for this period
                                            const rawSlots = localTimetables.filter(
                                                (t) =>
                                                    !t.is_break &&
                                                    Number(t.staff_id) === Number(selectedStaffId) &&
                                                    Number(t.period_number) === Number(period)
                                            );

                                            // DEDUPLICATION LOGIC: Keep unique slots based on class, section, and subject
                                            const slots = rawSlots.reduce((acc, current) => {
                                                const exists = acc.some(
                                                    (item) =>
                                                        item.school_class_id === current.school_class_id &&
                                                        item.section_id === current.section_id &&
                                                        item.subject_id === current.subject_id
                                                );
                                                if (!exists) {
                                                    acc.push(current);
                                                }
                                                return acc;
                                            }, []);

                                            const fullTimeClasses = classRows.filter(
                                                (r) => r.isFullTime && Number(r.classTeacherId) === Number(selectedStaffId)
                                            );

                                            const sampleSlot = slots[0];

                                            return (
                                                <div
                                                    key={period}
                                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row items-stretch"
                                                >
                                                    {/* Left Side: Period Badge & Time Column */}
                                                    <div className="sm:w-44 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200/80 p-4 flex flex-col justify-center items-center text-center shrink-0">
                                                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                                            Slot #{period}
                                                        </span>
                                                        <span className="text-base font-black text-slate-800 mt-0.5">
                                                            Period {period}
                                                        </span>
                                                        {sampleSlot?.start_time && sampleSlot?.end_time && (
                                                            <span className="mt-2 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                                                {sampleSlot.start_time} - {sampleSlot.end_time}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Right Side: Class & Subject Details */}
                                                    <div className="flex-1 p-4 flex items-center bg-white">
                                                        {fullTimeClasses.length > 0 ? (
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-extrabold">
                                                                    Full-Day Session
                                                                </span>
                                                                <span className="font-bold text-slate-900 text-sm">
                                                                    {fullTimeClasses.map((c) => c.title).join(', ')}
                                                                </span>
                                                            </div>
                                                        ) : slots.length > 0 ? (
                                                            <div className="w-full space-y-2">
                                                                {slots.map((slot, idx) => (
                                                                    <div
                                                                        key={slot.id || idx}
                                                                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                                                            <div>
                                                                                <div className="text-sm font-extrabold text-slate-900">
                                                                                    {slot.schoolClass?.name} {slot.section?.name ? `(${slot.section.name})` : ''}
                                                                                </div>
                                                                                <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                                    Subject: <span className="text-indigo-900 font-bold">{slot.subject?.subject_name || 'N/A'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            {slot.room_number && (
                                                                                <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                                                                    Room: {slot.room_number}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold italic py-1">
                                                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                                Free Period — No teaching session scheduled
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* DIALOG MODALS */}
            <ChangeSchoolTimingsModal
                isOpen={isTimingModalOpen}
                onClose={() => setIsTimingModalOpen(false)}
                currentStartTime={schoolTimings.startTime}
                currentEndTime={schoolTimings.endTime}
                timetables={localTimetables}
                onSuccess={(updatedTimings) => {
                    setSchoolTimings(updatedTimings);
                    triggerOptimisticShift(breakConfig, updatedTimings);
                }}
            />

            <BreakConfigModal
                isOpen={isBreakModalOpen}
                onClose={() => setIsBreakModalOpen(false)}
                breakConfig={breakConfig}
                basePeriods={dynamicPeriods}
                slots={localTimetables}
                setSlots={setLocalTimetables}
                dayStartTime={schoolTimings.startTime}
                onSuccess={(updatedConfig) => {
                    setBreakConfig(updatedConfig);
                    triggerOptimisticShift(updatedConfig, schoolTimings);
                }}
            />

            <SlotFormModal
                isOpen={slotModalState.isOpen}
                onClose={() => setSlotModalState((prev) => ({ ...prev, isOpen: false }))}
                slot={slotModalState.slot}
                classId={slotModalState.classId}
                sectionId={slotModalState.sectionId}
                period={slotModalState.period}
                subjects={subjects}
                staffMembers={staffMembers}
            />

            <ClassTeacherModal
                isOpen={teacherModalOpen}
                onClose={() => setTeacherModalOpen(false)}
                classes={classes}
                staffMembers={staffMembers}
            />

            <AutoGeneratorModal
                isOpen={generatorModalOpen}
                onClose={() => setGeneratorModalOpen(false)}
                classes={classes}
                subjects={subjects}
                staffMembers={staffMembers}
            />
        </AppLayout>
    );
}