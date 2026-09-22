import React from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import {X} from "lucide-react";

export default function QuestionDetailModal({ isOpen, onClose, question }) {
    if (!question) return null;

    const modalFooter = (
        <Button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white ml-auto"
        >
            <X className="w-4 h-4" />
            Close
        </Button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Question Details"
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Question Content
                    </span>
                    <p className="text-slate-800 text-base font-medium whitespace-pre-wrap">
                        {question.question}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Type
                        </span>
                        <span className="text-sm font-semibold text-slate-700 uppercase">
                            {question.question_type}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Class
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {question.school_class?.name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Subject
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {question.subject?.subject_name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Chapter
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {question.chapter?.name || question.chapter?.chapter_name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Topic
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {question.topic?.topic_name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Marks
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {question.marks || 1}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}