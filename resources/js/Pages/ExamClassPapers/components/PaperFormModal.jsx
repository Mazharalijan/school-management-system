import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';

export default function PaperFormModal({ isOpen, onClose, paper = null, classes = [], subjects = [] }) {
    const isEdit = Boolean(paper);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        school_class_id: '',
        subject_id: '',
        paper_title: '',
        total_marks: 100,
        duration_minutes: 120,
        instructions: '',
    });

    useEffect(() => {
        if (paper) {
            setData({
                school_class_id: paper.school_class_id || '',
                subject_id: paper.subject_id || '',
                paper_title: paper.paper_title || paper.title || '',
                total_marks: paper.total_marks || 100,
                duration_minutes: paper.duration_minutes || 120,
                instructions: paper.instructions || '',
            });
        } else {
            reset();
        }
    }, [paper, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('exam-class-papers.update', paper.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('exam-class-papers.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Exam Paper' : 'Create New Exam Paper'}
            maxWidth="sm:max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="paper_title">Paper Title *</Label>
                    <Input
                        id="paper_title"
                        value={data.paper_title}
                        onChange={(e) => setData('paper_title', e.target.value)}
                        placeholder="e.g. Annual Midterm Physics Paper 2026"
                        required
                        className="mt-1"
                    />
                    {errors.paper_title && <p className="text-xs text-rose-500 mt-1">{errors.paper_title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        {errors.school_class_id && <p className="text-xs text-rose-500 mt-1">{errors.school_class_id}</p>}
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
                        {errors.subject_id && <p className="text-xs text-rose-500 mt-1">{errors.subject_id}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="total_marks">Total Marks *</Label>
                        <Input
                            id="total_marks"
                            type="number"
                            value={data.total_marks}
                            onChange={(e) => setData('total_marks', e.target.value)}
                            required
                            className="mt-1"
                        />
                        {errors.total_marks && <p className="text-xs text-rose-500 mt-1">{errors.total_marks}</p>}
                    </div>

                    <div>
                        <Label htmlFor="duration_minutes">Duration (Minutes) *</Label>
                        <Input
                            id="duration_minutes"
                            type="number"
                            value={data.duration_minutes}
                            onChange={(e) => setData('duration_minutes', e.target.value)}
                            required
                            className="mt-1"
                        />
                        {errors.duration_minutes && <p className="text-xs text-rose-500 mt-1">{errors.duration_minutes}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <textarea
                        id="instructions"
                        rows={3}
                        value={data.instructions}
                        onChange={(e) => setData('instructions', e.target.value)}
                        placeholder="Write instructions for candidates..."
                        className="w-full mt-1 border border-slate-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={processing} className="bg-slate-800 text-white hover:bg-slate-900">
                        {isEdit ? 'Update Paper' : 'Save Paper'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}