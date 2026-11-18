import React, { useState, useEffect, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import Pagination from '@/components/Pagination';
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
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-none font-medium text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Printed
                    </Badge>
                );
            case 'queued':
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-none font-medium text-xs">
                        <Clock className="w-3 h-3 mr-1" /> Queued
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-medium text-xs">
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
            <div className="bg-card border border-border rounded-sm p-4 shadow-xs text-card-foreground">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedClassId('');
                                setSelectedTermId('');
                                setSelectedSubjectId('');
                                applyFilters({ school_class_id: '', exam_session_id: '', subject_id: '' });
                            }}
                            className={cn(
                                "flex items-center gap-1.5 font-medium transition-colors hover:text-primary",
                                !selectedClassId ? "text-primary font-semibold" : "text-muted-foreground"
                            )}
                        >
                            <GraduationCap className="h-4 w-4" />
                            All Classes
                        </button>

                        {currentClass && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTermId('');
                                        setSelectedSubjectId('');
                                        applyFilters({ exam_session_id: '', subject_id: '' });
                                    }}
                                    className={cn(
                                        "font-medium transition-colors hover:text-primary",
                                        !selectedTermId ? "text-primary font-semibold" : "text-muted-foreground"
                                    )}
                                >
                                    {currentClass.name}
                                </button>
                            </>
                        )}

                        {currentTerm && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSubjectId('');
                                        applyFilters({ subject_id: '' });
                                    }}
                                    className={cn(
                                        "font-medium transition-colors hover:text-primary",
                                        !selectedTermId ? "text-primary font-semibold" : "text-muted-foreground"
                                    )}
                                >
                                    {currentTerm.title}
                                </button>
                            </>
                        )}

                        {currentSubject && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                                <span className="font-semibold text-primary">
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
                                className="h-8 text-xs text-muted-foreground border-border hover:bg-muted"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset All
                            </Button>
                        )}

                        <div className="flex items-center rounded-xs border border-border p-0.5 bg-muted">
                            <button
                                type="button"
                                onClick={() => setViewMode('hierarchy')}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xs transition-colors",
                                    viewMode === 'hierarchy' 
                                        ? "bg-background text-foreground shadow-xs font-semibold" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Class & Term Explorer"
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Explorer
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('flat')}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xs transition-colors",
                                    viewMode === 'flat' 
                                        ? "bg-background text-foreground shadow-xs font-semibold" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Table View"
                            >
                                <TableIcon className="h-3.5 w-3.5" /> Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Global Filter Bar */}
                <div className="mt-4 pt-3 border-t border-border flex flex-col md:flex-row items-center gap-3">
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
                    <div className="bg-card border border-border rounded-sm p-5 shadow-xs space-y-3 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Classes Overview
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Click any class below to inspect its exam terms (First Term, Second Term, Third Term) and papers.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
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
                                            "flex flex-col text-left p-3.5 rounded-xs border transition-all text-xs relative group cursor-pointer",
                                            isSelected
                                                ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                                                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40 shadow-2xs"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className={cn(
                                                "font-semibold text-sm",
                                                isSelected ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                                            )}>
                                                {cls.name}
                                            </span>
                                            {cls.code && (
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-xs">
                                                    {cls.code}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-muted-foreground mt-auto pt-2 border-t border-border text-[11px]">
                                            <span>{cls.sections_count || 1} {cls.sections_count === 1 ? 'Section' : 'Sections'}</span>
                                            <span className={cn(
                                                "font-medium px-1.5 py-0.5 rounded-xs text-[10px]",
                                                cls.class_papers_count > 0 
                                                    ? "bg-primary/10 text-primary font-semibold" 
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                {cls.class_papers_count ?? 0} {cls.class_papers_count === 1 ? 'Paper' : 'Papers'}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 2: EXAM TERMS (Shown when class is selected) */}
                    {selectedClassId ? (
                        <div className="bg-card border border-border rounded-sm p-5 shadow-xs space-y-3 text-card-foreground animate-in fade-in duration-200">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            Exam Terms for <span className="text-primary">{currentClass?.name}</span>
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Select an examination term to explore papers, marks, and print schedules.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTerm('')}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors",
                                            !selectedTermId
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-border hover:bg-muted"
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
                                                "p-4 rounded-xs border text-left cursor-pointer transition-all relative flex flex-col justify-between group",
                                                isSelected
                                                    ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                                                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40 shadow-2xs"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-primary/10 text-primary">
                                                            Term {termNumber}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] uppercase tracking-wider font-semibold capitalize",
                                                                term.status === 'published'
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                                    : "bg-muted text-muted-foreground border-border"
                                                            )}
                                                        >
                                                            {term.status}
                                                        </Badge>
                                                    </div>
                                                    <h4 className={cn(
                                                        "text-base font-bold",
                                                        isSelected ? "text-primary font-bold" : "text-foreground group-hover:text-primary"
                                                    )}>
                                                        {term.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Academic Session: {term.session_year || '2026-2027'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    <Clock className="w-3 h-3 text-muted-foreground/60" />
                                                    {term.start_date ? new Date(term.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Scheduled'}
                                                </span>
                                                <span className={cn(
                                                    "font-medium text-xs",
                                                    isSelected ? "text-primary font-bold" : "text-foreground"
                                                )}>
                                                    Select Term &rarr;
                                                </span>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                    );
                                })}

                                {examSessions.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-muted-foreground">
                                        No exam terms configured yet. Add exam sessions from the Exam Sessions tab.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Instructional Banner when no class selected */
                        <div className="bg-muted/40 border border-dashed border-border rounded-sm p-8 text-center">
                            <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-75" />
                            <h4 className="text-sm font-semibold text-foreground">No Class Selected</h4>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                                Click on any Class card above to reveal its examination terms (such as First Term, Second Term, and Third Term) and access subject exam papers.
                            </p>
                        </div>
                    )}

                    {/* SECTION 3: SUBJECT FILTER & PAPERS IN SELECTED TERM */}
                    <div className="bg-card border border-border rounded-sm p-5 shadow-xs space-y-4 text-card-foreground">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
                            <div>
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Exam Papers
                                    {currentClass && <span className="text-muted-foreground font-normal">in {currentClass.name}</span>}
                                    {currentTerm && <span className="text-primary font-semibold">• {currentTerm.title}</span>}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
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
                                    className="text-xs h-9 shadow-xs font-semibold"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" /> Create Exam Paper
                                </Button>
                            </div>
                        </div>

                        {/* Subject Filter Pills */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground/60" />
                                Filter by Subject:
                            </label>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => handleSelectSubject('')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors cursor-pointer",
                                        !selectedSubjectId
                                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                                            : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
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
                                                "px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                                                    : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted/40"
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
                                        className="bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all rounded-sm p-4 flex flex-col justify-between space-y-3 group text-card-foreground"
                                    >
                                        <div className="space-y-2">
                                            {/* Header Tags */}
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-none font-semibold text-xs">
                                                    {paper.subject?.subject_name || 'Subject'}
                                                </Badge>
                                                {renderBadge(paper.print_status)}
                                            </div>

                                            {/* Paper Title */}
                                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2">
                                                {paper.paper_title || paper.title}
                                            </h4>

                                            {/* Meta details */}
                                            <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                                                <span className="font-medium text-foreground">
                                                    {paper.school_class?.name}
                                                </span>
                                                {paperTerm && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-primary font-medium">
                                                            {paperTerm.title}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Metrics & Footer */}
                                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
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
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Preview & Print"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(paper)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEditPaper(paper)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Edit Paper"
                                                >
                                                    <FilePen className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(paper.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
                            <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-sm border border-dashed border-border">
                                <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
                                <h4 className="text-sm font-semibold text-foreground">No Exam Papers Found</h4>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
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
                                    className="mt-3 text-xs border-border"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Paper Now
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* FLAT TABLE VIEW (Optional view mode) */
                <div className="bg-card border border-border rounded-sm shadow-xs overflow-hidden text-card-foreground">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3.5">Title</th>
                                <th className="px-6 py-3.5">Class / Subject</th>
                                <th className="px-6 py-3.5">Term / Session</th>
                                <th className="px-6 py-3.5">Marks</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paperList.map((paper) => {
                                const paperTerm = paper.exam_session || paper.exam_schedule?.exam_session;
                                return (
                                    <tr key={paper.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            {paper.paper_title || paper.title}
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="font-semibold text-foreground">{paper.school_class?.name}</span>
                                            <span className="text-muted-foreground/60"> • </span>
                                            <span className="text-muted-foreground">{paper.subject?.subject_name || paper.subject?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                {paperTerm?.title || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-none font-semibold">
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
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Preview & Print"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(paper)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEditPaper(paper)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Edit Paper"
                                                >
                                                    <FilePen className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(paper.id)}
                                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                                        No paper records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination data={papers} />
                </div>
            )}
        </div>
    );
}