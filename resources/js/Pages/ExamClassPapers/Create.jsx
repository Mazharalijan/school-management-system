import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Create({ classes = [], subjects = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        paper_title: '',
        school_class_id: '',
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

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Exam Paper Title *</label>
                                    <input 
                                        type="text" 
                                        value={data.paper_title} 
                                        onChange={e => setData('paper_title', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" 
                                        required 
                                    />
                                    {errors.paper_title && <div className="text-red-600 text-xs mt-1">{errors.paper_title}</div>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Class *</label>
                                        <select 
                                            value={data.school_class_id} 
                                            onChange={e => setData('school_class_id', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        {errors.school_class_id && <div className="text-red-600 text-xs mt-1">{errors.school_class_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subject *</label>
                                        <select 
                                            value={data.subject_id} 
                                            onChange={e => setData('subject_id', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(sub => (
                                                <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                                            ))}
                                        </select>
                                        {errors.subject_id && <div className="text-red-600 text-xs mt-1">{errors.subject_id}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Marks *</label>
                                        <input 
                                            type="number" 
                                            value={data.total_marks} 
                                            onChange={e => setData('total_marks', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" 
                                            required
                                        />
                                        {errors.total_marks && <div className="text-red-600 text-xs mt-1">{errors.total_marks}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration (Minutes) *</label>
                                        <input 
                                            type="number" 
                                            value={data.duration_minutes} 
                                            onChange={e => setData('duration_minutes', e.target.value)} 
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" 
                                            required
                                        />
                                        {errors.duration_minutes && <div className="text-red-600 text-xs mt-1">{errors.duration_minutes}</div>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                                    <textarea 
                                        value={data.instructions} 
                                        onChange={e => setData('instructions', e.target.value)} 
                                        rows="3" 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                                    ></textarea>
                                    {errors.instructions && <div className="text-red-600 text-xs mt-1">{errors.instructions}</div>}
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link href={route('exam-class-papers.index')} className="text-gray-600 text-sm">Cancel</Link>
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Save Paper
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}