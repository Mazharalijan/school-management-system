import React from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Bookmark, Layers, GraduationCap, Calendar, X } from 'lucide-react';

export default function ChapterDetailsModal({ isOpen, onClose, chapter = null }) {
    if (!chapter) return null;

    const schoolClass = chapter.school_class || chapter.schoolClass || {};
    const subject = chapter.subject || {};
    const topics = chapter.topics || [];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const modalFooter = (
        <div className="flex justify-end w-full">
            <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-1" /> Close
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chapter Overview"
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <div className="space-y-6">
                {/* Header Information Card */}
                <div className="p-4 bg-muted/40 rounded-xs border border-border space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
                        <Bookmark className="w-5 h-5 text-primary" />
                        {chapter.chapter_name || chapter.name}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <GraduationCap className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Class:</span>
                            <span>{schoolClass.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Subject:</span>
                            <span>{subject.subject_name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Layers className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Total Topics:</span>
                            <Badge variant="secondary" className="font-semibold">
                                {topics.length}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 text-muted-foreground/60" />
                            <span className="font-medium text-foreground">Created:</span>
                            <span>{formatDate(chapter.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Topics List */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Associated Topics ({topics.length})
                    </h4>

                    {topics.length > 0 ? (
                        <div className="divide-y divide-border border border-border rounded-sm overflow-hidden bg-card">
                            {topics.map((topic, index) => (
                                <div
                                    key={topic.id || index}
                                    className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-5">
                                            #{index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {topic.topic_name || topic.name}
                                        </span>
                                    </div>
                                    {topic.created_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(topic.created_at)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center border border-dashed border-border rounded-sm text-muted-foreground text-sm">
                            No topics added to this chapter yet.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}