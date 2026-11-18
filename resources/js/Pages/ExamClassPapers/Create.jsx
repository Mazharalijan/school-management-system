import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Create({ classes = [], subjects = [], examSessions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        paper_title: '',
        school_class_id: '',
        exam_session_id: '',
        subject_id: '',
        total_marks: 100,
        duration_minutes: 120,
        instructions: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('exam-class-papers.store'));
    };

    return (
        <AppLayout title="Create Exam Paper">
            <Head title="Create Exam Paper" />

            <div className="py-6 max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <PageHeader
                    title="Create Exam Paper"
                    subtitle="Configure a new examination paper for a class and subject."
                />

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <Label className="text-xs font-semibold uppercase">Exam Paper Title *</Label>
                                    <Input 
                                        type="text" 
                                        value={data.paper_title} 
                                        onChange={e => setData('paper_title', e.target.value)} 
                                        className="mt-1" 
                                        required 
                                    />
                                    {errors.paper_title && <div className="text-destructive text-xs mt-1">{errors.paper_title}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold uppercase">Class *</Label>
                                        <select 
                                            value={data.school_class_id} 
                                            onChange={e => setData('school_class_id', e.target.value)} 
                                            className="mt-1 block w-full rounded-xs border border-input bg-background text-foreground shadow-sm text-sm focus:ring-1 focus:ring-ring focus:border-input"
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        {errors.school_class_id && <div className="text-destructive text-xs mt-1">{errors.school_class_id}</div>}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold uppercase">Exam Term / Session</Label>
                                        <select 
                                            value={data.exam_session_id} 
                                            onChange={e => setData('exam_session_id', e.target.value)} 
                                            className="mt-1 block w-full rounded-xs border border-input bg-background text-foreground shadow-sm text-sm focus:ring-1 focus:ring-ring focus:border-input"
                                        >
                                            <option value="">Select Term (e.g. First Term)</option>
                                            {examSessions.map(term => (
                                                <option key={term.id} value={term.id}>{term.title}</option>
                                            ))}
                                        </select>
                                        {errors.exam_session_id && <div className="text-destructive text-xs mt-1">{errors.exam_session_id}</div>}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-semibold uppercase">Subject *</Label>
                                        <select 
                                            value={data.subject_id} 
                                            onChange={e => setData('subject_id', e.target.value)} 
                                            className="mt-1 block w-full rounded-xs border border-input bg-background text-foreground shadow-sm text-sm focus:ring-1 focus:ring-ring focus:border-input"
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                                            ))}
                                        </select>
                                        {errors.subject_id && <div className="text-destructive text-xs mt-1">{errors.subject_id}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold uppercase">Total Marks *</Label>
                                        <Input 
                                            type="number" 
                                            value={data.total_marks} 
                                            onChange={e => setData('total_marks', e.target.value)} 
                                            className="mt-1" 
                                            required
                                        />
                                        {errors.total_marks && <div className="text-destructive text-xs mt-1">{errors.total_marks}</div>}
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold uppercase">Duration (Minutes) *</Label>
                                        <Input 
                                            type="number" 
                                            value={data.duration_minutes} 
                                            onChange={e => setData('duration_minutes', e.target.value)} 
                                            className="mt-1" 
                                            required
                                        />
                                        {errors.duration_minutes && <div className="text-destructive text-xs mt-1">{errors.duration_minutes}</div>}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-semibold uppercase">Instructions</Label>
                                    <textarea 
                                        value={data.instructions} 
                                        onChange={e => setData('instructions', e.target.value)} 
                                        rows="3" 
                                        className="mt-1 block w-full rounded-xs border border-input bg-background text-foreground shadow-sm text-sm focus:ring-1 focus:ring-ring focus:border-input"
                                    ></textarea>
                                    {errors.instructions && <div className="text-destructive text-xs mt-1">{errors.instructions}</div>}
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link href={route('exam-class-papers.index')} className="text-muted-foreground hover:text-foreground text-sm font-medium">Cancel</Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="font-semibold px-6"
                                    >
                                        Save Paper
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}