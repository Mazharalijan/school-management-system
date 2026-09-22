import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function StudentFields({ form, classes = [], sections = [] }) {
    const getSectionsForClass = (classId) => {
        if (!classId) return [];
        return sections.filter((sec) => String(sec.school_class_id) === String(classId));
    };

    return (
        <div className="space-y-4">
            {/* Academic Placement */}
            <div className="border-b pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Placement</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <div>
                        <Label htmlFor="school_class_id">Class *</Label>
                        <select
                            id="school_class_id"
                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                            value={form.data.school_class_id || ''}
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
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {form.errors?.school_class_id && <span className="text-xs text-red-500">{form.errors.school_class_id}</span>}
                    </div>

                    <div>
                        <Label htmlFor="section_id">Section *</Label>
                        <select
                            id="section_id"
                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white disabled:bg-slate-100"
                            value={form.data.section_id || ''}
                            onChange={(e) => form.setData('section_id', e.target.value)}
                            disabled={!form.data.school_class_id}
                            required
                        >
                            <option value="">Select Section</option>
                            {getSectionsForClass(form.data.school_class_id).map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {form.errors?.section_id && <span className="text-xs text-red-500">{form.errors.section_id}</span>}
                    </div>

                    <div>
                        <Label htmlFor="roll_number">Roll Number</Label>
                        <Input
                            id="roll_number"
                            placeholder="e.g. 101"
                            value={form.data.roll_number || ''}
                            onChange={(e) => form.setData('roll_number', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="border-b pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Information</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                            id="first_name"
                            value={form.data.first_name || ''}
                            onChange={(e) => form.setData('first_name', e.target.value)}
                            required
                        />
                        {form.errors?.first_name && <span className="text-xs text-red-500">{form.errors.first_name}</span>}
                    </div>

                    <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                            id="last_name"
                            value={form.data.last_name || ''}
                            onChange={(e) => form.setData('last_name', e.target.value)}
                            required
                        />
                        {form.errors?.last_name && <span className="text-xs text-red-500">{form.errors.last_name}</span>}
                    </div>

                    <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <select
                            id="gender"
                            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                            value={form.data.gender || 'male'}
                            onChange={(e) => form.setData('gender', e.target.value)}
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
                            value={form.data.date_of_birth || ''}
                            onChange={(e) => form.setData('date_of_birth', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Guardian Contact */}
            <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guardian Contact</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <div>
                        <Label htmlFor="guardian_name">Guardian Name *</Label>
                        <Input
                            id="guardian_name"
                            value={form.data.guardian_name || ''}
                            onChange={(e) => form.setData('guardian_name', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="guardian_relation">Relation *</Label>
                        <Input
                            id="guardian_relation"
                            placeholder="Father, Mother..."
                            value={form.data.guardian_relation || ''}
                            onChange={(e) => form.setData('guardian_relation', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="guardian_phone">Phone Number *</Label>
                        <Input
                            id="guardian_phone"
                            placeholder="+92 300 0000000"
                            value={form.data.guardian_phone || ''}
                            onChange={(e) => form.setData('guardian_phone', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}