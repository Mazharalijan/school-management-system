import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SinglePromotionModal from './components/SinglePromotionModal';
import BulkPromotionModal from './components/BulkPromotionModal';
import Pagination from '@/components/Pagination';
import { 
    TrendingUp, 
    Users, 
    ArrowRight, 
    Filter, 
    CheckSquare, 
    Square, 
    FastForward, 
    RotateCcw, 
    Sparkles, 
    CreditCard, 
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';

export default function PromotionIndex({
    classes = [],
    sessionYears = [],
    filters = {},
    sourceClass,
    suggestedTargetClass,
    students = [],
    feeStructures = [],
    admissionHead,
}) {
    // Selection filters state
    const [sourceClassId, setSourceClassId] = useState(filters.source_class_id || classes[0]?.id || '');
    const [sourceSectionId, setSourceSectionId] = useState(filters.source_section_id || '');
    const [sourceSessionYear, setSourceSessionYear] = useState(filters.source_session_year || '');
    const [targetSessionYear, setTargetSessionYear] = useState(filters.target_session_year || '');
    const [bulkTargetClassId, setBulkTargetClassId] = useState(suggestedTargetClass?.id || classes[0]?.id || '');
    const [bulkTargetSectionId, setBulkTargetSectionId] = useState('');

    // Checkbox selection state
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Row-level target class overrides (e.g. if admin changes class for specific student in row)
    const [rowClassOverrides, setRowClassOverrides] = useState({});

    // Modals state
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [activeStudent, setActiveStudent] = useState(null);

    // Selected target class object
    const selectedBulkTargetClass = useMemo(() => {
        return classes.find((c) => c.id === parseInt(bulkTargetClassId, 10));
    }, [classes, bulkTargetClassId]);

    // Available sections for target class
    const targetSections = selectedBulkTargetClass?.sections || [];

    // Filter change handler
    const applySourceFilters = (newSourceClass, newSourceSection, newSourceSession, newTargetSession) => {
        router.get(
            route('students.promotion.index'),
            {
                source_class_id: newSourceClass,
                source_section_id: newSourceSection,
                source_session_year: newSourceSession,
                target_session_year: newTargetSession,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSourceClassChange = (e) => {
        const val = e.target.value;
        setSourceClassId(val);
        setSourceSectionId('');
        applySourceFilters(val, '', sourceSessionYear, targetSessionYear);
    };

    const handleSourceSectionChange = (e) => {
        const val = e.target.value;
        setSourceSectionId(val);
        applySourceFilters(sourceClassId, val, sourceSessionYear, targetSessionYear);
    };

    const handleSourceSessionChange = (e) => {
        const val = e.target.value;
        setSourceSessionYear(val);
        applySourceFilters(sourceClassId, sourceSectionId, val, targetSessionYear);
    };

    const handleTargetSessionChange = (e) => {
        const val = e.target.value;
        setTargetSessionYear(val);
        applySourceFilters(sourceClassId, sourceSectionId, sourceSessionYear, val);
    };

    // Selection handlers
    const eligibleStudents = students.filter((s) => !s.is_already_promoted);
    const isAllSelected = eligibleStudents.length > 0 && selectedStudentIds.length === eligibleStudents.length;

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;
    const totalPages = Math.ceil(students.length / pageSize);
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return students.slice(start, start + pageSize);
    }, [students, currentPage]);

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(eligibleStudents.map((s) => s.id));
        }
    };

    const handleToggleStudent = (studentId) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    // Row class override handler
    const handleRowClassOverride = (studentId, newClassId) => {
        setRowClassOverrides((prev) => ({
            ...prev,
            [studentId]: parseInt(newClassId, 10),
        }));
    };

    // Single promote trigger
    const handleOpenSingleModal = (student) => {
        setActiveStudent(student);
        setIsSingleModalOpen(true);
    };

    // Selected student objects for bulk modal
    const selectedStudentsList = useMemo(() => {
        return students.filter((s) => selectedStudentIds.includes(s.id));
    }, [students, selectedStudentIds]);

    // Check relationship of target class vs source class
    const targetNumeric = selectedBulkTargetClass?.numeric_value ?? 0;
    const sourceNumeric = sourceClass?.numeric_value ?? 0;
    const isBulkSkipping = targetNumeric > sourceNumeric + 1;
    const isBulkRetaining = targetNumeric <= sourceNumeric;

    return (
        <AppLayout title="Student Promotion & Batch Rollover">
            <Head title="Student Promotion & Batch Rollover" />

            <div className="space-y-6">
                {/* Unified Page Header */}
                <PageHeader
                    title="Student Academic Promotion"
                    subtitle="Batch promote students to next grade, process skip promotions, retain students, and configure new session fee structures."
                    icon={TrendingUp}
                >
                    <Link
                        href={route('students.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors shadow-xs whitespace-nowrap shrink-0"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Back to Students</span>
                    </Link>
                    <Link
                        href={route('fees.invoices.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors shadow-xs whitespace-nowrap shrink-0"
                    >
                        <CreditCard className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        <span>Fee Invoices</span>
                    </Link>
                </PageHeader>

                {/* Configuration Panel: Source & Target Class Selection */}
                <div className="bg-card text-card-foreground rounded-lg border border-border p-4 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>1. Source &amp; Target Batch Configuration</span>
                        </h3>
                        <span className="text-xs text-muted-foreground">Step 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Source Configuration (Left) */}
                        <div className="bg-muted/30 border border-border rounded-lg p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-foreground tracking-wider">Source Class (Current)</span>
                                <Badge variant="outline" className="bg-background text-muted-foreground text-[10px] border-border">
                                    Enrolled Students
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Session Year</label>
                                    <select
                                        value={sourceSessionYear}
                                        onChange={handleSourceSessionChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-2xs transition-colors focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        {sessionYears.map((yr) => (
                                            <option key={yr} value={yr}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Source Class</label>
                                    <select
                                        value={sourceClassId}
                                        onChange={handleSourceClassChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Source Section</label>
                                    <select
                                        value={sourceSectionId}
                                        onChange={handleSourceSectionChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-2xs transition-colors focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        <option value="">All Sections</option>
                                        {(sourceClass?.sections || []).map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                Section {sec.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Target Configuration (Right) */}
                        <div className="bg-muted/30 border border-border rounded-lg p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-foreground tracking-wider">Target Class (Promoted To)</span>
                                <div className="flex items-center gap-1">
                                    {isBulkSkipping && (
                                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 text-[10px]">
                                            Class Skip
                                        </Badge>
                                    )}
                                    {isBulkRetaining && (
                                        <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 text-[10px]">
                                            Retain Same Class
                                        </Badge>
                                    )}
                                    {!isBulkSkipping && !isBulkRetaining && (
                                        <Badge variant="outline" className="bg-background text-foreground border-border text-[10px]">
                                            Next Grade
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Target Session</label>
                                    <Input
                                        value={targetSessionYear}
                                        onChange={handleTargetSessionChange}
                                        placeholder="e.g. 2026-2027"
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Bulk Target Class</label>
                                    <select
                                        value={bulkTargetClassId}
                                        onChange={(e) => {
                                            setBulkTargetClassId(e.target.value);
                                            setBulkTargetSectionId('');
                                        }}
                                        className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        {classes.map((cls) => {
                                            let label = cls.name;
                                            if (sourceClass) {
                                                if (cls.numeric_value === sourceClass.numeric_value + 1) {
                                                    label += ' (Next Grade - Normal)';
                                                } else if (cls.numeric_value > sourceClass.numeric_value + 1) {
                                                    label += ` (Skip +${cls.numeric_value - sourceClass.numeric_value - 1} Grades)`;
                                                } else if (cls.numeric_value === sourceClass.numeric_value) {
                                                    label += ' (Same Grade - Retain)';
                                                }
                                            }
                                            return (
                                                <option key={cls.id} value={cls.id}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Target Section</label>
                                    <select
                                        value={bulkTargetSectionId}
                                        onChange={(e) => setBulkTargetSectionId(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground shadow-2xs transition-colors focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                    >
                                        <option value="">Auto Section (First Available)</option>
                                        {targetSections.map((sec) => (
                                            <option key={sec.id} value={sec.id}>
                                                Section {sec.name} (Cap: {sec.capacity || 40})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating / Sticky Bulk Action Bar */}
                {selectedStudentIds.length > 0 && (
                    <div className="sticky top-4 z-30 bg-card text-card-foreground p-3 rounded-lg shadow-md border border-border flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                                {selectedStudentIds.length}
                            </span>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">
                                    {selectedStudentIds.length} Student(s) Selected for Promotion
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Targeting: <strong className="text-foreground">{selectedBulkTargetClass?.name}</strong> (Session: {targetSessionYear})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStudentIds([])}
                                className="h-8 text-xs font-medium"
                            >
                                Clear Selection
                            </Button>
                            <Button
                                onClick={() => setIsBulkModalOpen(true)}
                                size="sm"
                                className="h-8 font-semibold text-xs gap-1.5 whitespace-nowrap shrink-0"
                            >
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Configure Fees &amp; Promote Selected</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Student Selection Roster Table */}
                <div className="bg-card text-card-foreground rounded-lg border border-border shadow-xs overflow-hidden">
                    {/* Table Header Bar */}
                    <div className="p-3.5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted/40">
                        <div className="flex items-center gap-3 text-xs">
                            <button
                                type="button"
                                onClick={handleToggleSelectAll}
                                className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary transition"
                            >
                                {isAllSelected ? (
                                    <CheckSquare className="w-4 h-4 text-primary" />
                                ) : (
                                    <Square className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span>
                                    {isAllSelected ? 'Deselect All' : `Select All Eligible (${eligibleStudents.length})`}
                                </span>
                            </button>

                            <span className="text-border">|</span>

                            <div className="text-muted-foreground">
                                Total Enrolled: <strong className="text-foreground">{students.length}</strong>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Legend:</span>
                            <Badge variant="outline" className="text-[10px] gap-1 bg-background text-muted-foreground border-border font-medium">
                                <Sparkles className="w-3 h-3 text-primary" /> Next Grade
                            </Badge>
                            <Badge variant="outline" className="text-[10px] gap-1 bg-background text-muted-foreground border-border font-medium">
                                <FastForward className="w-3 h-3 text-amber-500" /> Skip Grade
                            </Badge>
                            <Badge variant="outline" className="text-[10px] gap-1 bg-background text-muted-foreground border-border font-medium">
                                <RotateCcw className="w-3 h-3 text-rose-500" /> Retain
                            </Badge>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border font-bold">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleToggleSelectAll}
                                            disabled={eligibleStudents.length === 0}
                                            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                        />
                                    </th>
                                    <th className="py-3 px-4">Student Details</th>
                                    <th className="py-3 px-4">Current Enrolled</th>
                                    <th className="py-3 px-4">Current Fee Profile</th>
                                    <th className="py-3 px-4">Target Class for {targetSessionYear}</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedStudents.map((student) => {
                                    const isSelected = selectedStudentIds.includes(student.id);
                                    const studentTargetClassId = rowClassOverrides[student.id] || bulkTargetClassId;
                                    const targetClassObj = classes.find((c) => c.id === parseInt(studentTargetClassId, 10));

                                    const isRowSkipping = sourceClass && targetClassObj && targetClassObj.numeric_value > (sourceClass.numeric_value + 1);
                                    const isRowRetaining = sourceClass && targetClassObj && targetClassObj.numeric_value <= sourceClass.numeric_value;

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`transition hover:bg-muted/50 ${
                                                isSelected ? 'bg-muted/60' : student.is_already_promoted ? 'bg-muted/20 opacity-80' : ''
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleStudent(student.id)}
                                                    disabled={student.is_already_promoted}
                                                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                                                />
                                            </td>

                                            {/* Student Details */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <ProfileAvatar
                                                        src={student.photo_url}
                                                        name={student.full_name}
                                                        className="w-8 h-8"
                                                        iconClassName="w-4 h-4"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-foreground text-xs">
                                                            {student.full_name}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">
                                                            Roll: {student.roll_number || 'N/A'} &bull; Adm: {student.admission_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Current Class */}
                                            <td className="py-3 px-4">
                                                <div className="space-y-0.5">
                                                    <Badge variant="outline" className="bg-muted text-foreground text-[11px] font-semibold border-border">
                                                        {student.current_class_name} ({student.current_section_name || 'A'})
                                                    </Badge>
                                                    <span className="block text-[10px] text-muted-foreground font-mono">
                                                        {student.current_session_year}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Current Fee Profile */}
                                            <td className="py-3 px-4">
                                                <div>
                                                    <span className="font-bold text-foreground font-mono text-xs">
                                                        Rs. {Number(student.current_net_fee || 0).toFixed(2)}/mo
                                                    </span>
                                                    {student.current_discount > 0 && (
                                                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                            -Rs. {Number(student.current_discount).toFixed(2)} ({student.current_discount_reason || 'Concession'})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Target Class Selector Override */}
                                            <td className="py-3 px-4">
                                                {student.is_already_promoted ? (
                                                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>Enrolled in {student.target_enrollment_class} ({student.target_enrollment_section || 'A'})</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <select
                                                            value={studentTargetClassId}
                                                            onChange={(e) => handleRowClassOverride(student.id, e.target.value)}
                                                            className="text-xs rounded-md border border-input font-medium py-1 px-2 bg-background text-foreground shadow-2xs focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
                                                        >
                                                            {classes.map((cls) => (
                                                                <option key={cls.id} value={cls.id}>
                                                                  {cls.name} {cls.id === sourceClass?.id ? '(Repeat)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {isRowSkipping && (
                                                            <span title="Skipping classes" className="text-amber-600 dark:text-amber-400 shrink-0">
                                                                <FastForward className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {isRowRetaining && (
                                                            <span title="Repeating same class" className="text-rose-600 dark:text-rose-400 shrink-0">
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3 px-4 text-center">
                                                {student.is_already_promoted ? (
                                                    <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-0 text-[10px]">
                                                        Already Promoted
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-background text-muted-foreground border-border text-[10px]">
                                                        Eligible
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenSingleModal(student)}
                                                    className="h-7 px-2.5 text-xs font-semibold border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                >
                                                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Promote Individually</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm font-medium">No students found for this class and session.</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Try selecting a different source class or session year above.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        total={students.length}
                        from={students.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                        to={Math.min(currentPage * pageSize, students.length)}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* Modals */}
                <SinglePromotionModal
                    isOpen={isSingleModalOpen}
                    onClose={() => {
                        setIsSingleModalOpen(false);
                        setActiveStudent(null);
                    }}
                    student={activeStudent}
                    classes={classes}
                    sessionYears={sessionYears}
                    targetSessionYear={targetSessionYear}
                    feeStructures={feeStructures}
                    onSuccess={() => {
                        setSelectedStudentIds((prev) => prev.filter((id) => id !== activeStudent?.id));
                    }}
                />

                <BulkPromotionModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    selectedStudents={selectedStudentsList}
                    classes={classes}
                    sourceClass={sourceClass}
                    targetClassId={bulkTargetClassId}
                    targetSectionId={bulkTargetSectionId}
                    targetSessionYear={targetSessionYear}
                    feeStructures={feeStructures}
                    admissionHead={admissionHead}
                    onSuccess={() => {
                        setSelectedStudentIds([]);
                    }}
                />
            </div>
        </AppLayout>
    );
}
