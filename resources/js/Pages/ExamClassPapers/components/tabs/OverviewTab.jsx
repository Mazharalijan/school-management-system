import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, FilePen, Trash2, Printer, CheckCircle2, Clock } from 'lucide-react';

export default function OverviewTab({ papers = {}, classes = [], filters = {}, onViewDetail, onEditPaper }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.print_status || '');

    const isFirstRender = useRef(true);

    const applyFilters = (newFilters = {}) => {
        const queryParams = {
            tab: 'overview',
            search: searchQuery,
            school_class_id: selectedClass,
            print_status: selectedStatus,
            ...newFilters,
        };

        Object.keys(queryParams).forEach(
            (key) => (queryParams[key] === '' || queryParams[key] === null) && delete queryParams[key]
        );

        router.get(route('exam-class-papers.index'), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleReset = () => {
        setSearchQuery('');
        setSelectedClass('');
        setSelectedStatus('');
        router.get(route('exam-class-papers.index'), { tab: 'overview' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this paper?')) {
            router.delete(route('exam-class-papers.destroy', id), { preserveState: true });
        }
    };

    const paperList = papers?.data || (Array.isArray(papers) ? papers : []);

    const renderBadge = (status) => {
        switch (status) {
            case 'printed':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Printed</Badge>;
            case 'queued':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1" /> Queued</Badge>;
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200"><Printer className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <FilterBar showReset={Boolean(searchQuery || selectedClass || selectedStatus)} onReset={handleReset}>
                <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)}
                    placeholder="Search exam papers..."
                />
                <FilterSelect
                    value={selectedClass}
                    onChange={(val) => { setSelectedClass(val); applyFilters({ school_class_id: val }); }}
                    options={classes}
                    placeholder="Filter by Class"
                    valueKey="id"
                    labelKey="name"
                />
                <FilterSelect
                    value={selectedStatus}
                    onChange={(val) => { setSelectedStatus(val); applyFilters({ print_status: val }); }}
                    options={[
                        { id: 'pending', name: 'Pending Print' },
                        { id: 'queued', name: 'Queued' },
                        { id: 'printed', name: 'Printed & Ready' },
                    ]}
                    placeholder="Filter by Status"
                    valueKey="id"
                    labelKey="name"
                />
            </FilterBar>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Class / Subject</th>
                            <th className="px-6 py-3.5">Marks</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paperList.map((paper) => (
                            <tr key={paper.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-semibold text-slate-900">{paper.paper_title || paper.title}</td>
                                <td className="px-6 py-4 text-xs">
                                    <span className="font-semibold text-slate-800">{paper.school_class?.name}</span>
                                    <span className="text-slate-400"> • </span>
                                    <span className="text-slate-500">{paper.subject?.subject_name || paper.subject?.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none font-semibold">{paper.total_marks} Marks</Badge>
                                </td>
                                <td className="px-6 py-4">{renderBadge(paper.print_status)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => onViewDetail(paper)} className="h-8 w-8 p-0 text-slate-600"><Eye className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => onEditPaper(paper)} className="h-8 w-8 p-0 text-blue-600"><FilePen className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(paper.id)} className="h-8 w-8 p-0 text-rose-600"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paperList.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    No paper records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}