import React from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import {X} from "lucide-react";

export default function SubjectDetailModal({ isOpen, onClose, subject }) {
    console.log('SubjectDetailModal props:', { subject }); // Debugging line
    if (!subject) return null;

    const modalFooter = (
        <Button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white ml-auto"
        >   <X className="w-4 h-4" />
            Close
        </Button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Subject Details"
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 border-b pb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Subject Name
                    </span>
                    <span className="text-base font-semibold text-slate-800">
                        {subject.subject_name}
                    </span>
                </div>

                {subject.chapters && subject.chapters.length > 0 && (
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Associated Chapters
                        </span>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                            {subject.chapters.map((ch) => (
                                <li key={ch.id}>{ch.name || ch.chapter_name + ` (${ch.school_class?.name || 'N/A'})`}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Modal>
    );
}