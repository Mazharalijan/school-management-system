import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Clock, 
    AlertCircle, 
    X, 
    CheckCircle2, 
    ArrowRight,
    RefreshCw 
} from 'lucide-react';

export default function ChangeSchoolTimingsModal({
    isOpen,
    onClose,
    currentStartTime = '08:00',
    currentEndTime = '14:00',
    timetables = [],
}) {
    if (!isOpen) return null;

    const [newStartTime, setNewStartTime] = useState(currentStartTime);
    const [newEndTime, setNewEndTime] = useState(currentEndTime);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Helpers to convert time to minutes from midnight and back
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const minutesToTimeStr = (totalMinutes) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const formattedH = String(displayH).padStart(2, '0');
        const formattedM = String(m).padStart(2, '0');
        return `${formattedH}:${formattedM} ${period}`;
    };

    // Calculate time difference (Delta) in minutes
    const timeDeltaInMinutes = useMemo(() => {
        const oldStartMins = timeToMinutes(currentStartTime);
        const newStartMins = timeToMinutes(newStartTime);
        return newStartMins - oldStartMins;
    }, [currentStartTime, newStartTime]);

    // Preview preview sample changes for Period 1
    const period1Preview = useMemo(() => {
        if (timetables.length === 0) return null;

        // Find sample Period 1 slot
        const sampleSlot = timetables.find((t) => Number(t.period_number) === 1);
        if (!sampleSlot || !sampleSlot.start_time || !sampleSlot.end_time) return null;

        // Extract raw minutes from sample
        let origStartMins, origEndMins;

        if (sampleSlot.start_time.includes('AM') || sampleSlot.start_time.includes('PM')) {
            // Parse formatted time string (e.g., 08:00 AM)
            const parts = sampleSlot.start_time.split(/[: ]/);
            let h = Number(parts[0]);
            const m = Number(parts[1]);
            const ampm = parts[2];
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            origStartMins = h * 60 + m;

            const endParts = sampleSlot.end_time.split(/[: ]/);
            let endH = Number(endParts[0]);
            const endM = Number(endParts[1]);
            const endAmPm = endParts[2];
            if (endAmPm === 'PM' && endH < 12) endH += 12;
            if (endAmPm === 'AM' && endH === 12) endH = 0;
            origEndMins = endH * 60 + endM;
        } else {
            origStartMins = timeToMinutes(sampleSlot.start_time);
            origEndMins = timeToMinutes(sampleSlot.end_time);
        }

        const newStartMins = origStartMins + timeDeltaInMinutes;
        const newEndMins = origEndMins + timeDeltaInMinutes;

        return {
            oldFormatted: `${minutesToTimeStr(origStartMins)} - ${minutesToTimeStr(origEndMins)}`,
            newFormatted: `${minutesToTimeStr(newStartMins)} - ${minutesToTimeStr(newEndMins)}`,
        };
    }, [timetables, timeDeltaInMinutes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (timeDeltaInMinutes === 0 && currentEndTime === newEndTime) {
            setErrorMsg('No time changes were made.');
            return;
        }

        setIsSubmitting(true);

        // Shift all timetables across all classes by timeDeltaInMinutes
        router.post(
            '/timetable/update-school-timings',
            {
                old_start_time: currentStartTime,
                new_start_time: newStartTime,
                old_end_time: currentEndTime,
                new_end_time: newEndTime,
                delta_minutes: timeDeltaInMinutes,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    setErrorMsg(Object.values(err)[0] || 'Failed to update school timings.');
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Shift School Timings</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Recalculates all class periods automatically.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                            <Label className="text-xs font-bold text-slate-700 block mb-1">New Start Time</Label>
                            <Input
                                type="time"
                                value={newStartTime}
                                onChange={(e) => setNewStartTime(e.target.value)}
                                required
                                className="h-9 text-xs bg-white"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-slate-700 block mb-1">New End Time</Label>
                            <Input
                                type="time"
                                value={newEndTime}
                                onChange={(e) => setNewEndTime(e.target.value)}
                                required
                                className="h-9 text-xs bg-white"
                            />
                        </div>
                    </div>

                    {/* Live Period Recalculation Preview */}
                    {period1Preview && (
                        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                            <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Auto-Shift Preview (Period 1)
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-1">
                                <span className="text-slate-500 line-through">{period1Preview.oldFormatted}</span>
                                <ArrowRight className="w-4 h-4 text-indigo-500" />
                                <span className="text-indigo-700 font-extrabold bg-indigo-100 px-2 py-0.5 rounded-md">
                                    {period1Preview.newFormatted}
                                </span>
                            </div>
                            <p className="text-[10px] text-indigo-600/80 italic mt-1">
                                Shift Difference: {timeDeltaInMinutes > 0 ? `+${timeDeltaInMinutes}` : timeDeltaInMinutes} Minutes across all periods.
                            </p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                            {isSubmitting ? (
                                'Updating Timetables...'
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Shift All Timetables
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}