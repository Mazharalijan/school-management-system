import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, FileText, Layers } from 'lucide-react';

export default function ExamPaperCreate({ classes = [], initialQuestions = [], filters = {} }) {
    const form = useForm({
        title: '',
        school_class_id: filters.school_class_id || '',
        subject_id: filters.subject_id || '',
        total_marks: 100,
        duration_minutes: 120,
        instructions: 'Read all questions carefully. Answer according to instructions given in each section.',
        sections: [
            {
                section_name: 'Section A: Multiple Choice Questions',
                instructions: 'Choose the correct option.',
                order: 1,
                questions: [],
            },
        ],
    });

    const handleFilterChange = (classId, subjectId) => {
        router.get(
            route('exam-papers.create'),
            { school_class_id: classId, subject_id: subjectId },
            { preserveState: true, replace: true }
        );
    };

    const selectedClass = classes.find((c) => c.id == form.data.school_class_id);
    const availableSubjects = selectedClass?.subjects || [];

    const addSection = () => {
        form.setData('sections', [
            ...form.data.sections,
            {
                section_name: `Section ${String.fromCharCode(65 + form.data.sections.length)}`,
                instructions: '',
                order: form.data.sections.length + 1,
                questions: [],
            },
        ]);
    };

    const removeSection = (sIndex) => {
        form.setData(
            'sections',
            form.data.sections.filter((_, idx) => idx !== sIndex)
        );
    };

    const addQuestionToSection = (sectionIndex, questionBank) => {
        const section = form.data.sections[sectionIndex];
        if (section.questions.some((q) => q.question_bank_id === questionBank.id)) return;

        const updatedSections = [...form.data.sections];
        updatedSections[sectionIndex].questions.push({
            question_bank_id: questionBank.id,
            question_text: questionBank.question,
            type: questionBank.type,
            marks: questionBank.default_marks,
            order: updatedSections[sectionIndex].questions.length + 1,
        });
        form.setData('sections', updatedSections);
    };

    const removeQuestionFromSection = (sectionIndex, qIndex) => {
        const updatedSections = [...form.data.sections];
        updatedSections[sectionIndex].questions.splice(qIndex, 1);
        form.setData('sections', updatedSections);
    };

    const updateQuestionMarks = (sectionIndex, qIndex, marks) => {
        const updatedSections = [...form.data.sections];
        updatedSections[sectionIndex].questions[qIndex].marks = marks;
        form.setData('sections', updatedSections);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('exam-papers.store'));
    };

    const calculatedTotalMarks = useMemo(() => {
        return form.data.sections.reduce((sum, sec) => {
            return sum + sec.questions.reduce((qSum, q) => qSum + parseFloat(q.marks || 0), 0);
        }, 0);
    }, [form.data.sections]);

    return (
        <AppLayout title="Create Exam Paper">
            <Head title="Exam Paper Builder" />

            <div className="py-6 w-full max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Exam Paper Builder</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Assemble questions into structured paper sections.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 pb-3">
                            <CardTitle className="text-sm font-bold text-slate-800">Paper Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Label className="text-xs font-semibold">Paper Title *</Label>
                                <Input
                                    className="mt-1 h-9 text-xs"
                                    placeholder="e.g. First Term Examination 2026"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Class *</Label>
                                <select
                                    className="mt-1 w-full h-9 text-xs rounded-md border border-slate-200 bg-white px-3"
                                    value={form.data.school_class_id}
                                    onChange={(e) => {
                                        form.setData('school_class_id', e.target.value);
                                        handleFilterChange(e.target.value, form.data.subject_id);
                                    }}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Subject *</Label>
                                <select
                                    className="mt-1 w-full h-9 text-xs rounded-md border border-slate-200 bg-white px-3"
                                    value={form.data.subject_id}
                                    onChange={(e) => {
                                        form.setData('subject_id', e.target.value);
                                        handleFilterChange(form.data.school_class_id, e.target.value);
                                    }}
                                    disabled={!form.data.school_class_id}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {availableSubjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Duration (Minutes) *</Label>
                                <Input
                                    type="number"
                                    className="mt-1 h-9 text-xs"
                                    value={form.data.duration_minutes}
                                    onChange={(e) => form.setData('duration_minutes', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Total Target Marks *</Label>
                                <Input
                                    type="number"
                                    className="mt-1 h-9 text-xs"
                                    value={form.data.total_marks}
                                    onChange={(e) => form.setData('total_marks', e.target.value)}
                                    required
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                    Current assigned marks: <strong>{calculatedTotalMarks}</strong>
                                </span>
                            </div>

                            <div className="md:col-span-2">
                                <Label className="text-xs font-semibold">General Instructions</Label>
                                <Input
                                    className="mt-1 h-9 text-xs"
                                    value={form.data.instructions}
                                    onChange={(e) => form.setData('instructions', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="border-slate-200 shadow-sm lg:col-span-1 h-[600px] flex flex-col">
                            <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-200">
                                <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-indigo-600" /> Question Bank Pool ({initialQuestions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3 flex-1 overflow-y-auto space-y-2">
                                {!form.data.subject_id ? (
                                    <p className="text-xs text-slate-400 text-center py-10">
                                        Select a Class and Subject above to load available questions.
                                    </p>
                                ) : initialQuestions.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-10">
                                        No questions found in the bank for this subject.
                                    </p>
                                ) : (
                                    initialQuestions.map((q) => (
                                        <div
                                            key={q.id}
                                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 hover:border-indigo-300 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold uppercase px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px]">
                                                    {q.type}
                                                </span>
                                                <span className="text-slate-500">{q.default_marks} Marks</span>
                                            </div>
                                            <p className="text-slate-800 font-medium line-clamp-2">{q.question}</p>
                                            
                                            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200">
                                                {form.data.sections.map((sec, sIdx) => (
                                                    <Button
                                                        key={sIdx}
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2 bg-white"
                                                        onClick={() => addQuestionToSection(sIdx, q)}
                                                    >
                                                        + Add to Sec {String.fromCharCode(65 + sIdx)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            {form.data.sections.map((section, sIndex) => (
                                <Card key={sIndex} className="border-slate-200 shadow-sm">
                                    <div className="bg-slate-100/70 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-indigo-700">
                                                Section {String.fromCharCode(65 + sIndex)}
                                            </span>
                                            <Input
                                                className="h-7 text-xs w-64 bg-white"
                                                value={section.section_name}
                                                onChange={(e) => {
                                                    const updated = [...form.data.sections];
                                                    updated[sIndex].section_name = e.target.value;
                                                    form.setData('sections', updated);
                                                }}
                                                required
                                            />
                                        </div>
                                        {form.data.sections.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSection(sIndex)}
                                                className="h-7 text-xs text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>

                                    <CardContent className="pt-4 space-y-3">
                                        <div>
                                            <Label className="text-[11px]">Section Instructions / Rules</Label>
                                            <Input
                                                className="h-8 text-xs mt-0.5"
                                                placeholder="e.g. Attempt any 5 questions out of 7."
                                                value={section.instructions}
                                                onChange={(e) => {
                                                    const updated = [...form.data.sections];
                                                    updated[sIndex].instructions = e.target.value;
                                                    form.setData('sections', updated);
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold text-slate-700 block">
                                                Assigned Questions ({section.questions.length})
                                            </span>

                                            {section.questions.length === 0 ? (
                                                <div className="border border-dashed border-slate-200 p-4 text-center rounded text-xs text-slate-400">
                                                    No questions added here yet. Click "+ Add to Sec..." from the question bank.
                                                </div>
                                            ) : (
                                                section.questions.map((q, qIndex) => (
                                                    <div
                                                        key={qIndex}
                                                        className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200 text-xs gap-3"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="font-semibold text-slate-500 mr-2">Q{qIndex + 1}.</span>
                                                            <span className="text-slate-800">{q.question_text}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20">
                                                                <Input
                                                                    type="number"
                                                                    step="0.5"
                                                                    className="h-7 text-xs bg-white"
                                                                    value={q.marks}
                                                                    onChange={(e) => updateQuestionMarks(sIndex, qIndex, e.target.value)}
                                                                />
                                                            </div>
                                                            <span className="text-slate-500 text-[10px]">Marks</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                                                onClick={() => removeQuestionFromSection(sIndex, qIndex)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addSection}
                                    className="gap-2 text-xs font-semibold"
                                >
                                    <Plus className="w-4 h-4 text-indigo-600" /> Add New Section
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6"
                                >
                                    Save & Publish Exam Paper
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}