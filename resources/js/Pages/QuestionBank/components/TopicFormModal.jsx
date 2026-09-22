import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {FilePen, PlusIcon, X} from "lucide-react";

export default function TopicFormModal({ isOpen, onClose, topic = null, classes = [] }) {
    const isEdit = Boolean(topic?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        topic_name: '',
        school_class_id: '',
        subject_id: '',
        chapter_id: '',
    });

    // Populate data on edit
    useEffect(() => {
        if (topic) {
            // Traverse the nested relations in your data object
            const chapter = topic.chapter || {};
            
            setData({
                topic_name: topic.topic_name || '',
                school_class_id: chapter.school_class_id || '',
                subject_id: chapter.subject_id || '',
                chapter_id: topic.chapter_id || '',
            });
        } else {
            reset();
        }
    }, [topic, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('question-bank.topics.update', topic.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('question-bank.topics.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    // 1. Get the currently selected class object
    const selectedClass = classes.find((c) => String(c.id) === String(data.school_class_id));

    // 2. Extract and deduplicate available subjects from the selected class's chapters
    const rawSubjects = (selectedClass?.chapters || [])
        .map(chapter => chapter.subject)
        .filter(Boolean);
        
    const availableSubjects = Array.from(
        new Map(rawSubjects.map(subj => [subj.id, subj])).values()
    );

    // 3. Filter chapters to only show ones belonging to the selected subject
    const availableChapters = (selectedClass?.chapters || []).filter(
        (ch) => String(ch.subject_id) === String(data.subject_id)
    );

    const modalFooter = (
        <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
                Cancel
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className="bg-slate-800 hover:bg-slate-900 text-white"
            >
                {isEdit ? (<FilePen className="w-4 h-4" />) : (<PlusIcon className="w-4 h-4" />)}
                {isEdit ? 'Update Topic' : 'Save Topic'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Topic' : 'Add New Topic'}
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
                                    chapter_id: '',
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
                            onChange={(val) =>
                                setData((prev) => ({ ...prev, subject_id: val, chapter_id: '' }))
                            }
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
                        <Label htmlFor="chapter_id">3. Select Chapter *</Label>
                        <FilterSelect
                            className="w-full mt-1"
                            value={data.chapter_id}
                            onChange={(val) => setData('chapter_id', val)}
                            options={availableChapters}
                            placeholder="-- Select Chapter --"
                            valueKey="id"
                            labelKey="chapter_name"
                            disabled={!data.subject_id}
                        />
                        {errors.chapter_id && (
                            <span className="text-xs text-red-500">{errors.chapter_id}</span>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="topic_name">4. Topic Name *</Label>
                        <Input
                            id="topic_name"
                            value={data.topic_name}
                            onChange={(e) => setData('topic_name', e.target.value)}
                            placeholder="e.g. Linear Equations, Laws of Motion"
                            className="mt-1"
                            required
                        />
                        {errors.topic_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.topic_name}</p>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}