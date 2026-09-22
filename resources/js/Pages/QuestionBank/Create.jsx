import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Trash2,
    ArrowLeft,
    BookOpen,
    Layers,
    FileText,
    HelpCircle,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';

export default function Create({ classes = [] }) {
    // Unique ID counters for state manipulation
    const [cardCounter, setCardCounter] = useState(1);
    const [questionCounter, setQuestionCounter] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        topic_cards: [
            {
                id: 1,
                school_class_id: '',
                subject_id: '',
                chapter_id: '',
                topic_id: '',
                questions: [
                    {
                        id: 1,
                        question_type: 'mcq',
                        question: '',
                        default_marks: 1.00,
                    },
                ],
            },
        ],
    });

    // Helper to get nested subjects, chapters, topics for a given card
    const getCardOptions = (card) => {
        const selectedClass = classes.find((c) => c.id == card.school_class_id);
        const subjects = selectedClass?.subjects || [];
        const selectedSubject = subjects.find((s) => s.id == card.subject_id);
        const chapters = selectedSubject?.chapters || [];
        const selectedChapter = chapters.find((ch) => ch.id == card.chapter_id);
        const topics = selectedChapter?.topics || [];

        return { subjects, chapters, topics };
    };

    // Card Manipulation Handlers
    const addTopicCard = () => {
        const newCardId = cardCounter + 1;
        const newQuestionId = questionCounter + 1;
        setCardCounter(newCardId);
        setQuestionCounter(newQuestionId);

        setData('topic_cards', [
            ...data.topic_cards,
            {
                id: newCardId,
                school_class_id: '',
                subject_id: '',
                chapter_id: '',
                topic_id: '',
                questions: [
                    {
                        id: newQuestionId,
                        question_type: 'mcq',
                        question: '',
                        default_marks: 1.00,
                    },
                ],
            },
        ]);
    };

    const removeTopicCard = (cardIndex) => {
        if (data.topic_cards.length === 1) return;
        const updated = data.topic_cards.filter((_, idx) => idx !== cardIndex);
        setData('topic_cards', updated);
    };

    const updateCardField = (cardIndex, field, value) => {
        const updated = [...data.topic_cards];
        const card = { ...updated[cardIndex] };

        card[field] = value;

        // Reset dependent child fields when parent changes
        if (field === 'school_class_id') {
            card.subject_id = '';
            card.chapter_id = '';
            card.topic_id = '';
        } else if (field === 'subject_id') {
            card.chapter_id = '';
            card.topic_id = '';
        } else if (field === 'chapter_id') {
            card.topic_id = '';
        }

        updated[cardIndex] = card;
        setData('topic_cards', updated);
    };

    // Question Manipulation Handlers inside a Card
    const addQuestionToCard = (cardIndex) => {
        const newQuestionId = questionCounter + 1;
        setQuestionCounter(newQuestionId);

        const updated = [...data.topic_cards];
        updated[cardIndex].questions.push({
            id: newQuestionId,
            question_type: 'mcq',
            question: '',
            default_marks: 1.00,
        });

        setData('topic_cards', updated);
    };

    const removeQuestionFromCard = (cardIndex, qIndex) => {
        if (data.topic_cards[cardIndex].questions.length === 1) return;
        const updated = [...data.topic_cards];
        updated[cardIndex].questions = updated[cardIndex].questions.filter(
            (_, idx) => idx !== qIndex
        );
        setData('topic_cards', updated);
    };

    const updateQuestionField = (cardIndex, qIndex, field, value) => {
        const updated = [...data.topic_cards];
        updated[cardIndex].questions[qIndex][field] = value;
        setData('topic_cards', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('question-bank.batch.store'));
    };

    return (
        <AppLayout title="Batch Add Questions">
            <Head title="Batch Add Questions - Question Bank" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header & Back Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('question-bank.index')}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-indigo-600" />
                                Batch Question Entry
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 pl-7">
                            Configure Class, Subject, Chapter, and Topic to add multiple questions under each topic.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('question-bank.index')}>
                            <Button variant="outline" className="rounded-xl border-slate-200">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl font-semibold px-6"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {processing ? 'Saving...' : 'Save All Questions'}
                        </Button>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {data.topic_cards.map((card, cardIndex) => {
                        const { subjects, chapters, topics } = getCardOptions(card);
                        const cardErrors = errors[`topic_cards.${cardIndex}`] || {};

                        return (
                            <div
                                key={card.id}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                            >
                                {/* Topic Card Header */}
                                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Topic Card #{cardIndex + 1}
                                        </span>
                                        <h2 className="text-base font-semibold text-slate-200">
                                            Academic Target Setup
                                        </h2>
                                    </div>

                                    {data.topic_cards.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTopicCard(cardIndex)}
                                            className="text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1.5" />
                                            Remove Card
                                        </Button>
                                    )}
                                </div>

                                {/* Cascading Academic Selection Grid */}
                                <div className="p-6 bg-slate-50/50 border-b border-slate-200/60">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* 1. Class Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                1. Select Class *
                                            </Label>
                                            <select
                                                value={card.school_class_id}
                                                onChange={(e) =>
                                                    updateCardField(
                                                        cardIndex,
                                                        'school_class_id',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                                required
                                            >
                                                <option value="">-- Select Class --</option>
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors[`topic_cards.${cardIndex}.school_class_id`] && (
                                                <p className="text-xs text-red-500">
                                                    Class is required
                                                </p>
                                            )}
                                        </div>

                                        {/* 2. Subject Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                                2. Select Subject *
                                            </Label>
                                            <select
                                                value={card.subject_id}
                                                onChange={(e) =>
                                                    updateCardField(
                                                        cardIndex,
                                                        'subject_id',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={!card.school_class_id}
                                                className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                                required
                                            >
                                                <option value="">-- Select Subject --</option>
                                                {subjects.map((sub) => (
                                                    <option key={sub.id} value={sub.id}>
                                                        {sub.subject_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors[`topic_cards.${cardIndex}.subject_id`] && (
                                                <p className="text-xs text-red-500">
                                                    Subject is required
                                                </p>
                                            )}
                                        </div>

                                        {/* 3. Chapter Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                3. Select Chapter
                                            </Label>
                                            <select
                                                value={card.chapter_id}
                                                onChange={(e) =>
                                                    updateCardField(
                                                        cardIndex,
                                                        'chapter_id',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={!card.subject_id}
                                                className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                            >
                                                <option value="">-- Select Chapter (Optional) --</option>
                                                {chapters.map((ch) => (
                                                    <option key={ch.id} value={ch.id}>
                                                        {ch.chapter_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 4. Topic Selection */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                                                4. Select Topic
                                            </Label>
                                            <select
                                                value={card.topic_id}
                                                onChange={(e) =>
                                                    updateCardField(
                                                        cardIndex,
                                                        'topic_id',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={!card.chapter_id}
                                                className="w-full h-10 px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                            >
                                                <option value="">-- Select Topic (Optional) --</option>
                                                {topics.map((top) => (
                                                    <option key={top.id} value={top.id}>
                                                        {top.topic_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Questions List Container for this Topic Card */}
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                            Questions List ({card.questions.length})
                                        </h3>
                                        <span className="text-xs text-slate-500">
                                            Add as many questions as needed for this topic
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {card.questions.map((q, qIndex) => (
                                            <div
                                                key={q.id}
                                                className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 relative space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                                            {qIndex + 1}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            Question Detail
                                                        </span>
                                                    </div>

                                                    {card.questions.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeQuestionFromCard(cardIndex, qIndex)
                                                            }
                                                            className="text-slate-400 hover:text-red-500 h-8 px-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-slate-500">
                                                            Question Type *
                                                        </Label>
                                                        <select
                                                            value={q.question_type}
                                                            onChange={(e) =>
                                                                updateQuestionField(
                                                                    cardIndex,
                                                                    qIndex,
                                                                    'question_type',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white mt-1 font-medium"
                                                        >
                                                            <option value="mcq">MCQ</option>
                                                            <option value="short">Short Answer</option>
                                                            <option value="long">Long Answer</option>
                                                            <option value="essay">Essay</option>
                                                            <option value="letter">Letter</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-slate-500">
                                                            Marks *
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.5"
                                                            min="0.5"
                                                            value={q.default_marks}
                                                            onChange={(e) =>
                                                                updateQuestionField(
                                                                    cardIndex,
                                                                    qIndex,
                                                                    'default_marks',
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-9 text-xs mt-1 bg-white"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <Label className="text-xs text-slate-500">
                                                            Question Text *
                                                        </Label>
                                                        <textarea
                                                            value={q.question}
                                                            onChange={(e) =>
                                                                updateQuestionField(
                                                                    cardIndex,
                                                                    qIndex,
                                                                    'question',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Type the question content here..."
                                                            rows={2}
                                                            className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 mt-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action to add question to this topic */}
                                    <div className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addQuestionToCard(cardIndex)}
                                            className="border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50 rounded-xl font-semibold text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            + Add Question to this Topic
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Global Add Another Topic Card Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-900 rounded-2xl text-white shadow-lg">
                        <div>
                            <h3 className="text-base font-bold text-slate-100">
                                Need to add questions for another topic?
                            </h3>
                            <p className="text-xs text-slate-400">
                                Click below to append another topic card with independent Class, Subject, Chapter, and Topic options.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                onClick={addTopicCard}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md px-5"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                + Add Another Topic Card
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 font-bold px-8 rounded-xl"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            {processing ? 'Saving...' : 'Save All Questions'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
