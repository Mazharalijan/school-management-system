import React from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import {X} from "lucide-react";

export default function TopicDetailModal({ isOpen, onClose, topic }) {
    console.log('TopicDetailModal props:', {  topic }); // Debugging line
    if (!topic) return null;

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
            title="Topic Details"
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 border-b pb-4">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Topic Name
                        </span>
                        <span className="text-base font-semibold text-slate-800">
                            {topic.topic_name}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Class
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {topic?.chapter?.school_class?.name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Subject
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {topic?.chapter?.subject?.subject_name || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Chapter
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {topic?.chapter?.chapter_name || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}