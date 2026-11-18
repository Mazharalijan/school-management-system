import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X, Award, Users, CheckSquare, Square, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BulkDmcPrintModal({
    isOpen,
    onClose,
    classDetails,
    examTerm,
    papers = [],
    students = [],
    teacher = {},
}) {
    const { props } = usePage();
    const settings = props.system_settings || {};

    const [selectedStudentIds, setSelectedStudentIds] = useState(() =>
        students.map((s) => s.id)
    );

    if (!isOpen) return null;

    const toggleStudent = (id) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map((s) => s.id));
        }
    };

    const selectedStudentsList = students.filter((s) => selectedStudentIds.includes(s.id));

    const calculateGrade = (pct) => {
        if (pct >= 90) return 'A+';
        if (pct >= 80) return 'A';
        if (pct >= 70) return 'B';
        if (pct >= 60) return 'C';
        if (pct >= 50) return 'D';
        if (pct >= 33) return 'E';
        return 'F';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return dateStr;
        }
    };

    const grandTotal = papers.reduce((sum, p) => sum + (Number(p.total_marks) || 100), 0);

    const handlePrint = () => {
        window.print();
    };

    const schoolName = settings?.school_name || 'GOVERNMENT PRIMARY SCHOOL';
    const schoolAddress = settings?.address || 'District Charsadda';
    const schoolTagline = settings?.school_tagline || 'Elementary & Secondary Education';
    const schoolLogo = settings?.logo_url || (settings?.logo_path ? `/storage/${settings.logo_path}` : null);
    const sessionTitle = examTerm?.name || 'Annual Examination';
    const sessionYear = examTerm?.session_year || settings?.current_session_year || new Date().getFullYear();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Dynamic Paper Adjustment & Bulk Print Rules */}
            <style>{`
                @page {
                    size: auto;
                    margin: 6mm;
                }
                @media print {
                    html, body {
                        background: #ffffff !important;
                    }
                    .bulk-dmc-item {
                        page-break-after: always !important;
                        break-after: page !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        height: auto !important;
                        max-height: 98vh !important;
                        box-sizing: border-box !important;
                        margin: 0 !important;
                        padding: 12px !important;
                    }
                    .bulk-dmc-item:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }
                }
            `}</style>

            <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card text-card-foreground border-border print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
                {/* Control Bar (Hidden on print) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border print:hidden">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            Bulk Detailed Marks Certificates (DMC) Print / Download
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {classDetails?.name || 'Class'} • {examTerm?.name} • {selectedStudentsList.length} of {students.length} students selected
                        </p>
                    </DialogHeader>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAll}
                            className="h-8 text-xs font-semibold gap-1.5"
                        >
                            {selectedStudentIds.length === students.length ? (
                                <>
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Square className="w-3.5 h-3.5" />
                                    Select All
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handlePrint}
                            disabled={selectedStudentsList.length === 0}
                            className="h-8 px-4 text-xs font-bold gap-1.5 shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print All ({selectedStudentsList.length})
                        </Button>
                    </div>
                </div>

                {/* Printable Multi-Page DMCs */}
                <div className="space-y-6 my-2 print:space-y-0 print:m-0">
                    {selectedStudentsList.length === 0 ? (
                        <div className="text-center py-12 text-sm text-muted-foreground font-sans">
                            No students selected for bulk DMC printing.
                        </div>
                    ) : (
                        selectedStudentsList.map((student, sIdx) => {
                            const totalObtained = papers.reduce((sum, p) => {
                                const key = p.subject_id || p.id;
                                const isAbsent = Boolean(student.absent?.[key] || student.absent?.[p.id]);
                                if (isAbsent) return sum;
                                const rawVal = student.marks?.[key] ?? student.marks?.[p.id];
                                const val = Number(rawVal);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);

                            const percentage = grandTotal > 0 ? ((totalObtained / grandTotal) * 100).toFixed(1) : 0;
                            const studentResult = student.result;
                            const grade = studentResult?.grade || calculateGrade(Number(percentage));
                            
                            const studentName = student.name || 'Student';
                            const fatherName = student.guardian_name || student.father_name || '-';
                            const admissionNo = student.admission_number || student.adm_no || '-';
                            const rollNo = student.roll_no || student.roll_number || admissionNo || `#${student.id}`;
                            const dob = formatDate(student.date_of_birth);
                            const className = `${classDetails?.name || 'Class'}${student.section_name ? ` - ${student.section_name}` : ''}`;
                            const studentPhoto = student.photo_url || (student.photo_path ? `/storage/${student.photo_path}` : null);
                            const position = studentResult?.position_in_class || 'N/A';
                            const remarks = studentResult?.teacher_remarks || (Number(percentage) >= 33 ? 'Passed' : 'Failed');

                            return (
                                <div
                                    key={student.id}
                                    className="bulk-dmc-item p-4 sm:p-5 bg-white text-black font-serif border-2 border-black relative overflow-hidden shadow-xs print:border-2 print:border-black print:shadow-none"
                                >
                                    {/* Watermark Emblem */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none z-0">
                                        {schoolLogo ? (
                                            <img src={schoolLogo} alt="Watermark" className="w-64 h-64 object-contain grayscale" />
                                        ) : (
                                            <svg viewBox="0 0 200 200" className="w-72 h-72 text-black fill-current" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6,4" />
                                                <circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" strokeWidth="2" />
                                                <path d="M100 35 L108 55 L130 55 L112 68 L118 88 L100 75 L82 88 L88 68 L70 55 L92 55 Z" />
                                                <path d="M55 135 C 55 105, 145 105, 145 135" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                                <text x="100" y="155" textAnchor="middle" fontSize="10" fontWeight="bold" letterSpacing="1.5">ACADEMIC EVALUATION</text>
                                            </svg>
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        {/* 1. Header */}
                                        <div className="flex items-center justify-between gap-3 pb-1">
                                            <div className="w-24 sm:w-28 flex flex-col items-center text-center shrink-0">
                                                {schoolLogo ? (
                                                    <img src={schoolLogo} alt="School Logo" className="h-12 w-12 sm:h-14 sm:w-14 object-contain mb-0.5 print:h-12 print:w-12" />
                                                ) : (
                                                    <div className="h-12 w-12 sm:h-14 sm:w-14 flex flex-col items-center justify-center text-black mb-0.5">
                                                        <BookOpen className="w-9 h-9 stroke-[1.5]" />
                                                    </div>
                                                )}
                                                <div className="text-[9px] font-sans font-black uppercase tracking-tight text-black leading-none">
                                                    {settings?.registration_number ? `REG #${settings.registration_number}` : 'KPESED'}
                                                </div>
                                                <div className="text-[7.5px] font-sans text-gray-700 font-medium leading-tight mt-0.5 max-w-[110px] line-clamp-1">
                                                    {schoolTagline}
                                                </div>
                                            </div>

                                            <div className="flex-1 text-center px-1 min-w-0">
                                                <h1 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide text-black font-serif leading-snug truncate max-w-full print:text-base">
                                                    {schoolName}
                                                </h1>
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-800 font-sans leading-tight print:text-[10px]">
                                                    {schoolAddress}
                                                </p>
                                                
                                                <div className="my-0.5">
                                                    <span className="inline-block px-3 py-0.5 rounded-full bg-gray-200/90 border border-gray-400 text-[10px] font-bold text-black uppercase tracking-wide font-sans leading-tight print:text-[9px] print:py-0">
                                                        {sessionTitle}, {sessionYear}
                                                    </span>
                                                </div>

                                                <h2 className="text-xs sm:text-sm font-black text-black font-serif tracking-widest uppercase pt-0.5 leading-tight print:text-xs">
                                                    Detailed Marks Certificate
                                                </h2>
                                            </div>

                                            <div className="w-24 sm:w-28 flex flex-col items-end shrink-0">
                                                <div className="w-20 h-24 border border-black bg-white overflow-hidden flex flex-col items-center justify-center relative shadow-2xs print:w-20 print:h-24">
                                                    {studentPhoto ? (
                                                        <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center p-1 text-center text-gray-400 h-full w-full bg-gray-50">
                                                            <User className="w-8 h-8 text-gray-400 stroke-1" />
                                                            <span className="text-[8px] font-sans font-bold text-gray-500 uppercase mt-0.5">Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Student Details */}
                                        <div className="border-t border-b-2 border-black py-1.5 my-1.5 text-[11px] print:text-[10px] font-sans text-black leading-tight">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-3">
                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-14 shrink-0 text-gray-700">Name:</span>
                                                    <span className="font-black uppercase tracking-wide truncate">{studentName}</span>
                                                </div>
                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-14 shrink-0 text-gray-700">Class:</span>
                                                    <span className="font-bold truncate">{className}</span>
                                                </div>
                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-14 shrink-0 text-gray-700">Roll No:</span>
                                                    <span className="font-black">{rollNo}</span>
                                                </div>

                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-14 shrink-0 text-gray-700">F/Name:</span>
                                                    <span className="font-bold uppercase truncate">{fatherName}</span>
                                                </div>
                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-20 shrink-0 text-gray-700">Date of Birth:</span>
                                                    <span className="font-bold font-mono">{dob}</span>
                                                </div>
                                                <div className="flex items-baseline min-w-0">
                                                    <span className="font-bold w-14 shrink-0 text-gray-700">Adm. No:</span>
                                                    <span className="font-black font-mono">{admissionNo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Table of Marks */}
                                        <div className="my-1.5 print:my-1 overflow-x-auto">
                                            <table className="w-full border-collapse border border-black text-[10.5px] print:text-[10px] font-sans text-black leading-tight">
                                                <thead>
                                                    <tr className="bg-gray-100 border-b border-black font-black uppercase text-center text-[10px] print:text-[9.5px]">
                                                        <th className="border-r border-black py-1 px-1.5 w-10">S.No</th>
                                                        <th className="border-r border-black py-1 px-2.5 text-left">Subjects</th>
                                                        <th className="border-r border-black py-1 px-2 w-24">Total Marks</th>
                                                        <th className="border-r border-black py-1 px-2 w-28">Obtained Marks</th>
                                                        <th className="border-r border-black py-1 px-2 w-20">Percentage</th>
                                                        <th className="py-1 px-2 w-20">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {papers.map((p, index) => {
                                                        const key = p.subject_id || p.id;
                                                        const isAbsent = Boolean(student.absent?.[key] || student.absent?.[p.id]);
                                                        const rawVal = student.marks?.[key] ?? student.marks?.[p.id];
                                                        const marks = isAbsent ? 'ABS' : Number(rawVal ?? 0);
                                                        const max = Number(p.total_marks) || 100;
                                                        const passThreshold = p.passing_marks ?? Math.round(max * 0.33);
                                                        const isPass = !isAbsent && Number(marks) >= passThreshold;
                                                        const subjectPercent = isAbsent ? 0 : max > 0 ? ((Number(marks) / max) * 100).toFixed(1) : 0;

                                                        return (
                                                            <tr key={p.id} className="border-b border-black text-center font-medium">
                                                                <td className="border-r border-black py-1 px-1.5 print:py-0.5 font-bold">{index + 1}</td>
                                                                <td className="border-r border-black py-1 px-2.5 print:py-0.5 text-left font-bold text-[11px] print:text-[10px] truncate max-w-[200px]">
                                                                    {p.subject_name || p.subject?.name || p.name}
                                                                </td>
                                                                <td className="border-r border-black py-1 px-2 print:py-0.5 font-semibold font-mono">{max}</td>
                                                                <td className="border-r border-black py-1 px-2 print:py-0.5 font-black font-mono">
                                                                    {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : marks}
                                                                </td>
                                                                <td className="border-r border-black py-1 px-2 print:py-0.5 font-semibold font-mono">
                                                                    {isAbsent ? '0.0%' : `${subPercent}%`}
                                                                </td>
                                                                <td className="py-1 px-2 print:py-0.5 font-black text-[10px]">
                                                                    <span className={isPass ? 'text-emerald-700' : 'text-rose-700'}>
                                                                        {isPass ? 'PASS' : 'FAIL'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Total Row */}
                                                    <tr className="border-t-2 border-black bg-gray-50/90 font-black text-center text-[11px] print:text-[10px]">
                                                        <td colSpan={2} className="border-r border-black py-1.5 px-3 print:py-1 text-center uppercase tracking-wider font-bold">
                                                            Total Marks
                                                        </td>
                                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                                            {grandTotal}
                                                        </td>
                                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                                            {totalObtained}
                                                        </td>
                                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                                            {percentage}%
                                                        </td>
                                                        <td className="py-1.5 px-2 print:py-1 font-black text-emerald-800">
                                                            {Number(percentage) >= 33 ? 'PASS' : 'FAIL'}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* 4. Notes & Summary Row */}
                                        <p className="text-[9.5px] print:text-[8.5px] font-sans text-gray-700 italic my-0.5 leading-none">
                                            Errors and Omission are Subject to subsequent rectification
                                        </p>

                                        <div className="border border-black bg-gray-50/70 py-1 px-2 text-[10.5px] print:text-[9.5px] font-sans font-bold flex flex-wrap items-center justify-between gap-2 my-1 text-black leading-tight">
                                            <div className="flex items-center">
                                                <span className="text-gray-700 font-normal mr-1">Position in Class:</span>
                                                <span className="font-black">#{position}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-700 font-normal mr-1">Out of:</span>
                                                <span className="font-black">{students.length}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-700 font-normal mr-1">Grade:</span>
                                                <span className="font-black">{grade}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-700 font-normal mr-1">Percentage:</span>
                                                <span className="font-black font-mono">{percentage}%</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-gray-700 font-normal mr-1">Remarks:</span>
                                                <span className="font-black italic">{remarks}</span>
                                            </div>
                                        </div>

                                        {/* 5. Signatures */}
                                        <div className="flex justify-between items-end pt-3 pb-1 print:pt-2 print:pb-0.5 text-[10px] print:text-[9px] font-sans text-black">
                                            <div className="flex flex-col items-center">
                                                <div className="h-6 flex items-end justify-center mb-0.5 print:h-5">
                                                    <svg className="w-20 h-6 text-black print:w-16 print:h-5" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                        <path d="M10 20 Q 25 5, 35 22 T 55 12 Q 70 25, 85 10 T 95 18" />
                                                    </svg>
                                                </div>
                                                <div className="border-t border-black pt-0.5 w-32 text-center">
                                                    <p className="font-bold">Class Teacher</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <div className="h-6 flex items-end justify-center mb-0.5 print:h-5">
                                                    <svg className="w-24 h-6 text-black print:w-20 print:h-5" viewBox="0 0 120 30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                                                        <path d="M10 24 C 20 8, 30 5, 40 18 C 50 28, 65 8, 80 16 C 90 22, 100 10, 115 14" />
                                                    </svg>
                                                </div>
                                                <div className="border-t border-black pt-0.5 w-40 text-center">
                                                    <p className="font-bold">Headmaster</p>
                                                    <p className="text-[9px] text-gray-700 font-semibold truncate max-w-[160px] leading-none">{schoolName}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification Audit */}
                                        <div className="border-t border-gray-300 pt-1 flex flex-col sm:flex-row justify-between text-[8.5px] print:text-[8px] font-mono text-gray-600 gap-0.5 leading-tight">
                                            <div>
                                                <span>Examination Session: <strong className="text-black font-sans">{sessionYear}</strong></span>
                                                <span className="mx-2">•</span>
                                                <span>Result Declared: <strong className="text-black font-sans">{new Date().toLocaleDateString()}</strong></span>
                                            </div>
                                            <div className="sm:text-right">
                                                <span>DMC #{studentResult?.id ? `DMC-${studentResult.id}` : `DMC-${student.id}`} • Bulk Batch Print</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
