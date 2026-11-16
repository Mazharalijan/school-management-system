import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import FilterSelect from '@/components/FilterSelect';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Trash2, Pencil, X, Clock, BookOpen, Layers } from 'lucide-react';

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

    const handleResetFilter = () => {
        router.get(
            route('schedules.index'),
            {},
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

    const hasFilters = Boolean(filters.exam_session_id || filters.school_class_id);

    return (
        <AppLayout title="Exam Schedules & Date Sheet">
            <Head title="Exam Schedules" />

            <div className="space-y-6">
                <PageHeader
                    title="Exam Schedules & Date Sheet"
                    subtitle="Configure examination dates, timings, total marks, and class subject schedules."
                    icon={Calendar}
                    buttonText={isCreating ? 'Cancel' : '+ Add Schedule Entry'}
                    onButtonClick={() => {
                        if (isCreating) {
                            handleCloseForm();
                        } else {
                            setIsCreating(true);
                        }
                    }}
                />

                {/* Filter Bar */}
                <FilterBar showReset={hasFilters} onReset={handleResetFilter}>
                    <FilterSelect
                        value={filters.exam_session_id || ''}
                        onChange={(val) => handleFilterChange('exam_session_id', val)}
                        options={examSessions}
                        valueKey="id"
                        labelKey="title"
                        placeholder="All Exam Sessions"
                        className="flex-1 min-w-[220px]"
                    />

                    <FilterSelect
                        value={filters.school_class_id || ''}
                        onChange={(val) => handleFilterChange('school_class_id', val)}
                        options={classes}
                        valueKey="id"
                        labelKey="name"
                        placeholder="All Classes"
                        className="flex-1 min-w-[200px]"
                    />
                </FilterBar>

                {/* Schedule Create / Edit Form Card */}
                {isCreating && (
                    <Card className="border-border shadow-xs bg-card text-card-foreground">
                        <CardHeader className="bg-muted/40 border-b border-border pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                {editingSchedule ? 'Edit Schedule Entry' : 'Add New Exam Schedule'}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCloseForm}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="session_select" className="text-xs font-bold text-muted-foreground uppercase">
                                            Exam Session *
                                        </Label>
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
                                        <Label htmlFor="class_select" className="text-xs font-bold text-muted-foreground uppercase">
                                            Class *
                                        </Label>
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
                                        <Label htmlFor="subject_select" className="text-xs font-bold text-muted-foreground uppercase">
                                            Subject *
                                        </Label>
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
                                        <Label htmlFor="exam_date" className="text-xs font-bold text-muted-foreground uppercase">
                                            Exam Date *
                                        </Label>
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
                                        <Label htmlFor="start_time" className="text-xs font-bold text-muted-foreground uppercase">
                                            Start Time *
                                        </Label>
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
                                        <Label htmlFor="end_time" className="text-xs font-bold text-muted-foreground uppercase">
                                            End Time *
                                        </Label>
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
                                        <Label htmlFor="total_marks" className="text-xs font-bold text-muted-foreground uppercase">
                                            Total Marks *
                                        </Label>
                                        <Input
                                            id="total_marks"
                                            type="number"
                                            value={data.total_marks}
                                            onChange={(e) => setData('total_marks', e.target.value)}
                                            className="mt-1 font-mono"
                                            required
                                        />
                                        {errors.total_marks && <span className="text-xs text-red-500">{errors.total_marks}</span>}
                                    </div>

                                    <div>
                                        <Label htmlFor="passing_marks" className="text-xs font-bold text-muted-foreground uppercase">
                                            Passing Marks *
                                        </Label>
                                        <Input
                                            id="passing_marks"
                                            type="number"
                                            value={data.passing_marks}
                                            onChange={(e) => setData('passing_marks', e.target.value)}
                                            className="mt-1 font-mono"
                                            required
                                        />
                                        {errors.passing_marks && <span className="text-xs text-red-500">{errors.passing_marks}</span>}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="outline" onClick={handleCloseForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Schedules Table Card */}
                <Card className="border-border shadow-xs bg-card text-card-foreground">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Exam Date</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Session</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Class & Subject</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Time</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Marks</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs border-b border-border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {schedules?.data?.length > 0 ? (
                                        schedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {schedule.exam_date}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    <Badge variant="outline" className="bg-muted text-foreground border-border">
                                                        {schedule.exam_session?.title || 'N/A'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold text-xs">
                                                            {schedule.school_class?.name}
                                                        </Badge>
                                                        <span className="text-foreground font-medium">
                                                            {schedule.subject?.subject_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    <span className="flex items-center gap-1.5 font-mono">
                                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {schedule.start_time} - {schedule.end_time}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-foreground text-xs font-mono">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Pass: {schedule.passing_marks}</span>
                                                    <span className="text-muted-foreground mx-1.5">/</span>
                                                    <span className="font-semibold text-foreground">Total: {schedule.total_marks}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <TableActionButton
                                                            title="Edit Schedule"
                                                            icon={Pencil}
                                                            variant="primary"
                                                            onClick={() => handleOpenEdit(schedule)}
                                                        />
                                                        <TableActionButton
                                                            title="Delete Schedule"
                                                            icon={Trash2}
                                                            variant="danger"
                                                            onClick={() => handleDelete(schedule.id)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-10 text-muted-foreground">
                                                No exam schedule entries found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {schedules?.links && (
                            <Pagination
                                links={schedules.links}
                                from={schedules.from}
                                to={schedules.to}
                                total={schedules.total}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
