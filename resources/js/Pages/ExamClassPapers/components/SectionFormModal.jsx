import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';

export default function SectionFormModal({ 
    isOpen, 
    onClose, 
    section = null, 
    papers = [], 
    questionBank = [] 
}) {
    const isEdit = Boolean(section);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        exam_class_paper_id: '',
        section_name: 'A',
        title: '',
        question_type: 'mcq',
        total_marks: 20,
        total_questions: 0,
        order: 1,
        question_ids: [],
    });

    // Populate data when editing or opening
    useEffect(() => {
        if (section && isOpen) {
            // Extract existing question IDs if editing
            const existingQuestionIds = section.section_questions 
                ? section.section_questions.map(q => q.question_bank_id) 
                : (section.question_ids || []);

            setData({
                exam_class_paper_id: section.exam_class_paper_id || '',
                section_name: section.section_name || 'A',
                title: section.title || '',
                question_type: section.question_type || 'mcq',
                total_marks: section.total_marks || 20,
                total_questions: existingQuestionIds.length || section.total_questions || 0,
                order: section.order || 1,
                question_ids: existingQuestionIds,
            });
        } else if (!isOpen) {
            reset();
            setSearchTerm('');
        }
    }, [section, isOpen]);

    // Find selected paper details to extract subject_id
    const selectedPaper = useMemo(() => {
        return papers.find((p) => String(p.id) === String(data.exam_class_paper_id));
    }, [papers, data.exam_class_paper_id]);

    // Filter Question Bank based on Paper's Subject ID and Selected Question Type
    const filteredQuestions = useMemo(() => {
        if (!selectedPaper?.subject_id) return [];

        return questionBank.filter((q) => {
            const matchesSubject = String(q.subject_id) === String(selectedPaper.subject_id);
            const matchesType = q.question_type === data.question_type;
            const matchesSearch = searchTerm 
                ? (q.question_text || q.question || '').toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            return matchesSubject && matchesType && matchesSearch;
        });
    }, [questionBank, selectedPaper, data.question_type, searchTerm]);

    // Toggle individual question selection
    const handleToggleQuestion = (qId) => {
        const currentIds = [...data.question_ids];
        const index = currentIds.indexOf(qId);

        let updatedIds;
        if (index > -1) {
            updatedIds = currentIds.filter((id) => id !== qId);
        } else {
            updatedIds = [...currentIds, qId];
        }

        setData((prevData) => ({
            ...prevData,
            question_ids: updatedIds,
            total_questions: updatedIds.length,
        }));
    };

    // Toggle Select All filtered questions
    const handleSelectAll = () => {
        const filteredIds = filteredQuestions.map((q) => q.id);
        const allSelected = filteredIds.every((id) => data.question_ids.includes(id));

        let updatedIds;
        if (allSelected) {
            // Uncheck all filtered items
            updatedIds = data.question_ids.filter((id) => !filteredIds.includes(id));
        } else {
            // Add remaining filtered items
            updatedIds = Array.from(new Set([...data.question_ids, ...filteredIds]));
        }

        setData((prevData) => ({
            ...prevData,
            question_ids: updatedIds,
            total_questions: updatedIds.length,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const routeName = isEdit ? 'exam-paper-sections.update' : 'paper.sections.store';
        const submitMethod = isEdit ? put : post;
        const targetUrl = isEdit ? route(routeName, section.id) : route(routeName);

        submitMethod(targetUrl, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Section & Questions' : 'Create Paper Section'}
            maxWidth="sm:max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paper Selection */}
                    <div>
                        <Label>Assign to Exam Paper *</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.exam_class_paper_id}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    exam_class_paper_id: val,
                                    question_ids: [], // Reset selected questions when paper/subject changes
                                    total_questions: 0,
                                }));
                            }}
                            options={papers}
                            placeholder="Select Paper"
                            valueKey="id"
                            labelKey="paper_title"
                        />
                        {errors.exam_class_paper_id && (
                            <p className="text-xs text-rose-500 mt-1">{errors.exam_class_paper_id}</p>
                        )}
                    </div>

                    {/* Section Letter */}
                    <div>
                        <Label>Section Letter *</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.section_name}
                            onChange={(val) => setData('section_name', val)}
                            options={[
                                { id: 'A', name: 'Section A (e.g. MCQs)' },
                                { id: 'B', name: 'Section B (e.g. Short Questions)' },
                                { id: 'C', name: 'Section C (e.g. Long Questions)' },
                                { id: 'D', name: 'Section D (e.g. Practical / Numerical)' },
                            ]}
                            valueKey="id"
                            labelKey="name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Question Type Enum Dropdown */}
                    <div>
                        <Label>Question Type *</Label>
                        <FilterSelect
                            className="mt-1"
                            value={data.question_type}
                            onChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    question_type: val,
                                    question_ids: [], // Reset selected questions when type changes
                                    total_questions: 0,
                                }));
                            }}
                            options={[
                                { id: 'mcq', name: 'Multiple Choice (MCQ)' },
                                { id: 'short', name: 'Short Question' },
                                { id: 'long', name: 'Long Question' },
                                { id: 'letter', name: 'Letter Writing' },
                                { id: 'essay', name: 'Essay Writing' },
                            ]}
                            valueKey="id"
                            labelKey="name"
                        />
                        {errors.question_type && (
                            <p className="text-xs text-rose-500 mt-1">{errors.question_type}</p>
                        )}
                    </div>

                    {/* Order Sequence */}
                    <div>
                        <Label htmlFor="order">Order Sequence *</Label>
                        <Input
                            id="order"
                            type="number"
                            min="1"
                            value={data.order}
                            onChange={(e) => setData('order', e.target.value)}
                            className="mt-1"
                            required
                        />
                        {errors.order && <p className="text-xs text-rose-500 mt-1">{errors.order}</p>}
                    </div>

                    {/* Target Marks */}
                    <div>
                        <Label htmlFor="total_marks">Target Marks *</Label>
                        <Input
                            id="total_marks"
                            type="number"
                            value={data.total_marks}
                            onChange={(e) => setData('total_marks', e.target.value)}
                            className="mt-1"
                            required
                        />
                        {errors.total_marks && (
                            <p className="text-xs text-rose-500 mt-1">{errors.total_marks}</p>
                        )}
                    </div>
                </div>

                {/* Section Title */}
                <div>
                    <Label htmlFor="title">Section Title *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Choose the correct answer from the following"
                        required
                        className="mt-1"
                    />
                    {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                </div>

                {/* Questions Checkbox Selection Area */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-800">
                                Select Questions ({data.question_ids.length} selected)
                            </h4>
                            <p className="text-xs text-slate-500">
                                Filtered by subject & type: <span className="font-medium text-slate-700">{data.question_type.toUpperCase()}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 text-xs w-48 bg-white"
                            />
                            {filteredQuestions.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="h-8 text-xs whitespace-nowrap"
                                >
                                    Select All
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {!data.exam_class_paper_id ? (
                            <div className="py-8 text-center text-xs text-slate-500">
                                Please select an exam paper above to load relevant questions.
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-500">
                                No questions found matching this subject and question type ({data.question_type}).
                            </div>
                        ) : (
                            filteredQuestions.map((q) => {
                                const isChecked = data.question_ids.includes(q.id);
                                return (
                                    <label
                                        key={q.id}
                                        className={`flex items-start gap-3 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                                            isChecked
                                                ? 'bg-emerald-50/60 border-emerald-300'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleQuestion(q.id)}
                                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <div className="flex-1">
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                {q.question_text || q.question}
                                            </p>
                                            {q.chapter && (
                                                <span className="text-[10px] text-slate-400 mt-0.5 block">
                                                    Chapter: {q.chapter.chapter_name || q.chapter.title || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                            {q.marks || 1} M
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                    {errors.question_ids && (
                        <p className="text-xs text-rose-500 mt-1">{errors.question_ids}</p>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || !data.exam_class_paper_id}
                        className="bg-slate-800 text-white hover:bg-slate-900"
                    >
                        {isEdit ? 'Update Section' : 'Save Section'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}