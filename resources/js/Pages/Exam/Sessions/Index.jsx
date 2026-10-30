import React, { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Trash2, X, CheckCircle2, Clock } from 'lucide-react';

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
        post(route('sessions.store'), {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this exam session?')) {
            router.delete(route('sessions.destroy', id));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">
                        Published
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-0">
                        Completed
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
                        Draft
                    </Badge>
                );
        }
    };

    return (
        <AppLayout title="Exam Sessions">
            <Head title="Exam Sessions" />

            <div className="space-y-6">
                <PageHeader
                    title="Exam Sessions"
                    subtitle="Manage terms, academic sessions, and exam statuses."
                    icon={Calendar}
                    buttonText={isCreating ? 'Cancel' : '+ New Exam Session'}
                    onButtonClick={() => {
                        if (isCreating) {
                            reset();
                        }
                        setIsCreating(!isCreating);
                    }}
                />

                {/* Create Session Form Card */}
                {isCreating && (
                    <Card className="border-indigo-100 shadow-sm">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-3">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="h-4 w-4 text-indigo-600" />
                                Create New Exam Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="title" className="text-xs font-bold text-slate-600 uppercase">
                                            Session Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g. Midterm Examination"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                                    </div>

                                    <div>
                                        <Label htmlFor="session_year" className="text-xs font-bold text-slate-600 uppercase">
                                            Academic Year *
                                        </Label>
                                        <Input
                                            id="session_year"
                                            type="text"
                                            value={data.session_year}
                                            onChange={(e) => setData('session_year', e.target.value)}
                                            placeholder="e.g. 2026-2027"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.session_year && <span className="text-xs text-red-500">{errors.session_year}</span>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status" className="text-xs font-bold text-slate-600 uppercase">
                                            Status *
                                        </Label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="start_date" className="text-xs font-bold text-slate-600 uppercase">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.start_date && <span className="text-xs text-red-500">{errors.start_date}</span>}
                                    </div>

                                    <div>
                                        <Label htmlFor="end_date" className="text-xs font-bold text-slate-600 uppercase">
                                            End Date
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.end_date && <span className="text-xs text-red-500">{errors.end_date}</span>}
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            Save Session
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Table Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Title</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Year</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Duration</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Status</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-slate-600 uppercase text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {sessions?.data?.length > 0 ? (
                                        sessions.data.map((session) => (
                                            <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900">{session.title}</td>
                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{session.session_year}</td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">
                                                    {session.start_date && session.end_date ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {session.start_date} to {session.end_date}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">Not specified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(session.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <TableActionButton
                                                        title="Delete Session"
                                                        icon={Trash2}
                                                        variant="danger"
                                                        onClick={() => handleDelete(session.id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-slate-400">
                                                No exam sessions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {sessions?.links && (
                            <Pagination
                                links={sessions.links}
                                from={sessions.from}
                                to={sessions.to}
                                total={sessions.total}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}