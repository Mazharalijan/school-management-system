import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowLeft, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dmc({ result, subjectMarks = [], documentPrint = null, totalStudentsInClass = null, settings = null }) {
    const pageProps = usePage().props;
    const systemSettings = settings || pageProps.system_settings || {};

    const [localPrint, setLocalPrint] = useState(documentPrint);
    const [isPrinting, setIsPrinting] = useState(false);

    const currentPrintCount = localPrint?.print_count || 1;
    const currentCopyLabel = localPrint?.copy_label || (currentPrintCount === 1 ? 'ORIGINAL' : `DUPLICATE (Copy #${currentPrintCount})`);

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            const res = await fetch(route('marks.dmc.print', result.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ printer_type: 'standard' }),
            });

            if (res.ok) {
                const data = await res.json();
                setLocalPrint((prev) => ({
                    ...prev,
                    print_count: data.print_count,
                    copy_label: data.copy_label,
                    last_printed_at: data.last_printed_at,
                    print_logs: [data.log, ...(prev?.print_logs || [])],
                }));
            }
        } catch (err) {
            console.error('Failed to log DMC print:', err);
        } finally {
            setIsPrinting(false);
            setTimeout(() => {
                window.print();
            }, 250);
        }
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

    const student = result?.student;
    const studentName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student';
    const fatherName = student?.guardian_name || student?.father_name || '-';
    const admissionNo = student?.admission_number || '-';
    const rollNo = student?.roll_number || admissionNo || `#${student?.id}`;
    const dob = formatDate(student?.date_of_birth);
    const sectionName = student?.current_enrollment?.section?.name;
    const className = `${result?.school_class?.name || 'Class'}${sectionName ? ` - ${sectionName}` : ''}`;
    const studentPhoto = student?.photo_url || (student?.photo_path ? `/storage/${student.photo_path}` : null);
    const schoolLogo = systemSettings?.logo_url || (systemSettings?.logo_path ? `/storage/${systemSettings.logo_path}` : null);

    const schoolName = systemSettings?.school_name || 'GOVERNMENT PRIMARY SCHOOL';
    const schoolAddress = systemSettings?.address || 'District Charsadda';
    const schoolTagline = systemSettings?.school_tagline || 'Elementary & Secondary Education';
    const sessionTitle = result?.exam_session?.title || 'Annual Examination';
    const sessionYear = result?.exam_session?.session_year || systemSettings?.current_session_year || new Date().getFullYear();

    const totalStudents = totalStudentsInClass || 40;
    const position = result?.position_in_class || 'N/A';
    const grade = result?.grade || 'A1';
    const percentage = result?.percentage ? Number(result.percentage).toFixed(1) : '0.0';
    const remarks = result?.teacher_remarks || (result?.status === 'pass' ? 'Passed' : 'Failed');

    const totalMax = result?.total_max_marks || subjectMarks.reduce((sum, sm) => sum + (Number(sm.total_marks) || 100), 0);
    const totalObtained = result?.total_obtained_marks || subjectMarks.reduce((sum, sm) => sum + (sm.is_absent ? 0 : Number(sm.obtained_marks) || 0), 0);

    const examStartDate = formatDate(result?.exam_session?.start_date);
    const examEndDate = formatDate(result?.exam_session?.end_date);
    const heldDates = examStartDate !== '-' && examEndDate !== '-' ? `${examStartDate} to ${examEndDate}` : `Academic Session ${sessionYear}`;
    const declaredDate = formatDate(result?.created_at) !== '-' ? formatDate(result?.created_at) : formatDate(new Date());

    return (
        <AppLayout title="Detailed Marks Certificate">
            <Head title={`DMC - ${studentName}`} />

            {/* Print Styling to ensure perfect 1-page fit on A4, Letter, and Legal */}
            <style>{`
                @page {
                    size: auto;
                    margin: 6mm;
                }
                @media print {
                    html, body, #app, main {
                        height: 100% !important;
                        overflow: hidden !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .dmc-print-sheet {
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: 98vh !important;
                        box-sizing: border-box !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto py-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none">
                {/* Screen-Only Control Toolbar */}
                <div className="flex items-center justify-between mb-4 print:hidden">
                    <Link
                        href={route('exam-class-papers.index', { tab: 'marks' })}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Marks & Results
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <Badge
                            variant="outline"
                            className={cn(
                                "font-mono font-bold text-xs px-2.5 py-1",
                                currentPrintCount === 1
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300"
                            )}
                        >
                            {currentCopyLabel} (Print #{currentPrintCount})
                        </Badge>

                        <Button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="inline-flex items-center gap-2 text-xs font-semibold shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            {localPrint ? 'Print Copy / Reprint DMC' : 'Print DMC Certificate'}
                        </Button>
                    </div>
                </div>

                {/* Printable DMC Certificate Container */}
                <div className="dmc-print-sheet bg-white text-black p-4 sm:p-5 border-2 border-black relative overflow-hidden font-serif shadow-md print:p-4 print:border-2 print:border-black print:m-0 print:w-full print:shadow-none">
                    
                    {/* Background Watermark Emblem */}
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
                        {/* 1. TOP HEADER SECTION */}
                        <div className="flex items-center justify-between gap-3 pb-1">
                            {/* Left: Department / School Logo & Tagline */}
                            <div className="w-24 sm:w-28 flex flex-col items-center text-center shrink-0">
                                {schoolLogo ? (
                                    <img
                                        src={schoolLogo}
                                        alt="School Logo"
                                        className="h-12 w-12 sm:h-14 sm:w-14 object-contain mb-0.5 print:h-12 print:w-12"
                                    />
                                ) : (
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 flex flex-col items-center justify-center text-black mb-0.5">
                                        <BookOpen className="w-9 h-9 stroke-[1.5]" />
                                    </div>
                                )}
                                <div className="text-[9px] font-sans font-black uppercase tracking-tight text-black leading-none">
                                    {systemSettings?.registration_number ? `REG #${systemSettings.registration_number}` : 'KPESED'}
                                </div>
                                <div className="text-[7.5px] font-sans text-gray-700 font-medium leading-tight mt-0.5 max-w-[110px] line-clamp-1">
                                    {schoolTagline}
                                </div>
                            </div>

                            {/* Center: School Name, District, Examination Capsule & Title */}
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

                            {/* Right: Student Passport Photo Box */}
                            <div className="w-24 sm:w-28 flex flex-col items-end shrink-0">
                                <div className="w-20 h-24 border border-black bg-white overflow-hidden flex flex-col items-center justify-center relative shadow-2xs print:w-20 print:h-24">
                                    {studentPhoto ? (
                                        <img
                                            src={studentPhoto}
                                            alt={studentName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-1 text-center text-gray-400 h-full w-full bg-gray-50">
                                            <User className="w-8 h-8 text-gray-400 stroke-1" />
                                            <span className="text-[8px] font-sans font-bold text-gray-500 uppercase mt-0.5">Photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. STUDENT DETAILS GRID */}
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

                        {/* 3. MARKS BREAKDOWN TABLE */}
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
                                    {subjectMarks?.length > 0 ? (
                                        subjectMarks.map((sm, index) => {
                                            const isAbsent = Boolean(sm.is_absent);
                                            const obtained = isAbsent ? 0 : Number(sm.obtained_marks);
                                            const total = Number(sm.total_marks) || 100;
                                            const subPercent = total > 0 ? ((obtained / total) * 100).toFixed(1) : 0;
                                            const isPass = !isAbsent && subPercent >= 33;

                                            return (
                                                <tr key={sm.id || index} className="border-b border-black text-center font-medium">
                                                    <td className="border-r border-black py-1 px-1.5 print:py-0.5 font-bold">{index + 1}</td>
                                                    <td className="border-r border-black py-1 px-2.5 print:py-0.5 text-left font-bold text-[11px] print:text-[10px] truncate max-w-[200px]">
                                                        {sm.subject?.subject_name || sm.subject_name || `Subject #${sm.subject_id}`}
                                                    </td>
                                                    <td className="border-r border-black py-1 px-2 print:py-0.5 font-semibold font-mono">{total}</td>
                                                    <td className="border-r border-black py-1 px-2 print:py-0.5 font-black font-mono">
                                                        {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : obtained}
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
                                        })
                                    ) : (
                                        <tr className="border-b border-black text-center">
                                            <td colSpan={6} className="py-2 text-gray-500 font-sans italic text-[10px]">
                                                No individual subject marks records found for this result.
                                            </td>
                                        </tr>
                                    )}

                                    {/* Total Marks Row */}
                                    <tr className="border-t-2 border-black bg-gray-50/90 font-black text-center text-[11px] print:text-[10px]">
                                        <td colSpan={2} className="border-r border-black py-1.5 px-3 print:py-1 text-center uppercase tracking-wider font-bold">
                                            Total Marks
                                        </td>
                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                            {Number(totalMax)}
                                        </td>
                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                            {Number(totalObtained)}
                                        </td>
                                        <td className="border-r border-black py-1.5 px-2 print:py-1 font-black font-mono">
                                            {percentage}%
                                        </td>
                                        <td className="py-1.5 px-2 print:py-1 font-black text-emerald-800">
                                            {result?.status === 'pass' ? 'PASS' : 'FAIL'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. UNDER-TABLE NOTE & PERFORMANCE METRICS */}
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
                                <span className="font-black">{totalStudents}</span>
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

                        {/* 5. SIGNATURES & RESULT DECLARATION */}
                        <div className="flex justify-between items-end pt-3 pb-1 print:pt-2 print:pb-0.5 text-[10px] print:text-[9px] font-sans text-black">
                            {/* Class Teacher Signature */}
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

                            {/* Headmaster / Principal Signature */}
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

                        {/* Bottom Metadata & Verification Row */}
                        <div className="border-t border-gray-300 pt-1 flex flex-col sm:flex-row justify-between text-[8.5px] print:text-[8px] font-mono text-gray-600 gap-0.5 leading-tight">
                            <div>
                                <span>Examination Held in: <strong className="text-black font-sans">{heldDates}</strong></span>
                                <span className="mx-2">•</span>
                                <span>Result Declared: <strong className="text-black font-sans">{declaredDate}</strong></span>
                            </div>
                            <div className="sm:text-right">
                                <span>DMC #{localPrint?.document_number || `DMC-${result.id}`} • Total Prints: {currentPrintCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
