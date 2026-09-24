import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePen, PlusIcon, X } from 'lucide-react';

export default function ChapterFormModal({ isOpen, onClose, chapter = null, classes = [], allSubjects = [] }) {
    const isEdit = Boolean(chapter?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        chapter_name: '',
        school_class_id: '',
        subject_id: '',
    });

    // Initialize form when editing
    useEffect(() => {
        if (chapter && isOpen) {
            const classId = chapter.school_class_id || chapter.school_class?.id || '';
            const subjectId = chapter.subject_id || chapter.subject?.id || '';

            setData({
                chapter_name: chapter.chapter_name || chapter.name || '',
                school_class_id: classId ? String(classId) : '',
                subject_id: subjectId ? String(subjectId) : '',
            });
        } else if (!isOpen) {
            reset();
        }
    }, [chapter, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('question-bank.chapters.update', chapter.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('question-bank.chapters.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    // 1. Find selected class object
    const selectedClass = classes.find((c) => String(c.id) === String(data.school_class_id));

    // 2. Extract and deduplicate subjects attached to this class via its chapters
    const rawSubjects = (selectedClass?.chapters || [])
        .map((ch) => ch.subject)
        .filter(Boolean);

    const classSubjects = Array.from(
        new Map(rawSubjects.map((subj) => [subj.id, subj])).values()
    );

    const availableSubjects = classSubjects.length > 0 ? classSubjects : allSubjects;

    const modalFooter = (
        <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Cancel
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className="bg-slate-800 hover:bg-slate-900 text-white"
            >   
                {isEdit ? <FilePen className="w-4 h-4 mr-1" /> : <PlusIcon className="w-4 h-4 mr-1" />}
                {isEdit ? 'Update Chapter' : 'Save Chapter'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Chapter' : 'Add New Chapter'}
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="school_class_id">1. Select Class *</Label>
                        <FilterSelect
                            className="w-full mt-1"
                            value={data.school_class_id}
                            onChange={(val) =>
                                setData((prev) => ({
                                    ...prev,
                                    school_class_id: val,
                                    subject_id: '',
                                }))
                            }
                            options={classes}
                            placeholder="-- Select Class --"
                            valueKey="id"
                            labelKey="name"
                        />
                        {errors.school_class_id && (
                            <span className="text-xs text-red-500">{errors.school_class_id}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="subject_id">2. Select Subject *</Label>
                        <FilterSelect
                            className="w-full mt-1"
                            value={data.subject_id}
                            onChange={(val) => setData('subject_id', val)}
                            options={availableSubjects}
                            placeholder="-- Select Subject --"
                            valueKey="id"
                            labelKey="subject_name"
                            disabled={!data.school_class_id}
                        />
                        {errors.subject_id && (
                            <span className="text-xs text-red-500">{errors.subject_id}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="chapter_name">3. Chapter Name *</Label>
                        <Input
                            id="chapter_name"
                            value={data.chapter_name}
                            onChange={(e) => setData('chapter_name', e.target.value)}
                            placeholder="e.g. Chapter 1: Introduction to Algebra"
                            className="mt-1"
                            required
                        />
                        {errors.chapter_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.chapter_name}</p>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}