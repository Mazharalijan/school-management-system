import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Create({ exam, availableQuestions }) {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        exam_id: exam.id,
        title: `${exam.title} - Question Paper`,
        instructions: 'Read all questions carefully before answering.',
        total_marks: exam.total_marks || 100,
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

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Exam Paper Builder</h1>
                        <p className="text-sm text-slate-500">
                            {exam?.title} ({exam?.school_class?.name} - {exam?.subject?.subject_name})
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs uppercase font-semibold text-slate-500 block">Total Target Marks</span>
                        <span className={`text-xl font-bold ${currentTotalMarks === data.total_marks ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {currentTotalMarks} / {data.total_marks}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Paper Settings & Selected Questions */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 space-y-4">
                            <h2 className="text-lg font-semibold text-slate-700">Paper Details</h2>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Paper Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                />
                                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">General Instructions</label>
                                <textarea
                                    rows="2"
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                />
                            </div>
                        </div>

                        {/* Selected Paper Outline */}
                        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">Selected Questions ({selectedQuestions.length})</h2>
                            
                            {selectedQuestions.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-lg">
                                    Select questions from the right panel to construct the paper.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedQuestions.map((q, idx) => (
                                        <div key={q.id} className="p-4 border rounded-md bg-slate-50 relative flex justify-between gap-4">
                                            <div className="space-y-1 flex-1">
                                                <span className="text-xs font-bold text-indigo-600">Q{idx + 1}.</span>
                                                <p className="text-sm text-slate-800 font-medium">{q.question || q.question_text}</p>
                                                <span className="inline-block px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded">
                                                    {(q.question_type || '').replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500">Marks</label>
                                                    <input
                                                        type="number"
                                                        value={q.paper_marks}
                                                        onChange={(e) => handleMarksChange(q.id, e.target.value)}
                                                        className="w-16 text-sm border-slate-300 rounded-md py-1"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleQuestion(q)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || selectedQuestions.length === 0}
                                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Save Exam Paper
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Bank Picker */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-lg shadow border border-slate-200 space-y-4">
                        <h2 className="text-lg font-semibold text-slate-700">Question Pool</h2>
                        
                        <input
                            type="text"
                            placeholder="Search available questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border-slate-300 rounded-md text-sm"
                        />

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {filteredAvailableQuestions?.map((q) => {
                                const isSelected = selectedQuestions.some((item) => item.id === q.id);
                                return (
                                    <div
                                        key={q.id}
                                        onClick={() => toggleQuestion(q)}
                                        className={`p-3 rounded-md border cursor-pointer transition ${
                                            isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-semibold text-slate-500 uppercase">{q.question_type}</span>
                                            <span className="text-xs font-bold text-slate-700">{q.default_marks} Marks</span>
                                        </div>
                                        <p className="text-xs text-slate-800 line-clamp-2">{q.question || q.question_text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}