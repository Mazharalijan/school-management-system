import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
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
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Printed</Badge>;
            case 'queued':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-none"><Clock className="w-3 h-3 mr-1" /> Queued</Badge>;
            default:
                return <Badge variant="outline" className="bg-muted text-muted-foreground border-border"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="bg-card p-6 rounded-sm border border-border space-y-6 text-card-foreground">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <Printer className="w-6 h-6 text-primary" />
                    <div>
                        <h3 className="font-semibold text-foreground">Print & Bulk Print Queue</h3>
                        <p className="text-xs text-muted-foreground">Select candidate question papers and execute bulk printing outputs.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleBulkPrint}
                        disabled={selectedPaperIds.length === 0}
                        className="font-semibold"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Bulk Print Selected ({selectedPaperIds.length})
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden text-card-foreground">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                        <tr>
                            <th className="px-5 py-3 w-10">
                                <button type="button" onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                                    {selectedPaperIds.length === paperList.length && paperList.length > 0 ? (
                                        <CheckSquare className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Square className="w-4 h-4 text-muted-foreground/40" />
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
                    <tbody className="divide-y divide-border">
                        {paperList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-xs text-muted-foreground">
                                    No papers available for print dispatch.
                                </td>
                            </tr>
                        ) : (
                            paperList.map((paper) => {
                                const isSelected = selectedPaperIds.includes(paper.id);
                                return (
                                    <tr key={paper.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <button type="button" onClick={() => toggleSelectPaper(paper.id)} className="text-muted-foreground">
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-muted-foreground/40" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-foreground">{paper.paper_title}</td>
                                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                            {paper.school_class?.name} • {paper.subject?.subject_name}
                                        </td>
                                        <td className="px-5 py-3.5">{renderStatusBadge(paper.print_status)}</td>
                                        <td className="px-5 py-3.5 font-medium text-foreground">{paper.total_copies_needed || 0}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(route('exam-class-papers.print-single', paper.id), '_blank')}
                                                className="h-8 text-xs font-semibold"
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
                <Pagination data={papers} />
            </div>
        </div>
    );
}