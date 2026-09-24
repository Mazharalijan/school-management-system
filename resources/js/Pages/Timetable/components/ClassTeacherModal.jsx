import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';
import { UserCheck, ShieldCheck, X } from 'lucide-react';

export default function ClassTeacherModal({
    isOpen,
    onClose,
    classes = [],
    staffMembers = [],
    selectedClassId = '',
    selectedSectionId = '',
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        school_class_id: '',
        section_id: '',
        class_teacher_id: '',
        is_full_time_teacher_class: false,
    });

    useEffect(() => {
        if (isOpen) {
            const cls = classes.find((c) => String(c.id) === String(selectedClassId));
            const sec = cls?.sections?.find((s) => String(s.id) === String(selectedSectionId));

            const currentTeacherId = sec ? sec.class_teacher_id : cls?.class_teacher_id;
            const isFullTime = sec ? Boolean(sec.is_full_time_teacher_class) : Boolean(cls?.is_full_time_teacher_class);

            setData({
                school_class_id: selectedClassId || (classes[0]?.id ? String(classes[0].id) : ''),
                section_id: selectedSectionId || '',
                class_teacher_id: currentTeacherId ? String(currentTeacherId) : '',
                is_full_time_teacher_class: isFullTime,
            });
        } else {
            reset();
        }
    }, [isOpen, selectedClassId, selectedSectionId, classes]);

    const targetClass = classes.find((c) => String(c.id) === String(data.school_class_id));
    const availableSections = targetClass?.sections || [];

    const handleClassChange = (val) => {
        const cls = classes.find((c) => String(c.id) === String(val));
        setData((prev) => ({
            ...prev,
            school_class_id: val,
            section_id: '',
            class_teacher_id: cls?.class_teacher_id ? String(cls.class_teacher_id) : '',
            is_full_time_teacher_class: Boolean(cls?.is_full_time_teacher_class),
        }));
    };

    const handleSectionChange = (val) => {
        const sec = availableSections.find((s) => String(s.id) === String(val));
        setData((prev) => ({
            ...prev,
            section_id: val,
            class_teacher_id: sec?.class_teacher_id ? String(sec.class_teacher_id) : (targetClass?.class_teacher_id ? String(targetClass.class_teacher_id) : ''),
            is_full_time_teacher_class: sec ? Boolean(sec.is_full_time_teacher_class) : Boolean(targetClass?.is_full_time_teacher_class),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('timetable.fulltime-teacher-config'), {
            onSuccess: () => onClose(),
        });
    };

    const staffFormatted = staffMembers.map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name} (${s.designation || 'Teacher'})`,
    }));

    const modalFooter = (
        <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={processing || !data.school_class_id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                <ShieldCheck className="w-4 h-4 mr-1" /> Save Class Teacher Config
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Class & Full-Time Teacher Assignment"
            footer={modalFooter}
            maxWidth="sm:max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <UserCheck className="w-4 h-4 text-amber-600" /> Full-Time Class Teacher Mode
                    </div>
                    <p>
                        Marking a class as full-time single teacher means one teacher handles all subjects for this class throughout the school day.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Select Class *</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.school_class_id}
                            onChange={handleClassChange}
                            options={classes}
                            placeholder="Select Class"
                            valueKey="id"
                            labelKey="name"
                        />
                        {errors.school_class_id && <span className="text-xs text-red-500">{errors.school_class_id}</span>}
                    </div>

                    {availableSections.length > 0 && (
                        <div>
                            <Label>Section (Optional)</Label>
                            <FilterSelect
                                className="mt-1"
                                value={data.section_id}
                                onChange={handleSectionChange}
                                options={availableSections}
                                placeholder="All Sections / Default"
                                valueKey="id"
                                labelKey="name"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div>
                        <Label>Assigned Class / Full-Time Teacher</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.class_teacher_id}
                            onChange={(val) => setData('class_teacher_id', val)}
                            options={staffFormatted}
                            placeholder="-- Select Teacher --"
                            valueKey="id"
                            labelKey="name"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <input
                            type="checkbox"
                            id="modal_is_full_time"
                            checked={data.is_full_time_teacher_class}
                            onChange={(e) => setData('is_full_time_teacher_class', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <Label htmlFor="modal_is_full_time" className="text-sm font-semibold text-slate-800 cursor-pointer">
                            One teacher teaches all subjects for this class (Full-Time Class Teacher)
                        </Label>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
