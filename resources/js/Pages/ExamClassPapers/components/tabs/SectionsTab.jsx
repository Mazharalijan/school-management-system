import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { Plus, Trash2, Edit, Layers, BookOpen } from 'lucide-react';
import SectionFormModal from '../SectionFormModal';

export default function SectionsTab({ 
    sections = {}, 
    papers = [], 
    questionBanks = [] 
}) {
    const sectionList = sections?.data || (Array.isArray(sections) ? sections : []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const { delete: destroy } = useForm();

    const handleOpenCreateModal = () => {
        setSelectedSection(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (sec) => {
        setSelectedSection(sec);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSection(null);
    };

    const handleDeleteSection = (id) => {
        if (confirm('Are you sure you want to delete this section?')) {
            destroy(route('exam-paper-sections.destroy', id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-sm border border-border text-card-foreground">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Section Builder
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Organize paper sections and attach filtered items from the Question Bank.
                    </p>
                </div>
                <Button 
                    onClick={handleOpenCreateModal} 
                    className="shadow-sm font-semibold"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Create New Section
                </Button>
            </div>

            {/* Existing Sections Listing */}
            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm text-card-foreground">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                        <tr>
                            <th className="px-5 py-3">Paper</th>
                            <th className="px-5 py-3">Section</th>
                            <th className="px-5 py-3">Title</th>
                            <th className="px-5 py-3">Marks</th>
                            <th className="px-5 py-3">Attached Questions</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sectionList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-muted-foreground">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                                    <p className="text-xs">No paper sections created yet.</p>
                                </td>
                            </tr>
                        ) : (
                            sectionList.map((sec) => (
                                <tr key={sec.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-5 py-3.5 font-medium text-foreground">
                                        {sec.exam_class_paper?.paper_title || 'Unassigned'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <Badge variant="outline" className="font-semibold">
                                            Section {sec.section_name}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3.5 font-medium text-foreground">
                                        {sec.title}
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                                        {sec.total_marks} Marks
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground">
                                        <Badge variant="outline">
                                            {sec.questions_count || sec.section_questions?.length || sec.questions?.length || 0} Questions
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleOpenEditModal(sec)} 
                                                className="h-8 px-2.5 text-xs font-semibold"
                                            >
                                                <Edit className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => handleDeleteSection(sec.id)} 
                                                className="h-8 px-2.5 text-xs font-semibold"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination data={sections} />
            </div>

            {/* Modal for Creating & Updating Sections */}
            <SectionFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                section={selectedSection}
                papers={papers}
                questionBank={questionBanks}
            />
        </div>
    );
}