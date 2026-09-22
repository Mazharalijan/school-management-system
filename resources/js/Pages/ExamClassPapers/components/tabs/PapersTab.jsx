import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, FilePen, Trash2, Layers, Eye } from 'lucide-react';

export default function PapersTab({ papers = {}, classes = [], subjects = [], filters = {}, onEdit, onViewDetail }) {
    console.log('PapersTab props:', { papers, classes, subjects });
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');

    const applyFilters = (newFilters = {}) => {
        router.get(route('exam-class-papers.index'), {
            tab: 'papers',
            search,
            school_class_id: selectedClass,
            subject_id: selectedSubject,
            ...newFilters,
        }, { preserveState: true, replace: true });
    };

    const paperList = papers?.data || (Array.isArray(papers) ? papers : []);

    return (
        <div className="space-y-4">
            <FilterBar showReset={Boolean(search || selectedClass || selectedSubject)} onReset={() => applyFilters({ search: '', school_class_id: '', subject_id: '' })}>
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter paper title..." />
                <FilterSelect value={selectedClass} onChange={(val) => { setSelectedClass(val); applyFilters({ school_class_id: val }); }} options={classes} placeholder="Filter Class" valueKey="id" labelKey="name" />
                <FilterSelect value={selectedSubject} onChange={(val) => { setSelectedSubject(val); applyFilters({ subject_id: val }); }} options={subjects} placeholder="Filter Subject" valueKey="id" labelKey="name" />
            </FilterBar>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-3.5">Paper Title</th>
                            <th className="px-6 py-3.5">Class</th>
                            <th className="px-6 py-3.5">Subject</th>
                            <th className="px-6 py-3.5">Duration</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paperList.map((paper) => (
                            <tr key={paper.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-semibold text-slate-900">{paper.paper_title || paper.title}</td>
                                <td className="px-6 py-4">{paper.school_class?.name}</td>
                                <td className="px-6 py-4 text-slate-600">{paper.subject?.subject_name || paper.subject?.name}</td>
                                <td className="px-6 py-4">{paper.duration_minutes} mins</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => onViewDetail(paper)} className="h-8 w-8 p-0 text-slate-600"><Eye className="w-4 h-4" /></Button>
                                        <Link href={`${route('exam-class-papers.show', paper.id)}?tab=sections`} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">
                                            <Layers className="w-3 h-3" /> Sections
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(paper)} className="h-8 w-8 p-0 text-blue-600"><FilePen className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}