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
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
                        <Bookmark className="w-5 h-5 text-blue-600" />
                        {chapter.chapter_name || chapter.name}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Class:</span>
                            <span>{schoolClass.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Subject:</span>
                            <span>{subject.subject_name || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Total Topics:</span>
                            <Badge variant="secondary" className="font-semibold">
                                {topics.length}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">Created:</span>
                            <span>{formatDate(chapter.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Topics List */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-500" />
                        Associated Topics ({topics.length})
                    </h4>

                    {topics.length > 0 ? (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            {topics.map((topic, index) => (
                                <div
                                    key={topic.id || index}
                                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-slate-400 w-5">
                                            #{index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700">
                                            {topic.topic_name || topic.name}
                                        </span>
                                    </div>
                                    {topic.created_at && (
                                        <span className="text-xs text-slate-400">
                                            {formatDate(topic.created_at)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                            No topics added to this chapter yet.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}