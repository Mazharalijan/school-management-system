import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ sessions, filters }) {
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        session_year: '',
        start_date: '',
        end_date: '',
        status: 'draft',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exams.sessions.store'), {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            },
        });
    };

    return (
        <AppLayout title="Exam Sessions">
            <Head title="Exam Sessions" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Exam Sessions</h1>
                        <p className="text-sm text-slate-500">Manage terms, academic sessions, and exam statuses.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-md shadow hover:bg-indigo-700"
                    >
                        {isCreating ? 'Cancel' : '+ New Exam Session'}
                    </button>
                </div>

                {/* Create Form Modal / Drawer */}
                {isCreating && (
                    <div className="mb-6 bg-white p-6 rounded-lg shadow border border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-700 mb-4">Create New Session</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Midterm Examination"
                                    className="w-full border-slate-300 rounded-md text-sm focus:ring-indigo-500"
                                />
                                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    value={data.session_year}
                                    onChange={(e) => setData('session_year', e.target.value)}
                                    placeholder="e.g. 2026-2027"
                                    className="w-full border-slate-300 rounded-md text-sm focus:ring-indigo-500"
                                />
                                {errors.session_year && <span className="text-xs text-red-500">{errors.session_year}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm focus:ring-indigo-500"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm focus:ring-indigo-500"
                                />
                                {errors.start_date && <span className="text-xs text-red-500">{errors.start_date}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm focus:ring-indigo-500"
                                />
                                {errors.end_date && <span className="text-xs text-red-500">{errors.end_date}</span>}
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700"
                                >
                                    Save Session
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table Data */}
                <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Title</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Year</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Duration</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-right font-semibold text-slate-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sessions?.data?.length > 0 ? (
                                sessions.data.map((session) => (
                                    <tr key={session.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{session.title}</td>
                                        <td className="px-6 py-4 text-slate-600">{session.session_year}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {session.start_date} to {session.end_date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                                                session.status === 'published' ? 'bg-green-100 text-green-800' :
                                                session.status === 'completed' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => router.delete(route('exams.sessions.destroy', session.id))}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-slate-400">
                                        No exam sessions found.
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