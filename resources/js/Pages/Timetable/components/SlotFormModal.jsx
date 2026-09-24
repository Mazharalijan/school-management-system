import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';
import { Trash2, ShieldCheck, X } from 'lucide-react';

export default function SlotFormModal({
    isOpen,
    onClose,
    slot = null,
    classes = [],
    subjects = [],
    staffMembers = [],
    timetables = [],
    classId = '',
    sectionId = '',
    period = 1,
    dayOfWeek = 'monday',
    academicYear = '2025-2026',
}) {
    const isEdit = Boolean(slot?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        school_class_id: '',
        section_id: '',
        subject_id: '',
        staff_id: '',
        day_of_week: 'monday',
        period_number: 1,
        start_time: '08:00',
        end_time: '08:45',
        room_number: '',
        is_break: false,
        academic_year: '2025-2026',
    });

    useEffect(() => {
        if (isOpen) {
            if (slot) {
                setData({
                    school_class_id: slot.school_class_id || '',
                    section_id: slot.section_id || '',
                    subject_id: slot.subject_id || '',
                    staff_id: slot.staff_id || '',
                    day_of_week: slot.day_of_week || dayOfWeek,
                    period_number: slot.period_number || period,
                    start_time: slot.start_time || '08:00',
                    end_time: slot.end_time || '08:45',
                    room_number: slot.room_number || '',
                    is_break: Boolean(slot.is_break),
                    academic_year: slot.academic_year || academicYear,
                });
            } else {
                setData({
                    school_class_id: classId || (classes[0]?.id ? String(classes[0].id) : ''),
                    section_id: sectionId || '',
                    subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
                    staff_id: '',
                    day_of_week: dayOfWeek || 'monday',
                    period_number: period || 1,
                    start_time: '08:00',
                    end_time: '08:45',
                    room_number: '',
                    is_break: false,
                    academic_year: academicYear,
                });
            }
        } else {
            reset();
        }
    }, [isOpen, slot, classId, sectionId, dayOfWeek, period]);

    const targetClass = classes.find((c) => String(c.id) === String(data.school_class_id));
    const availableSections = targetClass?.sections || [];

    const availableStaff = staffMembers.filter((staff) => {
        const isFullTime = classes.some(
            (cls) =>
                (cls.is_full_time_teacher_class && String(cls.class_teacher_id) === String(staff.id)) ||
                cls.sections?.some(
                    (sec) => sec.is_full_time_teacher_class && String(sec.class_teacher_id) === String(staff.id)
                )
        );
        if (isFullTime) return false;

        const isBookedInOtherClass = timetables.some(
            (t) =>
                String(t.staff_id) === String(staff.id) &&
                t.day_of_week?.toLowerCase() === data.day_of_week?.toLowerCase() &&
                Number(t.period_number) === Number(data.period_number) &&
                String(t.id) !== String(slot?.id)
        );

        return !isBookedInOtherClass;
    });

    const staffFormatted = availableStaff.map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name} (${s.designation || 'Teacher'})`,
    }));

    const subjectsFormatted = subjects.map((sub) => ({
        id: sub.id,
        name: sub.subject_name || sub.name,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('timetable.slots.update', slot.id), { onSuccess: () => onClose() });
        } else {
            post(route('timetable.slots.store'), { onSuccess: () => onClose() });
        }
    };

    const handleDelete = () => {
        if (!slot?.id) return;
        if (confirm('Are you sure you want to remove this timetable slot?')) {
            router.delete(route('timetable.slots.destroy', slot.id), {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Timetable Slot' : 'Add Period Slot'}
            maxWidth="sm:max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Class *</Label>
                        <select
                            value={data.school_class_id}
                            onChange={(e) => setData({ ...data, school_class_id: e.target.value, section_id: '' })}
                            className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                        {errors.school_class_id && <span className="text-xs text-red-500">{errors.school_class_id}</span>}
                    </div>

                    {availableSections.length > 0 && (
                        <div>
                            <Label>Section</Label>
                            <select
                                value={data.section_id}
                                onChange={(e) => setData('section_id', e.target.value)}
                                className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Sections / Default</option>
                                {availableSections.map((sec) => (
                                    <option key={sec.id} value={sec.id}>
                                        Section {sec.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Day of Week *</Label>
                        <select
                            value={data.day_of_week}
                            onChange={(e) => setData('day_of_week', e.target.value)}
                            className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium capitalize"
                            required
                        >
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                                <option key={d} value={d}>
                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Period Number *</Label>
                        <Input
                            type="number"
                            min="1"
                            max="12"
                            value={data.period_number}
                            onChange={(e) => setData('period_number', e.target.value)}
                            className="mt-1"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Subject *</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.subject_id}
                            onChange={(val) => setData('subject_id', val)}
                            options={subjectsFormatted}
                            placeholder="Select Subject"
                            valueKey="id"
                            labelKey="name"
                        />
                        {errors.subject_id && <span className="text-xs text-red-500">{errors.subject_id}</span>}
                    </div>

                    <div>
                        <Label>Assigned Teacher</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.staff_id}
                            onChange={(val) => setData('staff_id', val)}
                            options={staffFormatted}
                            placeholder="Select Available Teacher"
                            valueKey="id"
                            labelKey="name"
                        />
                        {errors.staff_id && <span className="text-xs text-red-500 block">{errors.staff_id}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <Label>Start Time</Label>
                        <Input
                            type="time"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            className="mt-1 text-xs"
                        />
                    </div>
                    <div>
                        <Label>End Time</Label>
                        <Input
                            type="time"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            className="mt-1 text-xs"
                        />
                    </div>
                    <div>
                        <Label>Room Number</Label>
                        <Input
                            type="text"
                            value={data.room_number}
                            onChange={(e) => setData('room_number', e.target.value)}
                            placeholder="e.g. 101"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    {isEdit ? (
                        <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete Slot
                        </Button>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            {isEdit ? 'Update Slot' : 'Save Slot'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}