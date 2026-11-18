import React from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileAvatar from '@/components/ProfileAvatar';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

export default function Entry({ sessions = [], classes = [], subjects = [], students = [], existingMarks = {}, filters = {} }) {
    const handleFilterChange = (key, value) => {
        router.get(
            route('marks.entry'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const initialMarksData = students?.map((student) => {
        const existing = existingMarks?.[student.id];
        return {
            student_id: student.id,
            obtained_marks: existing ? existing.obtained_marks : '',
            total_marks: existing ? existing.total_marks : 100,
            is_absent: existing ? Boolean(existing.is_absent) : false,
            remarks: existing ? existing.remarks || '' : '',
        };
    }) || [];

    const { data, setData, post, processing } = useForm({
        exam_session_id: filters.exam_session_id || '',
        school_class_id: filters.school_class_id || '',
        subject_id: filters.subject_id || '',
        marks: initialMarksData,
    });

    const handleMarkChange = (index, field, value) => {
        const updatedMarks = [...data.marks];
        updatedMarks[index][field] = value;
        setData('marks', updatedMarks);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('marks.bulk-store'));
    };

    const handleProcessResults = () => {
        router.post(route('marks.process-results'), {
            exam_session_id: filters.exam_session_id,
            school_class_id: filters.school_class_id,
        });
    };

    return (
        <AppLayout title="Student Marks Entry">
            <Head title="Marks Entry" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                <PageHeader
                    title="Marks Entry"
                    subtitle="Select session, class, and subject to record subject marks."
                    actions={
                        filters.exam_session_id && filters.school_class_id && (
                            <Button
                                onClick={handleProcessResults}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Process Class Results & Ranking
                            </Button>
                        )
                    }
                />

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Exam Session</label>
                            <select
                                value={filters.exam_session_id || ''}
                                onChange={(e) => handleFilterChange('exam_session_id', e.target.value)}
                                className="w-full bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input"
                            >
                                <option value="">-- Select Session --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.title} ({s.session_year})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Class</label>
                            <select
                                value={filters.school_class_id || ''}
                                onChange={(e) => handleFilterChange('school_class_id', e.target.value)}
                                className="w-full bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input"
                            >
                                <option value="">-- Select Class --</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">Subject</label>
                            <select
                                value={filters.subject_id || ''}
                                onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                                className="w-full bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input"
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Marks Entry Form */}
                {students?.length > 0 ? (
                    <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-sm shadow-sm border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground uppercase text-xs">Student Name</th>
                                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground uppercase text-xs">Absent</th>
                                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground uppercase text-xs">Obtained Marks</th>
                                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground uppercase text-xs">Total Marks</th>
                                        <th className="px-6 py-3 text-left font-semibold text-muted-foreground uppercase text-xs">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {students.map((student, idx) => (
                                        <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-6 py-3 font-medium text-foreground">
                                                <div className="flex items-center gap-2.5">
                                                    <ProfileAvatar
                                                        src={student.photo_url}
                                                        name={student.name}
                                                        size="sm"
                                                    />
                                                    <span>{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.marks[idx]?.is_absent || false}
                                                    onChange={(e) => handleMarkChange(idx, 'is_absent', e.target.checked)}
                                                    className="rounded border-input text-primary focus:ring-ring bg-background h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    disabled={data.marks[idx]?.is_absent}
                                                    value={data.marks[idx]?.obtained_marks || ''}
                                                    onChange={(e) => handleMarkChange(idx, 'obtained_marks', e.target.value)}
                                                    className="w-32 bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input disabled:bg-muted/50 disabled:text-muted-foreground"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="number"
                                                    value={data.marks[idx]?.total_marks || 100}
                                                    onChange={(e) => handleMarkChange(idx, 'total_marks', e.target.value)}
                                                    className="w-32 bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    value={data.marks[idx]?.remarks || ''}
                                                    onChange={(e) => handleMarkChange(idx, 'remarks', e.target.value)}
                                                    placeholder="Optional remarks"
                                                    className="w-full bg-background border border-input rounded-xs text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input placeholder:text-muted-foreground"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-muted/40 border-t border-border flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="shadow-sm font-semibold"
                            >
                                Save Marks Batch
                            </Button>
                        </div>
                    </form>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            Select a session, class, and subject above to enter student marks.
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}