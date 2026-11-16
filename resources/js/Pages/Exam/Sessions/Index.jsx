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
                    <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Published
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-muted text-foreground border border-border">
                        Completed
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
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
                    <Card className="border-border shadow-xs bg-card text-card-foreground">
                        <CardHeader className="bg-muted/40 border-b border-border pb-3">
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                Create New Exam Session
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase">
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
                                        <Label htmlFor="session_year" className="text-xs font-bold text-muted-foreground uppercase">
                                            Academic Year *
                                        </Label>
                                        <Input
                                            id="session_year"
                                            type="text"
                                            value={data.session_year}
                                            onChange={(e) => setData('session_year', e.target.value)}
                                            placeholder="e.g. 2026-2027"
                                            className="mt-1 font-mono"
                                            required
                                        />
                                        {errors.session_year && <span className="text-xs text-red-500">{errors.session_year}</span>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase">
                                            Status *
                                        </Label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="start_date" className="text-xs font-bold text-muted-foreground uppercase">
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
                                        <Label htmlFor="end_date" className="text-xs font-bold text-muted-foreground uppercase">
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
                                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                <Card className="border-border shadow-xs bg-card text-card-foreground">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/60">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Title</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Year</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Duration</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs border-b border-border">Status</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs border-b border-border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {sessions?.data?.length > 0 ? (
                                        sessions.data.map((session) => (
                                            <tr key={session.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-foreground">{session.title}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{session.session_year}</td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    {session.start_date && session.end_date ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {session.start_date} to {session.end_date}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Not specified</span>
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
                                            <td colSpan="5" className="text-center py-10 text-muted-foreground">
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