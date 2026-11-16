import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Create({ exam, availableQuestions = [] }) {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        exam_id: exam?.id,
        title: exam?.title ? `${exam.title} - Question Paper` : 'Question Paper',
        instructions: 'Read all questions carefully before answering.',
        total_marks: exam?.total_marks || 100,
        questions: [], // Array of { question_id, marks, order }
    });

    const toggleQuestion = (question) => {
        const exists = selectedQuestions.some((q) => q.id === question.id);
        let updated = [];

        if (exists) {
            updated = selectedQuestions.filter((q) => q.id !== question.id);
        } else {
            updated = [...selectedQuestions, { ...question, paper_marks: question.default_marks || 5 }];
        }

        setSelectedQuestions(updated);
        syncFormQuestions(updated);
    };

    const handleMarksChange = (id, newMarks) => {
        const updated = selectedQuestions.map((q) =>
            q.id === id ? { ...q, paper_marks: Number(newMarks) } : q
        );
        setSelectedQuestions(updated);
        syncFormQuestions(updated);
    };

    const syncFormQuestions = (questionsList) => {
        setData(
            'questions',
            questionsList.map((q, idx) => ({
                question_id: q.id,
                marks: q.paper_marks,
                order: idx + 1,
            }))
        );
    };

    const currentTotalMarks = selectedQuestions.reduce((sum, q) => sum + (q.paper_marks || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('papers.store'));
    };

    const filteredAvailableQuestions = availableQuestions?.filter((q) =>
        (q.question || q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout title="Create Question Paper">
            <Head title="Paper Builder" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                <PageHeader
                    title="Exam Paper Builder"
                    subtitle={`${exam?.title || ''} (${exam?.school_class?.name || ''} - ${exam?.subject?.subject_name || ''})`}
                    actions={
                        <div className="text-right">
                            <span className="text-xs uppercase font-semibold text-muted-foreground block">Total Target Marks</span>
                            <span className={`text-xl font-bold ${currentTotalMarks === data.total_marks ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {currentTotalMarks} / {data.total_marks}
                            </span>
                        </div>
                    }
                />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Paper Settings & Selected Questions */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-foreground">Paper Details</h2>
                                <div>
                                    <Label className="text-xs font-semibold uppercase mb-1">Paper Title</Label>
                                    <Input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold uppercase mb-1">General Instructions</Label>
                                    <textarea
                                        rows="2"
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        className="mt-1 w-full bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring focus:border-input"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Selected Paper Outline */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-foreground mb-4">Selected Questions ({selectedQuestions.length})</h2>
                                
                                {selectedQuestions.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                        Select questions from the right panel to construct the paper.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedQuestions.map((q, idx) => (
                                            <div key={q.id} className="p-4 border border-border rounded-lg bg-muted/30 relative flex justify-between gap-4">
                                                <div className="space-y-1 flex-1">
                                                    <span className="text-xs font-bold text-primary">Q{idx + 1}.</span>
                                                    <p className="text-sm text-foreground font-medium">{q.question || q.question_text}</p>
                                                    <span className="inline-block px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                                                        {(q.question_type || '').replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Marks</label>
                                                        <Input
                                                            type="number"
                                                            value={q.paper_marks}
                                                            onChange={(e) => handleMarksChange(q.id, e.target.value)}
                                                            className="w-16 h-8 text-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleQuestion(q)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing || selectedQuestions.length === 0}
                                        className="font-semibold"
                                    >
                                        Save Exam Paper
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Question Bank Picker */}
                    <div className="lg:col-span-5">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-foreground">Question Pool</h2>
                                
                                <Input
                                    type="text"
                                    placeholder="Search available questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {filteredAvailableQuestions?.map((q) => {
                                        const isSelected = selectedQuestions.some((item) => item.id === q.id);
                                        return (
                                            <div
                                                key={q.id}
                                                onClick={() => toggleQuestion(q)}
                                                className={`p-3 rounded-md border cursor-pointer transition ${
                                                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">{q.question_type}</span>
                                                    <span className="text-xs font-bold text-foreground">{q.default_marks} Marks</span>
                                                </div>
                                                <p className="text-xs text-foreground line-clamp-2">{q.question || q.question_text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}