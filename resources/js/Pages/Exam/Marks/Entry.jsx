import React from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Entry({ sessions, classes, subjects, students, existingMarks, filters }) {
    const handleFilterChange = (key, value) => {
        router.get(
            route('exams.marks.entry'),
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
        post(route('exams.marks.bulk-store'));
    };

    const handleProcessResults = () => {
        router.post(route('exams.marks.process-results'), {
            exam_session_id: filters.exam_session_id,
            school_class_id: filters.school_class_id,
        });
    };

    return (
        <AppLayout title="Student Marks Entry">
            <Head title="Marks Entry" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Marks Entry</h1>
                        <p className="text-sm text-slate-500">Select session, class, and subject to record subject marks.</p>
                    </div>

                    {filters.exam_session_id && filters.school_class_id && (
                        <button
                            onClick={handleProcessResults}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 shadow"
                        >
                            Process Class Results & Ranking
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Exam Session</label>
                        <select
                            value={filters.exam_session_id || ''}
                            onChange={(e) => handleFilterChange('exam_session_id', e.target.value)}
                            className="w-full border-slate-300 rounded-md text-sm"
                        >
                            <option value="">-- Select Session --</option>
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>{s.title} ({s.session_year})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class</label>
                        <select
                            value={filters.school_class_id || ''}
                            onChange={(e) => handleFilterChange('school_class_id', e.target.value)}
                            className="w-full border-slate-300 rounded-md text-sm"
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject</label>
                        <select
                            value={filters.subject_id || ''}
                            onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                            className="w-full border-slate-300 rounded-md text-sm"
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Marks Entry Form */}
                {students?.length > 0 ? (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Absent</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Obtained Marks</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Total Marks</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-6 py-3">
                                            <input
                                                type="checkbox"
                                                checked={data.marks[idx]?.is_absent || false}
                                                onChange={(e) => handleMarkChange(idx, 'is_absent', e.target.checked)}
                                                className="rounded border-slate-300 text-indigo-600"
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                disabled={data.marks[idx]?.is_absent}
                                                value={data.marks[idx]?.obtained_marks || ''}
                                                onChange={(e) => handleMarkChange(idx, 'obtained_marks', e.target.value)}
                                                className="w-32 border-slate-300 rounded-md text-sm disabled:bg-slate-100"
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <input
                                                type="number"
                                                value={data.marks[idx]?.total_marks || 100}
                                                onChange={(e) => handleMarkChange(idx, 'total_marks', e.target.value)}
                                                className="w-32 border-slate-300 rounded-md text-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <input
                                                type="text"
                                                value={data.marks[idx]?.remarks || ''}
                                                onChange={(e) => handleMarkChange(idx, 'remarks', e.target.value)}
                                                placeholder="Optional remarks"
                                                className="w-full border-slate-300 rounded-md text-sm"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 shadow"
                            >
                                Save Marks Batch
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white p-8 text-center rounded-lg border text-slate-500">
                        Select a session, class, and subject above to enter student marks.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}