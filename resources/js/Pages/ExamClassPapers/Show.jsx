import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Plus, 
    Edit, 
    Trash2, 
    BookOpen, 
    Layers, 
    FileText, 
    Clock, 
    Award 
} from 'lucide-react';
import SectionFormModal from './components/SectionFormModal';

export default function Show({ paper, sections = [], questionBank = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const { delete: destroy } = useForm();

    // Calculate overall paper statistics
    const totalSectionMarks = sections.reduce((acc, sec) => acc + (parseFloat(sec.total_marks) || 0), 0);

    const handleOpenCreateModal = () => {
        setSelectedSection(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (section) => {
        setSelectedSection(section);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSection(null);
    };

    const handleDeleteSection = (sectionId) => {
        if (confirm('Are you sure you want to delete this section and all its attached questions?')) {
            destroy(route('exam-paper-sections.destroy', sectionId));
        }
    };

    return (
        <AppLayout title={`Paper: ${paper.paper_title}`}>
            <div className="max-w-8xl mx-auto py-6 px-4 sm:px-6 space-y-6">
                {/* Navigation Back Link */}
                <div className="flex items-center gap-2">
                    <Link
                        href={route('exam-class-papers.index')}
                        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back to Exam Papers
                    </Link>
                </div>

                {/* Paper Header / Summary Card */}
                <div className="bg-card border border-border rounded-sm p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-medium">
                                {paper.school_class?.name || paper.school_class?.class_name || 'Class'}
                            </Badge>
                            <Badge variant="outline">
                                {paper.subject?.name || paper.subject?.subject_name || 'Subject'}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">{paper.paper_title}</h1>
                        {paper.instructions && (
                            <p className="text-xs text-muted-foreground max-w-2xl">
                                <span className="font-semibold text-foreground">Instructions:</span> {paper.instructions}
                            </p>
                        )}
                    </div>

                    {/* Stats Metrics */}
                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <div className="text-center px-3">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                                <Award className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-muted-foreground block">Total Marks</span>
                            <span className="font-bold text-foreground text-sm">
                                {totalSectionMarks} / {paper.total_marks}
                            </span>
                        </div>

                        <div className="text-center px-3 border-l border-border">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-muted-foreground block">Duration</span>
                            <span className="font-bold text-foreground text-sm">{paper.duration_minutes} Mins</span>
                        </div>

                        <div className="text-center px-3 border-l border-border">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                                <Layers className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-muted-foreground block">Sections</span>
                            <span className="font-bold text-foreground text-sm">{sections.length}</span>
                        </div>
                    </div>
                </div>

                {/* Section Header & Add Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            Paper Sections & Questions
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Manage sections and attach questions specifically configured for this paper.
                        </p>
                    </div>
                    <Button 
                        onClick={handleOpenCreateModal} 
                        className="shadow-sm font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Add Section
                    </Button>
                </div>

                {/* Sections List */}
                {sections.length === 0 ? (
                    <div className="bg-card border border-border rounded-sm py-12 text-center text-muted-foreground">
                        <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
                        <h3 className="font-semibold text-foreground text-sm">No Sections Configured Yet</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            Start building your paper by creating sections (e.g. Section A for MCQs, Section B for Short Questions).
                        </p>
                        <Button 
                            onClick={handleOpenCreateModal} 
                            variant="outline"
                            className="mt-4 text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add First Section
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <div 
                                key={section.id} 
                                className="bg-card border border-border rounded-sm overflow-hidden shadow-sm"
                            >
                                {/* Section Sub-header */}
                                <div className="bg-muted/40 px-5 py-3.5 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge className="font-bold px-2.5 py-0.5">
                                            Section {section.section_name}
                                        </Badge>
                                        <h3 className="font-semibold text-foreground text-sm">
                                            {section.title}
                                        </h3>
                                        <Badge variant="outline" className="font-mono text-[11px]">
                                            Type: {(section.question_type || 'mcq').toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-muted-foreground font-medium">
                                            <span className="text-foreground font-semibold">{section.total_marks}</span> Marks
                                            <span className="mx-1.5">|</span>
                                            <span className="text-foreground font-semibold">{section.questions?.length || 0}</span> Questions
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleOpenEditModal(section)}
                                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="h-8 px-2 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Attached Questions Details */}
                                <div className="p-4 divide-y divide-border">
                                    {!section.questions || section.questions.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-muted-foreground">
                                            No questions attached to this section. Click Edit to attach questions.
                                        </div>
                                    ) : (
                                        section.questions.map((q, idx) => {
                                            const bankItem = q.question_bank || q.questionBank || q;
                                            return (
                                                <div key={q.id || idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                                                    <span className="text-xs font-semibold text-muted-foreground mt-0.5 w-5 text-right">
                                                        {idx + 1}.
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-foreground font-medium leading-relaxed">
                                                            {bankItem.question_text || bankItem.question || 'Question Content'}
                                                        </p>
                                                        {bankItem.chapter && (
                                                            <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                                                Chapter: {bankItem.chapter.chapter_name || bankItem.chapter.title || 'N/A'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-xs">
                                                        {q.marks || bankItem.marks || 1} M
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Section Form Modal */}
                <SectionFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    section={selectedSection}
                    papers={[paper]} // Pre-select current paper context
                    questionBank={questionBank}
                />
            </div>
        </AppLayout>
    );
}