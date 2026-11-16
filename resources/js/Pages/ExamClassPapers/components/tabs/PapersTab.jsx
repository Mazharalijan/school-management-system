import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, FilePen, Trash2, Layers, Eye, Printer } from 'lucide-react';

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

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden text-card-foreground">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                        <tr>
                            <th className="px-6 py-3.5">Paper Title</th>
                            <th className="px-6 py-3.5">Class</th>
                            <th className="px-6 py-3.5">Subject</th>
                            <th className="px-6 py-3.5">Duration</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paperList.map((paper) => (
                            <tr key={paper.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-6 py-4 font-semibold text-foreground">{paper.paper_title || paper.title}</td>
                                <td className="px-6 py-4 text-foreground">{paper.school_class?.name}</td>
                                <td className="px-6 py-4 text-muted-foreground">{paper.subject?.subject_name || paper.subject?.name}</td>
                                <td className="px-6 py-4 text-foreground">{paper.duration_minutes} mins</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Print Preview Button */}
                                        <Link
                                            href={route('exam-class-papers.preview', paper.id)}
                                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded border border-border bg-background hover:bg-muted text-foreground shadow-sm transition-colors"
                                            title="Print Preview"
                                        >
                                            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>Preview</span>
                                        </Link>

                                        {/* View Modal Detail */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetail(paper)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        {/* Manage Sections Link */}
                                        <Link
                                            href={`${route('exam-class-papers.show', paper.id)}?tab=sections`}
                                            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                            title="Manage Sections"
                                        >
                                            <Layers className="w-3 h-3" /> Sections
                                        </Link>

                                        {/* Edit Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(paper)}
                                            className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                                            title="Edit Paper"
                                        >
                                            <FilePen className="w-4 h-4" />
                                        </Button>
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