import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPen, UserPlus, UserX  } from 'lucide-react';

export default function StudentFormModal({
    isOpen,
    onClose,
    student = null,
    classes = [],
    sections = [],
}) {
    const isEditMode = Boolean(student);

    const form = useForm({
        school_class_id: '',
        section_id: '',
        roll_number: '',
        first_name: '',
        last_name: '',
        gender: 'male',
        date_of_birth: '',
        guardian_name: '',
        guardian_relation: '',
        guardian_phone: '',
    });

    // Populate or reset form fields whenever modal opens or student target changes
    useEffect(() => {
        if (student) {
            form.setData({
                school_class_id: student.current_enrollment?.school_class_id || '',
                section_id: student.current_enrollment?.section_id || '',
                roll_number: student.current_enrollment?.roll_number || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                gender: student.gender || 'male',
                date_of_birth: student.date_of_birth || '',
                guardian_name: student.guardian_name || '',
                guardian_relation: student.guardian_relation || '',
                guardian_phone: student.guardian_phone || '',
            });
        } else {
            form.reset();
        }
        form.clearErrors();
    }, [student, isOpen]);

    const getSectionsForClass = (classId) => {
        if (!classId) return [];
        return sections.filter(
            (sec) => String(sec.school_class_id) === String(classId)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            form.put(route('students.update', student.id), {
                onSuccess: () => onClose(),
            });
        } else {
            form.post(route('students.store'), {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Student Profile' : 'New Student Admission'}
            maxWidth="sm:max-w-5xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <UserX />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="student-form"
                        disabled={form.processing}
                        className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                        {form.processing ? (
                            isEditMode ? 'Updating...' : 'Admitting...'
                        ) : isEditMode ? (
                            <>
                                <UserPen /> Update Student
                            </>
                        ) : (
                            <>
                                <UserPlus /> Save & Admit Student
                            </>
                        )}

                    </Button>
                </>
            }
        >
            <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Academic Placement */}
                <div className="border-b pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Academic Placement
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                            <Label htmlFor="school_class_id">Class *</Label>
                            <select
                                id="school_class_id"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                value={form.data.school_class_id}
                                onChange={(e) => {
                                    form.setData({
                                        ...form.data,
                                        school_class_id: e.target.value,
                                        section_id: '',
                                    });
                                }}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors?.school_class_id && (
                                <span className="text-xs text-red-500">
                                    {form.errors.school_class_id}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="section_id">Section *</Label>
                            <select
                                id="section_id"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white disabled:bg-slate-100"
                                value={form.data.section_id}
                                onChange={(e) =>
                                    form.setData('section_id', e.target.value)
                                }
                                disabled={!form.data.school_class_id}
                                required
                            >
                                <option value="">Select Section</option>
                                {getSectionsForClass(
                                    form.data.school_class_id
                                ).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors?.section_id && (
                                <span className="text-xs text-red-500">
                                    {form.errors.section_id}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="roll_number">Roll Number</Label>
                            <Input
                                id="roll_number"
                                placeholder="e.g. 101"
                                value={form.data.roll_number}
                                onChange={(e) =>
                                    form.setData('roll_number', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="border-b pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Personal Information
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={form.data.first_name}
                                onChange={(e) =>
                                    form.setData('first_name', e.target.value)
                                }
                                required
                            />
                            {form.errors?.first_name && (
                                <span className="text-xs text-red-500">
                                    {form.errors.first_name}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={form.data.last_name}
                                onChange={(e) =>
                                    form.setData('last_name', e.target.value)
                                }
                                required
                            />
                            {form.errors?.last_name && (
                                <span className="text-xs text-red-500">
                                    {form.errors.last_name}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender *</Label>
                            <select
                                id="gender"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                value={form.data.gender}
                                onChange={(e) =>
                                    form.setData('gender', e.target.value)
                                }
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="date_of_birth">Date of Birth *</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={form.data.date_of_birth}
                                onChange={(e) =>
                                    form.setData('date_of_birth', e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Guardian Contact */}
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Guardian Contact
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                            <Label htmlFor="guardian_name">Guardian Name *</Label>
                            <Input
                                id="guardian_name"
                                value={form.data.guardian_name}
                                onChange={(e) =>
                                    form.setData('guardian_name', e.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="guardian_relation">Relation *</Label>
                            <Input
                                id="guardian_relation"
                                placeholder="Father, Mother..."
                                value={form.data.guardian_relation}
                                onChange={(e) =>
                                    form.setData(
                                        'guardian_relation',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="guardian_phone">Phone Number *</Label>
                            <Input
                                id="guardian_phone"
                                placeholder="+92 300 0000000"
                                value={form.data.guardian_phone}
                                onChange={(e) =>
                                    form.setData('guardian_phone', e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}