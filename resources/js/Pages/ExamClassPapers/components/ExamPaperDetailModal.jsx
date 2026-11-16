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
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
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
                <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
                        <FileText className="w-5 h-5 text-primary" />
                        {paper.paper_title || paper.title}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <GraduationCap className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Class:</span>
                            <span>{paper.school_class?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Exam Term:</span>
                            <span className="font-semibold text-primary">
                                {paper.exam_session?.title || paper.exam_schedule?.exam_session?.title || 'General Session'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Subject:</span>
                            <span>{paper.subject?.subject_name || paper.subject?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Award className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Total Marks:</span>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-semibold">
                                {paper.total_marks || 0} Marks
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Duration:</span>
                            <span>{paper.duration_minutes || 0} mins</span>
                        </div>
                    </div>
                </div>

                {paper.instructions && (
                    <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instructions</h4>
                        <div className="p-3 bg-muted/20 border border-border rounded-lg text-sm text-foreground whitespace-pre-line">
                            {paper.instructions}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}