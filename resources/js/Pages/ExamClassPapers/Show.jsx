import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Layers, 
    Printer, 
    ArrowLeft, 
    Clock, 
    Award 
} from 'lucide-react';

import OverviewTab from './components/OverviewTab';
import SectionsTab from './components/SectionsTab';
import PrintDistributionTab from './components/PrintDistributionTab';

export default function Show({ paper, examSchedules = [], questionBanks = [] }) {
    const [activeTab, setActiveTab] = useState('sections');

    const calculatedTotalMarks = paper.sections?.reduce(
        (sum, sec) => sum + (parseFloat(sec.total_marks) || 0), 0
    ) || 0;

    return (
        <AppLayout title={`Manage: ${paper.paper_title}`}>
            <Head title={`Manage: ${paper.paper_title}`} />

            <div className="space-y-6">
                {/* Header Back & Info Bar */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route('exam-class-papers.index'))}
                        className="text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Papers
                    </Button>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {paper.duration_minutes || 0} mins
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none font-semibold">
                            <Award className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            {calculatedTotalMarks} / {paper.total_marks || 0} Marks
                        </Badge>
                    </div>
                </div>

                <PageHeader
                    title={paper.paper_title}
                    subtitle={`${paper.school_class?.name || 'Class'} • ${paper.subject?.subject_name || paper.subject?.name || 'Subject'}`}
                    icon={FileText}
                />

                {/* Tab Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-lg mb-6 flex flex-wrap h-auto">
                        <TabsTrigger value="sections" className="flex items-center gap-2 px-4 py-2 text-sm">
                            <Layers className="h-4 w-4" /> Paper Builder & Sections ({paper.sections?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2 text-sm">
                            <FileText className="h-4 w-4" /> Overview & Settings
                        </TabsTrigger>
                        <TabsTrigger value="print" className="flex items-center gap-2 px-4 py-2 text-sm">
                            <Printer className="h-4 w-4" /> Print & Distribution
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sections">
                        <SectionsTab paper={paper} questionBanks={questionBanks} />
                    </TabsContent>

                    <TabsContent value="overview">
                        <OverviewTab paper={paper} examSchedules={examSchedules} />
                    </TabsContent>

                    <TabsContent value="print">
                        <PrintDistributionTab paper={paper} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}