import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Layers, Printer, LayoutDashboard, Award, ScanLine, Save } from 'lucide-react';
import MarksIndex from './marks/Index';

// Domain Tabs
import OverviewTab from './components/tabs/OverviewTab';
import PapersTab from './components/tabs/PapersTab';
import SectionsTab from './components/tabs/SectionsTab';
import PrintTab from './components/tabs/PrintTab';

// Modals
import PaperFormModal from './components/PaperFormModal';
import ExamPaperDetailModal from './components/ExamPaperDetailModal';

export default function Index({
    papers = {},
    sections = {},
    classes = [],
    examSessions = [],
    subjects = [],
    questionBanks = [],
    filters = {},
    activeTab = 'overview',
    teacher = { name: 'System Admin', emp_id: 'EMP-001', designation: 'Class Teacher' },
    examTerm = { id: 1, name: 'Term Examination 2026' },
    classDetails = { id: 101, name: 'Grade 5', section: 'Section A' },
    students = []
}) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    // Track active modals
    const [modalState, setModalState] = useState({
        type: null, // 'paper' | 'detail' | 'ocr'
        isOpen: false,
        data: null,
    });

    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        router.get(
            route('exam-class-papers.index'),
            { tab },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const openCreateModal = (type, data = null) => setModalState({ type, isOpen: true, data });
    const closeModal = () => setModalState({ type: null, isOpen: false, data: null });

    return (
        <AppLayout title="Exam Class Papers Management">
            <Head title="Exam Class Papers Management" />

            <div className="space-y-6">
                <PageHeader
                    title="Exam Class Papers"
                    subtitle="Create papers, assemble sections with attached questions, evaluate marks, and trigger printing."
                >
                    {/* Unified Top Action Buttons */}
                    {currentTab === 'papers' && (
                        <Button onClick={() => openCreateModal('paper')} className="text-white bg-slate-900 hover:bg-slate-800">
                            <Plus className="h-4 w-4 mr-2" /> Add Paper
                        </Button>
                    )}

                    {currentTab === 'marks' && (
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => openCreateModal('ocr')} 
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                <ScanLine className="h-4 w-4 mr-2 text-indigo-600" /> Offline OCR Scan
                            </Button>

                            <Button 
                                variant="outline" 
                                onClick={() => window.print()} 
                                className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4 mr-2 text-slate-500" /> Print Sheet
                            </Button>

                            <Button className="text-white bg-indigo-600 hover:bg-indigo-700">
                                <Save className="h-4 w-4 mr-2" /> Save Marks
                            </Button>
                        </div>
                    )}
                </PageHeader>

                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-lg mb-6 flex flex-wrap h-auto">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <LayoutDashboard className="h-4 w-4 text-slate-600" /> Overview & Search
                        </TabsTrigger>
                        <TabsTrigger value="papers" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-blue-600" /> Paper Management
                        </TabsTrigger>
                        <TabsTrigger value="sections" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <Layers className="h-4 w-4 text-emerald-600" /> Section & Question Builder
                        </TabsTrigger>
                        <TabsTrigger value="marks" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <Award className="h-4 w-4 text-indigo-600" /> Marks & Evaluation
                        </TabsTrigger>
                        <TabsTrigger value="print" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <Printer className="h-4 w-4 text-amber-600" /> Print & Bulk Print
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab
                            papers={papers}
                            classes={classes}
                            examSessions={examSessions}
                            subjects={subjects}
                            filters={filters}
                            onViewDetail={(paper) => openCreateModal('detail', paper)}
                            onEditPaper={(paper) => openCreateModal('paper', paper)}
                            onCreatePaper={(defaultData) => openCreateModal('paper', defaultData)}
                        />
                    </TabsContent>

                    <TabsContent value="papers">
                        <PapersTab
                            papers={papers}
                            classes={classes}
                            subjects={subjects}
                            filters={filters}
                            onEdit={(paper) => openCreateModal('paper', paper)}
                            onViewDetail={(paper) => openCreateModal('detail', paper)}
                        />
                    </TabsContent>

                    <TabsContent value="sections">
                        <SectionsTab
                            sections={sections}
                            papers={papers?.data || (Array.isArray(papers) ? papers : [])}
                            questionBanks={questionBanks}
                        />
                    </TabsContent>

                    <TabsContent value="marks">
                        <MarksIndex
                            teacher={teacher}
                            examTerm={examTerm}
                            classDetails={classDetails}
                            papers={papers?.data || (Array.isArray(papers) ? papers : [])}
                            initialStudents={students}
                            classes={classes}
                            subjects={subjects}
                            filters={filters}
                            externalOcrOpen={modalState.type === 'ocr' && modalState.isOpen}
                            onCloseExternalOcr={closeModal}
                        />
                    </TabsContent>

                    <TabsContent value="print">
                        <PrintTab papers={papers} />
                    </TabsContent>
                </Tabs>
            </div>

            <ExamPaperDetailModal
                isOpen={Boolean(modalState.isOpen && modalState.type === 'detail')}
                onClose={closeModal}
                paper={modalState.type === 'detail' ? modalState.data : null}
            />

            <PaperFormModal
                isOpen={Boolean(modalState.isOpen && modalState.type === 'paper')}
                onClose={closeModal}
                paper={modalState.type === 'paper' ? modalState.data : null}
                classes={classes}
                subjects={subjects}
                examSessions={examSessions}
            />
        </AppLayout>
    );
}