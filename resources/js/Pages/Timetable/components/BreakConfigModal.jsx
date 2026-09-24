import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, X, CheckCircle2 } from 'lucide-react';
import { recalculateTimings } from '@/lib/timetableUtils';

export default function BreakConfigModal({
    isOpen,
    onClose,
    breakConfig = { title: 'Recess / Break', afterPeriod: 4, durationMinutes: 30 },
    basePeriods = [1, 2, 3, 4, 5, 6, 7, 8],
    slots = [],
    setSlots, // State updater passed from parent page
    dayStartTime = "08:00",
}) {
    if (!isOpen) return null;

    const { data, setData, post, processing } = useForm({
        title: breakConfig.title ?? 'Recess / Break',
        afterPeriod: breakConfig.afterPeriod ?? 4,
    });

    const handlePeriodChange = (newAfterPeriod) => {
        const selectedPeriod = Number(newAfterPeriod);
        setData('afterPeriod', selectedPeriod);

        // Optimistically recalculate local slots state immediately
        if (slots.length > 0 && setSlots) {
            const recalculated = recalculateTimings(
                slots,
                selectedPeriod,
                breakConfig.durationMinutes || 30,
                dayStartTime
            );
            setSlots(recalculated);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Perform final state calculation before backend dispatch
        const recalculated = recalculateTimings(
            slots,
            Number(data.afterPeriod),
            breakConfig.durationMinutes || 30,
            dayStartTime
        );
        if (setSlots) setSlots(recalculated);

        post('/timetable/update-break-config', {
            preserveScroll: true,
            data: {
                ...data,
                slots: recalculated, // Send recalculated client times to backend
            },
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Break Schedule Setup</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Configure recess title and placement period.
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Break Title */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 block">Break Title</Label>
                        <Input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Recess / Lunch Break"
                            required
                            className="h-9 text-xs"
                        />
                    </div>

                    {/* Place Break After Period */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 block">Place Break After Period</Label>
                        <select
                            value={data.afterPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            {basePeriods.slice(0, -1).map((p) => (
                                <option key={p} value={p}>
                                    After Period {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 block">
                            Live Schedule Impact
                        </span>
                        <p className="text-xs font-medium">
                            Periods 1 to {data.afterPeriod} remain unchanged. Periods {Number(data.afterPeriod) + 1}+ will automatically shift forward by <strong>{breakConfig.durationMinutes || 30} minutes</strong>.
                        </p>
                    </div>

                    {/* Modal Controls */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                            {processing ? (
                                'Saving & Shifting...'
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Save Break Settings
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}