import React from 'react';
import { Link } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, BookOpen, Award, Calendar, Layers, X, Clock } from 'lucide-react';

export default function ExamPaperDetailModal({ isOpen, onClose, paper = null }) {
    if (!paper) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exam Paper Summary"
            maxWidth="sm:max-w-xl"
            footer={
                <div className="flex justify-between w-full items-center">
                    <Link
                        href={`${route('exam-class-papers.show', paper.id)}?tab=sections`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        <Layers className="w-4 h-4" />
                        Open Section Builder &rarr;
                    </Link>
                    <Button variant="outline" onClick={onClose}>
                        <X className="w-4 h-4 mr-1" /> Close
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {paper.paper_title || paper.title}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Class:</span>
                            <span>{paper.school_class?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Subject:</span>
                            <span>{paper.subject?.subject_name || paper.subject?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <Award className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Total Marks:</span>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-semibold">
                                {paper.total_marks || 0} Marks
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Duration:</span>
                            <span>{paper.duration_minutes || 0} mins</span>
                        </div>
                    </div>
                </div>

                {paper.instructions && (
                    <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructions</h4>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 whitespace-pre-line">
                            {paper.instructions}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}