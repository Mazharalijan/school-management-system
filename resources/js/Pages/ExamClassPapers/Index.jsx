import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Layers, Printer, LayoutDashboard } from 'lucide-react';

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
    subjects = [],
    questionBanks = [],
    filters = {},
    activeTab = 'overview',
}) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    const [modalState, setModalState] = useState({
        type: null, // 'paper' | 'detail'
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
                    subtitle="Create papers, assemble sections with attached questions, and trigger bulk printing."
                >
                    {currentTab === 'papers' && (
                        <Button onClick={() => openCreateModal('paper')} className="text-white bg-slate-900 hover:bg-slate-800">
                            <Plus className="h-4 w-4 mr-2" /> Add Paper
                        </Button>
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
                        <TabsTrigger value="print" className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                            <Printer className="h-4 w-4 text-amber-600" /> Print & Bulk Print
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab
                            papers={papers}
                            classes={classes}
                            subjects={subjects}
                            filters={filters}
                            onViewDetail={(paper) => openCreateModal('detail', paper)}
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
            />
        </AppLayout>
    );
}