import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';
import { Calendar, Plus, Trash2, Edit, X } from 'lucide-react';

export default function Index({ schedules, examSessions = [], classes = [], subjects = [], filters = {} }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        exam_session_id: '',
        school_class_id: '',
        subject_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        total_marks: 100,
        passing_marks: 33,
    });

    const handleFilterChange = (key, value) => {
        router.get(
            route('schedules.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handleOpenEdit = (schedule) => {
        setEditingSchedule(schedule);
        setData({
            exam_session_id: schedule.exam_session_id || '',
            school_class_id: schedule.school_class_id || '',
            subject_id: schedule.subject_id || '',
            exam_date: schedule.exam_date || '',
            start_time: schedule.start_time || '',
            end_time: schedule.end_time || '',
            total_marks: schedule.total_marks || 100,
            passing_marks: schedule.passing_marks || 33,
        });
        setIsCreating(true);
    };

    const handleCloseForm = () => {
        setIsCreating(false);
        setEditingSchedule(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSchedule) {
            put(route('schedules.update', editingSchedule.id), {
                onSuccess: () => handleCloseForm(),
            });
        } else {
            post(route('schedules.store'), {
                onSuccess: () => handleCloseForm(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this schedule entry?')) {
            router.delete(route('schedules.destroy', id));
        }
    };

    return (
        <AppLayout title="Exam Schedules & Date Sheet">
            <Head title="Exam Schedules" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            Exam Schedules & Date Sheet
                        </h1>
                        <p className="text-sm text-slate-500">Configure exam dates, timings, and class subject schedules.</p>
                    </div>
                    <Button
                        onClick={() => {
                            if (isCreating) {
                                handleCloseForm();
                            } else {
                                setIsCreating(true);
                            }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isCreating ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isCreating ? 'Cancel' : 'Add Schedule Entry'}
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs font-bold text-slate-600 uppercase">Filter by Session</Label>
                        <select
                            value={filters.exam_session_id || ''}
                            onChange={(e) => handleFilterChange('exam_session_id', e.target.value)}
                            className="mt-1 w-full rounded-lg border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- All Exam Sessions --</option>
                            {examSessions.map((s) => (
                                <option key={s.id} value={s.id}>{s.title} ({s.session_year})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-slate-600 uppercase">Filter by Class</Label>
                        <select
                            value={filters.school_class_id || ''}
                            onChange={(e) => handleFilterChange('school_class_id', e.target.value)}
                            className="mt-1 w-full rounded-lg border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- All Classes --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Schedule Form */}
                {isCreating && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">
                            {editingSchedule ? 'Edit Schedule Entry' : 'Add New Exam Schedule'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Exam Session *</Label>
                                    <FilterSelect
                                        className="mt-1"
                                        value={data.exam_session_id}
                                        onChange={(val) => setData('exam_session_id', val)}
                                        options={examSessions}
                                        placeholder="Select Session"
                                        valueKey="id"
                                        labelKey="title"
                                    />
                                    {errors.exam_session_id && <span className="text-xs text-red-500">{errors.exam_session_id}</span>}
                                </div>

                                <div>
                                    <Label>Class *</Label>
                                    <FilterSelect
                                        className="mt-1"
                                        value={data.school_class_id}
                                        onChange={(val) => setData('school_class_id', val)}
                                        options={classes}
                                        placeholder="Select Class"
                                        valueKey="id"
                                        labelKey="name"
                                    />
                                    {errors.school_class_id && <span className="text-xs text-red-500">{errors.school_class_id}</span>}
                                </div>

                                <div>
                                    <Label>Subject *</Label>
                                    <FilterSelect
                                        className="mt-1"
                                        value={data.subject_id}
                                        onChange={(val) => setData('subject_id', val)}
                                        options={subjects}
                                        placeholder="Select Subject"
                                        valueKey="id"
                                        labelKey="subject_name"
                                    />
                                    {errors.subject_id && <span className="text-xs text-red-500">{errors.subject_id}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="exam_date">Exam Date *</Label>
                                    <Input
                                        id="exam_date"
                                        type="date"
                                        value={data.exam_date}
                                        onChange={(e) => setData('exam_date', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.exam_date && <span className="text-xs text-red-500">{errors.exam_date}</span>}
                                </div>

                                <div>
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.start_time && <span className="text-xs text-red-500">{errors.start_time}</span>}
                                </div>

                                <div>
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.end_time && <span className="text-xs text-red-500">{errors.end_time}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="total_marks">Total Marks *</Label>
                                    <Input
                                        id="total_marks"
                                        type="number"
                                        value={data.total_marks}
                                        onChange={(e) => setData('total_marks', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.total_marks && <span className="text-xs text-red-500">{errors.total_marks}</span>}
                                </div>

                                <div>
                                    <Label htmlFor="passing_marks">Passing Marks *</Label>
                                    <Input
                                        id="passing_marks"
                                        type="number"
                                        value={data.passing_marks}
                                        onChange={(e) => setData('passing_marks', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {errors.passing_marks && <span className="text-xs text-red-500">{errors.passing_marks}</span>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                                <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Schedules Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase">Exam Date</th>
                                <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase">Session</th>
                                <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase">Class & Subject</th>
                                <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase">Time</th>
                                <th className="px-6 py-3 text-left font-bold text-slate-600 uppercase">Marks</th>
                                <th className="px-6 py-3 text-right font-bold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {schedules?.data?.length > 0 ? (
                                schedules.data.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {schedule.exam_date}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {schedule.exam_session?.title || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800">{schedule.school_class?.name}</span>
                                            <span className="text-slate-400 mx-1">•</span>
                                            <span className="text-indigo-600 font-medium">{schedule.subject?.subject_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {schedule.start_time} - {schedule.end_time}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            Pass: {schedule.passing_marks} / Total: {schedule.total_marks}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenEdit(schedule)}
                                                className="text-indigo-600 hover:text-indigo-800 h-8 px-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(schedule.id)}
                                                className="text-red-600 hover:text-red-800 h-8 px-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400">
                                        No exam schedule entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
