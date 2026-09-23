import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/RichTextEditor';
import {FilePen, PlusIcon, X} from "lucide-react";

export default function QuestionFormModal({ isOpen, onClose, question = null, classes = [] }) {
    const isEdit = Boolean(question?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        question: '',
        question_type: 'mcq',
        school_class_id: '',
        subject_id: '',
        chapter_id: '',
        topic_id: '',
        marks: 1,
    });

    useEffect(() => {
        if (question) {
            setData({
                question: question.question || '',
                question_type: question.question_type || 'mcq',
                school_class_id: question.school_class_id || '',
                subject_id: question.subject_id || '',
                chapter_id: question.chapter_id || '',
                topic_id: question.topic_id || '',
                marks: question.marks || 1,
            });
        } else {
            reset();
        }
    }, [question, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('question-bank.update', question.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('question-bank.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    const selectedClass = classes.find((c) => c.id == data.school_class_id);
    const availableSubjects = selectedClass?.subjects || [];
    const selectedSubject = availableSubjects.find((s) => s.id == data.subject_id);
    const availableChapters = selectedSubject?.chapters || [];
    const availableTopics = selectedSubject?.topics || [];

    const questionTypes = [
        { id: 'mcq', name: 'MCQ' },
        { id: 'short', name: 'Short Answer' },
        { id: 'long', name: 'Long Answer' },
        { id: 'essay', name: 'Essay' },
        { id: 'letter', name: 'Letter' },
    ];

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
                {isEdit ? 'Update Question' : 'Save Question'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Question' : 'Add New Question'}
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Statement */}
                <div className="border-b pb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Question Statement
                    </span>
                    <div className="mt-2">
                        <Label htmlFor="question_content">Question Content *</Label>
                        <RichTextEditor
                            value = {data.question}
                            // onChange={(e) => setData('question', e.target.value)}
                            onChange={(content) => setData('question_text', content)}
                         />
                        {/* <textarea
                            id="question_content"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 mt-1"
                            rows={4}
                            placeholder="Enter the question text here..."
                            required
                        /> */}
                        {errors.question && (
                            <p className="text-xs text-red-500 mt-1">{errors.question}</p>
                        )}
                    </div>
                </div>

                {/* Academic Placement */}
                <div className="pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Academic Placement & Details
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                            <Label>Class *</Label>
                            <FilterSelect
                                className="w-full mt-1"
                                value={data.school_class_id}
                                onChange={(val) =>
                                    setData((prev) => ({
                                        ...prev,
                                        school_class_id: val,
                                        subject_id: '',
                                        chapter_id: '',
                                        topic_id: '',
                                    }))
                                }
                                options={classes}
                                placeholder="Select Class"
                                valueKey="id"
                                labelKey="name"
                            />
                            {errors.school_class_id && (
                                <span className="text-xs text-red-500">{errors.school_class_id}</span>
                            )}
                        </div>

                        <div>
                            <Label>Subject *</Label>
                            <FilterSelect
                                className="w-full mt-1"
                                value={data.subject_id}
                                onChange={(val) =>
                                    setData((prev) => ({
                                        ...prev,
                                        subject_id: val,
                                        chapter_id: '',
                                        topic_id: '',
                                    }))
                                }
                                options={availableSubjects}
                                placeholder="Select Subject"
                                valueKey="id"
                                labelKey="subject_name"
                            />
                            {errors.subject_id && (
                                <span className="text-xs text-red-500">{errors.subject_id}</span>
                            )}
                        </div>

                        <div>
                            <Label>Question Type *</Label>
                            <FilterSelect
                                className="w-full mt-1"
                                value={data.question_type}
                                onChange={(val) => setData('question_type', val)}
                                options={questionTypes}
                                placeholder="Select Type"
                                valueKey="id"
                                labelKey="name"
                            />
                        </div>

                        <div>
                            <Label>Chapter</Label>
                            <FilterSelect
                                className="w-full mt-1"
                                value={data.chapter_id}
                                onChange={(val) => setData('chapter_id', val)}
                                options={availableChapters}
                                placeholder="Select Chapter"
                                valueKey="id"
                                labelKey="chapter_name"
                            />
                        </div>

                        <div>
                            <Label>Topic</Label>
                            <FilterSelect
                                className="w-full mt-1"
                                value={data.topic_id}
                                onChange={(val) => setData('topic_id', val)}
                                options={availableTopics}
                                placeholder="Select Topic"
                                valueKey="id"
                                labelKey="topic_name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="marks">Marks</Label>
                            <Input
                                id="marks"
                                type="number"
                                value={data.marks}
                                onChange={(e) => setData('marks', e.target.value)}
                                className="mt-1"
                                min="1"
                            />
                            {errors.marks && (
                                <span className="text-xs text-red-500">{errors.marks}</span>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}