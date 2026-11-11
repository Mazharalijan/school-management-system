import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SinglePromotionModal from './components/SinglePromotionModal';
import BulkPromotionModal from './components/BulkPromotionModal';
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
                {/* Header with Navigation Breadcrumbs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                href={route('students.index')}
                                className="inline-flex items-center text-xs text-slate-500 hover:text-indigo-600 transition font-medium"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                Back to Student Roster
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                            <span>Student Academic Promotion</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Batch promote students to next grade, process skip promotions, retain students, and configure new session fee structures.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('fees.invoices.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <span>Fee Invoices</span>
                        </Link>
                        <Link
                            href={route('students.index')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                        >
                            <Users className="w-4 h-4" />
                            <span>Students List</span>
                        </Link>
                    </div>
                </div>

                {/* Configuration Panel: Source & Target Class Selection */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Filter className="w-4 h-4 text-indigo-600" />
                            <span>1. Source & Target Batch Configuration</span>
                        </h3>
                        <span className="text-xs text-slate-400">Step 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Source Configuration (Left) */}
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-slate-700">Source Class (Current)</span>
                                <Badge variant="outline" className="bg-white text-slate-600 text-[10px]">
                                    Enrolled Students
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Session Year</label>
                                    <select
                                        value={sourceSessionYear}
                                        onChange={handleSourceSessionChange}
                                        className="w-full text-xs rounded-md border-slate-300 bg-white"
                                    >
                                        {sessionYears.map((yr) => (
                                            <option key={yr} value={yr}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Source Class</label>
                                    <select
                                        value={sourceClassId}
                                        onChange={handleSourceClassChange}
                                        className="w-full text-xs rounded-md border-slate-300 font-semibold text-slate-800 bg-white"
                                    >
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Source Section</label>
                                    <select
                                        value={sourceSectionId}
                                        onChange={handleSourceSectionChange}
                                        className="w-full text-xs rounded-md border-slate-300 bg-white"
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
                        <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-indigo-900">Target Class (Promoted To)</span>
                                <div className="flex items-center gap-1">
                                    {isBulkSkipping && (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                                            Class Skip
                                        </Badge>
                                    )}
                                    {isBulkRetaining && (
                                        <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">
                                            Retain Same Class
                                        </Badge>
                                    )}
                                    {!isBulkSkipping && !isBulkRetaining && (
                                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px]">
                                            Next Grade
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block text-xs font-medium text-indigo-900 mb-1">Target Session</label>
                                    <input
                                        type="text"
                                        value={targetSessionYear}
                                        onChange={handleTargetSessionChange}
                                        placeholder="e.g. 2026-2027"
                                        className="w-full text-xs rounded-md border-indigo-300 bg-white font-semibold text-indigo-900 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-indigo-900 mb-1">Bulk Target Class</label>
                                    <select
                                        value={bulkTargetClassId}
                                        onChange={(e) => {
                                            setBulkTargetClassId(e.target.value);
                                            setBulkTargetSectionId('');
                                        }}
                                        className="w-full text-xs rounded-md border-indigo-300 font-bold text-indigo-900 bg-white"
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
                                    <label className="block text-xs font-medium text-indigo-900 mb-1">Target Section</label>
                                    <select
                                        value={bulkTargetSectionId}
                                        onChange={(e) => setBulkTargetSectionId(e.target.value)}
                                        className="w-full text-xs rounded-md border-indigo-300 bg-white"
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
                    <div className="sticky top-4 z-30 bg-slate-900 text-white p-3.5 rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 font-bold text-xs">
                                {selectedStudentIds.length}
                            </span>
                            <div>
                                <h4 className="text-sm font-bold text-white">
                                    {selectedStudentIds.length} Student(s) Selected for Promotion
                                </h4>
                                <p className="text-xs text-slate-300">
                                    Targeting: <strong className="text-indigo-300">{selectedBulkTargetClass?.name}</strong> (Session: {targetSessionYear})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedStudentIds([])}
                                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
                            >
                                Clear Selection
                            </button>
                            <Button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 shadow-sm flex items-center gap-1.5"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Configure Fees & Promote Selected</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Student Selection Roster Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header Bar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleToggleSelectAll}
                                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                            >
                                {isAllSelected ? (
                                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-400" />
                                )}
                                <span>
                                    {isAllSelected ? 'Deselect All' : `Select All Eligible (${eligibleStudents.length})`}
                                </span>
                            </button>

                            <span className="text-slate-300">|</span>

                            <div className="text-xs text-slate-500">
                                Total Enrolled: <strong className="text-slate-800">{students.length}</strong>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">Quick Legend:</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                <Sparkles className="w-3 h-3" /> Next Grade
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                <FastForward className="w-3 h-3" /> Skip Grade
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <RotateCcw className="w-3 h-3" /> Retain
                            </span>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/90 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200 font-semibold">
                                <tr>
                                    <th className="py-3 px-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleToggleSelectAll}
                                            disabled={eligibleStudents.length === 0}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => {
                                    const isSelected = selectedStudentIds.includes(student.id);
                                    const studentTargetClassId = rowClassOverrides[student.id] || bulkTargetClassId;
                                    const targetClassObj = classes.find((c) => c.id === parseInt(studentTargetClassId, 10));

                                    const isRowSkipping = sourceClass && targetClassObj && targetClassObj.numeric_value > (sourceClass.numeric_value + 1);
                                    const isRowRetaining = sourceClass && targetClassObj && targetClassObj.numeric_value <= sourceClass.numeric_value;

                                    return (
                                        <tr
                                            key={student.id}
                                            className={`transition hover:bg-slate-50/80 ${
                                                isSelected ? 'bg-indigo-50/40' : student.is_already_promoted ? 'bg-emerald-50/20' : ''
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleStudent(student.id)}
                                                    disabled={student.is_already_promoted}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>

                                            {/* Student Details */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfileAvatar
                                                        src={student.photo_url}
                                                        name={student.full_name}
                                                        className="w-9 h-9"
                                                        iconClassName="w-4 h-4"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                                            {student.full_name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono">
                                                            Roll: {student.roll_number || 'N/A'} &bull; Adm: {student.admission_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Current Class */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-800 text-xs font-semibold">
                                                        {student.current_class_name} ({student.current_section_name || 'A'})
                                                    </Badge>
                                                    <span className="block text-[11px] text-slate-400 font-mono">
                                                        {student.current_session_year}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Current Fee Profile */}
                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-slate-800 font-mono text-xs">
                                                        ${Number(student.current_net_fee || 0).toFixed(2)}/mo
                                                    </span>
                                                    {student.current_discount > 0 && (
                                                        <span className="block text-[10px] text-emerald-600 font-medium">
                                                            -${Number(student.current_discount).toFixed(2)} ({student.current_discount_reason || 'Concession'})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Target Class Selector Override */}
                                            <td className="py-3.5 px-4">
                                                {student.is_already_promoted ? (
                                                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Enrolled in {student.target_enrollment_class} ({student.target_enrollment_section || 'A'})</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <select
                                                            value={studentTargetClassId}
                                                            onChange={(e) => handleRowClassOverride(student.id, e.target.value)}
                                                            className="text-xs rounded-md border-slate-300 font-medium py-1 px-2 bg-white"
                                                        >
                                                            {classes.map((cls) => (
                                                                <option key={cls.id} value={cls.id}>
                                                                    {cls.name} {cls.id === sourceClass?.id ? '(Repeat)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {isRowSkipping && (
                                                            <span title="Skipping classes" className="text-amber-600">
                                                                <FastForward className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {isRowRetaining && (
                                                            <span title="Repeating same class" className="text-rose-600">
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                {student.is_already_promoted ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                                                        Already Promoted
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                                        Eligible
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenSingleModal(student)}
                                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                                                >
                                                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                                    Promote Individually
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm font-medium">No students found for this class and session.</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Try selecting a different source class or session year above.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
