import React, { useState, useEffect, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    GraduationCap, 
    Calendar, 
    BookOpen, 
    FileText, 
    Eye, 
    FilePen, 
    Trash2, 
    Printer, 
    CheckCircle2, 
    Clock, 
    Plus, 
    ChevronRight, 
    Layers, 
    Filter, 
    RotateCcw,
    LayoutGrid,
    ListFilter,
    Table as TableIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OverviewTab({
    papers = {},
    classes = [],
    examSessions = [],
    subjects = [],
    filters = {},
    onViewDetail,
    onEditPaper,
    onCreatePaper,
}) {
    // Current Filter States
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedClassId, setSelectedClassId] = useState(filters.school_class_id ? String(filters.school_class_id) : '');
    const [selectedTermId, setSelectedTermId] = useState(filters.exam_session_id ? String(filters.exam_session_id) : '');
    const [selectedSubjectId, setSelectedSubjectId] = useState(filters.subject_id ? String(filters.subject_id) : '');
    const [selectedStatus, setSelectedStatus] = useState(filters.print_status || '');
    const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' | 'flat'

    const isFirstRender = useRef(true);

    // Apply filters to backend with Inertia router
    const applyFilters = (newFilters = {}) => {
        const queryParams = {
            tab: 'overview',
            search: searchQuery,
            school_class_id: selectedClassId,
            exam_session_id: selectedTermId,
            subject_id: selectedSubjectId,
            print_status: selectedStatus,
            ...newFilters,
        };

        // Clean empty parameters
        Object.keys(queryParams).forEach(
            (key) => (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) && delete queryParams[key]
        );

        router.get(route('exam-class-papers.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounce search query
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

    // Handle Reset
    const handleResetAll = () => {
        setSearchQuery('');
        setSelectedClassId('');
        setSelectedTermId('');
        setSelectedSubjectId('');
        setSelectedStatus('');
        router.get(route('exam-class-papers.index'), { tab: 'overview' }, { preserveState: true, replace: true });
    };

    // Handle Class Click
    const handleSelectClass = (classId) => {
        const newClassId = selectedClassId === String(classId) ? '' : String(classId);
        setSelectedClassId(newClassId);
        // When changing class, clear or preserve term
        applyFilters({ school_class_id: newClassId });
    };

    // Handle Term Click
    const handleSelectTerm = (termId) => {
        const newTermId = selectedTermId === String(termId) ? '' : String(termId);
        setSelectedTermId(newTermId);
        applyFilters({ exam_session_id: newTermId });
    };

    // Handle Subject Filter
    const handleSelectSubject = (subjectId) => {
        const newSubjectId = selectedSubjectId === String(subjectId) ? '' : String(subjectId);
        setSelectedSubjectId(newSubjectId);
        applyFilters({ subject_id: newSubjectId });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
            router.delete(route('exam-class-papers.destroy', id), { preserveState: true });
        }
    };

    const paperList = papers?.data || (Array.isArray(papers) ? papers : []);

    // Active Objects
    const currentClass = classes.find((c) => String(c.id) === String(selectedClassId));
    const currentTerm = examSessions.find((t) => String(t.id) === String(selectedTermId));
    const currentSubject = subjects.find((s) => String(s.id) === String(selectedSubjectId));

    // Render Badge helper
    const renderBadge = (status) => {
        switch (status) {
            case 'printed':
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-medium text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Printed
                    </Badge>
                );
            case 'queued':
                return (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none font-medium text-xs">
                        <Clock className="w-3 h-3 mr-1" /> Queued
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium text-xs">
                        <Printer className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                );
        }
    };

    // Filtered count helpers for badges
    const totalPapersCount = papers?.total ?? paperList.length;

    return (
        <div className="space-y-6">
            {/* Top Navigation & Breadcrumb Trail */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center flex-wrap gap-2 text-sm text-slate-500">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedClassId('');
                                setSelectedTermId('');
                                setSelectedSubjectId('');
                                applyFilters({ school_class_id: '', exam_session_id: '', subject_id: '' });
                            }}
                            className={cn(
                                "flex items-center gap-1.5 font-medium transition-colors hover:text-blue-600",
                                !selectedClassId ? "text-blue-600 font-semibold" : "text-slate-600"
                            )}
                        >
                            <GraduationCap className="h-4 w-4" />
                            All Classes
                        </button>

                        {currentClass && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTermId('');
                                        setSelectedSubjectId('');
                                        applyFilters({ exam_session_id: '', subject_id: '' });
                                    }}
                                    className={cn(
                                        "font-medium transition-colors hover:text-blue-600",
                                        !selectedTermId ? "text-blue-600 font-semibold" : "text-slate-600"
                                    )}
                                >
                                    {currentClass.name}
                                </button>
                            </>
                        )}

                        {currentTerm && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSubjectId('');
                                        applyFilters({ subject_id: '' });
                                    }}
                                    className={cn(
                                        "font-medium transition-colors hover:text-blue-600",
                                        !selectedSubjectId ? "text-blue-600 font-semibold" : "text-slate-600"
                                    )}
                                >
                                    {currentTerm.title}
                                </button>
                            </>
                        )}

                        {currentSubject && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                <span className="font-semibold text-blue-600">
                                    {currentSubject.subject_name}
                                </span>
                            </>
                        )}
                    </nav>

                    {/* View Mode Toggle & Reset */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                        {(selectedClassId || selectedTermId || selectedSubjectId || selectedStatus || searchQuery) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetAll}
                                className="h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1 text-slate-500" /> Reset All
                            </Button>
                        )}

                        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setViewMode('hierarchy')}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                                    viewMode === 'hierarchy' 
                                        ? "bg-white text-slate-800 shadow-xs" 
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                                title="Class & Term Explorer"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Explorer
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('flat')}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                                    viewMode === 'flat' 
                                        ? "bg-white text-slate-800 shadow-xs" 
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                                title="Table View"
                            >
                                <TableIcon className="h-3.5 w-3.5" /> Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Global Filter Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                        <SearchInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)}
                            placeholder="Search exam papers by title or instructions..."
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <FilterSelect
                            value={selectedStatus}
                            onChange={(val) => {
                                setSelectedStatus(val);
                                applyFilters({ print_status: val });
                            }}
                            options={[
                                { id: '', name: 'All Print Statuses' },
                                { id: 'pending', name: 'Pending Print' },
                                { id: 'queued', name: 'Queued' },
                                { id: 'printed', name: 'Printed & Ready' },
                            ]}
                            placeholder="Filter by Status"
                            valueKey="id"
                            labelKey="name"
                            className="w-full md:w-44 text-xs"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'hierarchy' ? (
                <>
                    {/* SECTION 1: CLASSES OVERVIEW */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-blue-600" />
                                    Classes Overview
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Click any class below to inspect its exam terms (First Term, Second Term, Third Term) and papers.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                {classes.length} Classes Available
                            </span>
                        </div>

                        {/* Class Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
                            {classes.map((cls) => {
                                const isSelected = selectedClassId === String(cls.id);
                                return (
                                    <button
                                        key={cls.id}
                                        type="button"
                                        onClick={() => handleSelectClass(cls.id)}
                                        className={cn(
                                            "flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs relative group cursor-pointer",
                                            isSelected
                                                ? "border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                isSelected ? "text-blue-900" : "text-slate-800 group-hover:text-blue-600"
                                            )}>
                                                {cls.name}
                                            </span>
                                            {cls.code && (
                                                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {cls.code}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-slate-500 mt-auto pt-2 border-t border-slate-100 text-[11px]">
                                            <span>{cls.sections_count || 1} {cls.sections_count === 1 ? 'Section' : 'Sections'}</span>
                                            <span className={cn(
                                                "font-medium px-1.5 py-0.5 rounded text-[10px]",
                                                cls.class_papers_count > 0 
                                                    ? "bg-blue-100 text-blue-700 font-semibold" 
                                                    : "bg-slate-100 text-slate-500"
                                            )}>
                                                {cls.class_papers_count ?? 0} {cls.class_papers_count === 1 ? 'Paper' : 'Papers'}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 2: EXAM TERMS (Shown when class is selected) */}
                    {selectedClassId ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-indigo-600" />
                                            Exam Terms for <span className="text-blue-600">{currentClass?.name}</span>
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Select an examination term to explore papers, marks, and print schedules.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTerm('')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                            !selectedTermId
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        All Terms
                                    </button>
                                </div>
                            </div>

                            {/* Terms Cards Grid - 3 Terms of Examination */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                {examSessions.map((term, index) => {
                                    const isSelected = selectedTermId === String(term.id);
                                    const termNumber = index + 1;
                                    return (
                                        <div
                                            key={term.id}
                                            onClick={() => handleSelectTerm(term.id)}
                                            className={cn(
                                                "p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between group",
                                                isSelected
                                                    ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs"
                                                    : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80 shadow-2xs"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                            Term {termNumber}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] uppercase tracking-wider font-semibold capitalize",
                                                                term.status === 'published'
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                                            )}
                                                        >
                                                            {term.status}
                                                        </Badge>
                                                    </div>
                                                    <h4 className={cn(
                                                        "text-base font-bold",
                                                        isSelected ? "text-indigo-950 font-bold" : "text-slate-900 group-hover:text-indigo-600"
                                                    )}>
                                                        {term.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Academic Session: {term.session_year || '2026-2027'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {term.start_date ? new Date(term.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Scheduled'}
                                                </span>
                                                <span className={cn(
                                                    "font-medium text-xs",
                                                    isSelected ? "text-indigo-700" : "text-slate-700"
                                                )}>
                                                    Select Term &rarr;
                                                </span>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600" />
                                            )}
                                        </div>
                                    );
                                })}

                                {examSessions.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-slate-400">
                                        No exam terms configured yet. Add exam sessions from the Exam Sessions tab.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Instructional Banner when no class selected */
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                            <GraduationCap className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-75" />
                            <h4 className="text-sm font-semibold text-slate-800">No Class Selected</h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                Click on any Class card above to reveal its examination terms (such as First Term, Second Term, and Third Term) and access subject exam papers.
                            </p>
                        </div>
                    )}

                    {/* SECTION 3: SUBJECT FILTER & PAPERS IN SELECTED TERM */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    Exam Papers
                                    {currentClass && <span className="text-slate-500 font-normal">in {currentClass.name}</span>}
                                    {currentTerm && <span className="text-indigo-600 font-semibold">• {currentTerm.title}</span>}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Filter by subject or create a new question paper.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start md:self-auto">
                                <Button
                                    onClick={() => onCreatePaper({
                                        school_class_id: selectedClassId ? Number(selectedClassId) : '',
                                        exam_session_id: selectedTermId ? Number(selectedTermId) : '',
                                        subject_id: selectedSubjectId ? Number(selectedSubjectId) : '',
                                    })}
                                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 shadow-xs"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" /> Create Exam Paper
                                </Button>
                            </div>
                        </div>

                        {/* Subject Filter Pills */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                Filter by Subject:
                            </label>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => handleSelectSubject('')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                                        !selectedSubjectId
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    All Subjects
                                </button>

                                {subjects.map((sub) => {
                                    const isSelected = selectedSubjectId === String(sub.id);
                                    return (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => handleSelectSubject(sub.id)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5",
                                                isSelected
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                                                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                                            )}
                                        >
                                            <span>{sub.subject_name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Papers Grid Cards View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {paperList.map((paper) => {
                                const paperTerm = paper.exam_session || paper.exam_schedule?.exam_session;
                                return (
                                    <div
                                        key={paper.id}
                                        className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all rounded-xl p-4 flex flex-col justify-between space-y-3 group"
                                    >
                                        <div className="space-y-2">
                                            {/* Header Tags */}
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none font-semibold text-xs">
                                                    {paper.subject?.subject_name || 'Subject'}
                                                </Badge>
                                                {renderBadge(paper.print_status)}
                                            </div>

                                            {/* Paper Title */}
                                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-2">
                                                {paper.paper_title || paper.title}
                                            </h4>

                                            {/* Meta details */}
                                            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 pt-1">
                                                <span className="font-medium text-slate-700">
                                                    {paper.school_class?.name}
                                                </span>
                                                {paperTerm && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-indigo-600 font-medium">
                                                            {paperTerm.title}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Metrics & Footer */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                                                <span>{paper.total_marks} Marks</span>
                                                <span>•</span>
                                                <span>{paper.duration_minutes || 120} Min</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(route('exam-class-papers.preview', paper.id), '_blank')}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
                                                    title="Preview & Print"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(paper)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEditPaper(paper)}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                                                    title="Edit Paper"
                                                >
                                                    <FilePen className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(paper.id)}
                                                    className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700"
                                                    title="Delete Paper"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {paperList.length === 0 && (
                            <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <h4 className="text-sm font-semibold text-slate-700">No Exam Papers Found</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                    No paper matching the selected Class, Term, and Subject criteria.
                                </p>
                                <Button
                                    onClick={() => onCreatePaper({
                                        school_class_id: selectedClassId ? Number(selectedClassId) : '',
                                        exam_session_id: selectedTermId ? Number(selectedTermId) : '',
                                        subject_id: selectedSubjectId ? Number(selectedSubjectId) : '',
                                    })}
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 text-xs border-slate-200"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Paper Now
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* FLAT TABLE VIEW (Optional view mode) */
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3.5">Title</th>
                                <th className="px-6 py-3.5">Class / Subject</th>
                                <th className="px-6 py-3.5">Term / Session</th>
                                <th className="px-6 py-3.5">Marks</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paperList.map((paper) => {
                                const paperTerm = paper.exam_session || paper.exam_schedule?.exam_session;
                                return (
                                    <tr key={paper.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {paper.paper_title || paper.title}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="font-semibold text-slate-800">{paper.school_class?.name}</span>
                                            <span className="text-slate-400"> • </span>
                                            <span className="text-slate-500">{paper.subject?.subject_name || paper.subject?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                {paperTerm?.title || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none font-semibold">
                                                {paper.total_marks} Marks
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">{renderBadge(paper.print_status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(route('exam-class-papers.preview', paper.id), '_blank')}
                                                    className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
                                                    title="Preview & Print"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(paper)}
                                                    className="h-8 w-8 p-0 text-slate-600"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEditPaper(paper)}
                                                    className="h-8 w-8 p-0 text-blue-600"
                                                    title="Edit Paper"
                                                >
                                                    <FilePen className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(paper.id)}
                                                    className="h-8 w-8 p-0 text-rose-600"
                                                    title="Delete Paper"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paperList.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        No paper records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}