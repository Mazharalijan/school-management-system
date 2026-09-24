import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle, BookOpen, Bookmark, Layers } from 'lucide-react';

// Domain Subcomponents
import QuestionsTab from './components/tabs/QuestionsTab';
import SubjectsTab from './components/tabs/SubjectsTab';
import ChaptersTab from './components/tabs/ChaptersTab';
import TopicsTab from './components/tabs/TopicsTab';

// Modals
import QuestionFormModal from './components/QuestionFormModal';
import SubjectFormModal from './components/SubjectFormModal';
import ChapterFormModal from './components/ChapterFormModal';
import TopicFormModal from './components/TopicFormModal';

export default function Index({
    questions = {},
    subjects = {},
    chapters = {},
    topics = {},
    classes = [],
    allSubjects = [],
    filters = {},
    activeTab = 'questions',
}) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    // Modal Control States
    const [modalState, setModalState] = useState({
        type: null, // 'question' | 'subject' | 'chapter' | 'topic'
        isOpen: false,
        data: null,
    });

    // Handle Tab Switch & URL Sync
    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        router.get(
            route('question-bank.index'),
            { tab },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const openCreateModal = (type) => setModalState({ type, isOpen: true, data: null });
    const openEditModal = (type, data) => setModalState({ type, isOpen: true, data });
    const closeModal = () => setModalState({ type: null, isOpen: false, data: null });

    return (
        <AppLayout title="Question Bank Management">
            <Head title="Question Bank Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <PageHeader
                    title="Question Bank"
                    subtitle="Manage academic questions, subjects, chapters, and topics seamlessly."
                >
                    {currentTab === 'questions' && (
                        <Button onClick={() => openCreateModal('question')} className="text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    )}
                    {currentTab === 'subjects' && (
                        <Button onClick={() => openCreateModal('subject')} className="text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add Subject
                        </Button>
                    )}
                    {currentTab === 'chapters' && (
                        <Button onClick={() => openCreateModal('chapter')} className="text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add Chapter
                        </Button>
                    )}
                    {currentTab === 'topics' && (
                        <Button onClick={() => openCreateModal('topic')} className="text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add Topic
                        </Button>
                    )}
                </PageHeader>

                {/* Main Tabs Navigation */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-lg mb-6 flex flex-wrap h-auto">
                        <TabsTrigger value="questions" className="flex items-center gap-2 px-4 py-2">
                            <HelpCircle className="h-4 w-4" /> Questions
                        </TabsTrigger>
                        <TabsTrigger value="subjects" className="flex items-center gap-2 px-4 py-2">
                            <BookOpen className="h-4 w-4" /> Subjects
                        </TabsTrigger>
                        <TabsTrigger value="chapters" className="flex items-center gap-2 px-4 py-2">
                            <Bookmark className="h-4 w-4" /> Chapters
                        </TabsTrigger>
                        <TabsTrigger value="topics" className="flex items-center gap-2 px-4 py-2">
                            <Layers className="h-4 w-4" /> Topics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions">
                        <QuestionsTab
                            questions={questions}
                            classes={classes}
                            filters={filters}
                            onEdit={(item) => openEditModal('question', item)}
                        />
                    </TabsContent>

                    <TabsContent value="subjects">
                        <SubjectsTab
                            subjects={subjects}
                            classes={classes}
                            filters={filters}
                            onEdit={(item) => openEditModal('subject', item)}
                        />
                    </TabsContent>

                    <TabsContent value="chapters">
                        <ChaptersTab
                            chapters={chapters}
                            classes={classes}
                            filters={filters}
                            onEdit={(item) => openEditModal('chapter', item)}
                        />
                    </TabsContent>

                    <TabsContent value="topics">
                        <TopicsTab
                            topics={topics}
                            classes={classes}
                            filters={filters}
                            onEdit={(item) => openEditModal('topic', item)}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Render Contextual Form Modals */}
            <QuestionFormModal
                isOpen={modalState.isOpen && modalState.type === 'question'}
                onClose={closeModal}
                question={modalState.data}
                classes={classes}
                allSubjects={allSubjects}
            />
            <SubjectFormModal
                isOpen={modalState.isOpen && modalState.type === 'subject'}
                onClose={closeModal}
                subject={modalState.data}
                classes={classes}
            />
            <ChapterFormModal
                isOpen={modalState.isOpen && modalState.type === 'chapter'}
                onClose={closeModal}
                chapter={modalState.data}
                classes={classes}
                allSubjects={allSubjects}
            />
            <TopicFormModal
                isOpen={modalState.isOpen && modalState.type === 'topic'}
                onClose={closeModal}
                topic={modalState.data}
                classes={classes}
            />
        </AppLayout>
    );
}