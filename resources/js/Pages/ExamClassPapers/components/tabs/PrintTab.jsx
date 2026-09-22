import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle2, Clock, AlertCircle, CheckSquare, Square } from 'lucide-react';

export default function PrintTab({ papers = {} }) {
    const paperList = useMemo(() => papers?.data || (Array.isArray(papers) ? papers : []), [papers]);
    const [selectedPaperIds, setSelectedPaperIds] = useState([]);

    const toggleSelectPaper = (id) => {
        setSelectedPaperIds((prev) =>
            prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedPaperIds.length === paperList.length) {
            setSelectedPaperIds([]);
        } else {
            setSelectedPaperIds(paperList.map((p) => p.id));
        }
    };

    const handleBulkPrint = () => {
        if (selectedPaperIds.length === 0) return;
        
        // Open print view window for selected papers
        const printUrl = route('exam-class-papers.bulk-print', { ids: selectedPaperIds.join(',') });
        window.open(printUrl, '_blank');

        // Optional: Update print status in background
        router.post(
            route('exam-class-papers.mark-printed'),
            { paper_ids: selectedPaperIds },
            { preserveScroll: true }
        );
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'printed':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Printed</Badge>;
            case 'queued':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1" /> Queued</Badge>;
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <Printer className="w-6 h-6 text-amber-600" />
                    <div>
                        <h3 className="font-semibold text-slate-800">Print & Bulk Print Queue</h3>
                        <p className="text-xs text-slate-500">Select candidate question papers and execute bulk printing outputs.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleBulkPrint}
                        disabled={selectedPaperIds.length === 0}
                        className="bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Bulk Print Selected ({selectedPaperIds.length})
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-5 py-3 w-10">
                                <button type="button" onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-800">
                                    {selectedPaperIds.length === paperList.length && paperList.length > 0 ? (
                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <Square className="w-4 h-4 text-slate-300" />
                                    )}
                                </button>
                            </th>
                            <th className="px-5 py-3">Paper Title</th>
                            <th className="px-5 py-3">Class & Subject</th>
                            <th className="px-5 py-3">Print Status</th>
                            <th className="px-5 py-3">Copies Needed</th>
                            <th className="px-5 py-3 text-right">Single Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paperList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-xs text-slate-400">
                                    No papers available for print dispatch.
                                </td>
                            </tr>
                        ) : (
                            paperList.map((paper) => {
                                const isSelected = selectedPaperIds.includes(paper.id);
                                return (
                                    <tr key={paper.id} className={`hover:bg-slate-50/50 ${isSelected ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <button type="button" onClick={() => toggleSelectPaper(paper.id)} className="text-slate-500">
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-amber-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-300" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-900">{paper.paper_title}</td>
                                        <td className="px-5 py-3.5 text-xs text-slate-600">
                                            {paper.school_class?.name} • {paper.subject?.subject_name}
                                        </td>
                                        <td className="px-5 py-3.5">{renderStatusBadge(paper.print_status)}</td>
                                        <td className="px-5 py-3.5 font-medium">{paper.total_copies_needed || 0}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(route('exam-class-papers.print-single', paper.id), '_blank')}
                                                className="h-8 text-xs border-slate-300"
                                            >
                                                <Printer className="w-3.5 h-3.5 mr-1" /> Print Single
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}