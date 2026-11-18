import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, ArrowLeft, Award, History, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dmc({ result, subjectMarks = [], documentPrint = null }) {
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

    const studentName = result?.student?.full_name || `${result?.student?.first_name || ''} ${result?.student?.last_name || ''}`.trim() || 'Student';
    const rollNo = result?.student?.roll_number || result?.student?.admission_number || `#${result?.student?.id}`;

    return (
        <AppLayout title="Detailed Marks Certificate">
            <Head title={`DMC - ${studentName}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
                            className="inline-flex items-center gap-2 text-xs font-semibold shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            {localPrint ? 'Print Copy / Reprint DMC' : 'Print DMC Certificate'}
                        </Button>
                    </div>
                </div>

                {/* Printable DMC Certificate Container */}
                <div className="bg-card text-card-foreground p-8 md:p-10 rounded-sm shadow-md border border-border relative print:bg-white print:text-black print:shadow-none print:border-none print:p-0">
                    {/* Copy Stamp Badge */}
                    <div className="absolute top-6 right-6 text-right print:top-4 print:right-4">
                        <span className={cn(
                            "inline-block px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-widest border-2",
                            currentPrintCount === 1
                                ? "border-emerald-700 text-emerald-800 bg-emerald-50"
                                : "border-amber-700 text-amber-800 bg-amber-50"
                        )}>
                            {currentCopyLabel}
                        </span>
                        <p className="text-[9px] font-mono text-muted-foreground print:text-gray-500 mt-0.5">
                            DMC #{localPrint?.document_number || `DMC-${result.id}`} • Total Prints: {currentPrintCount}
                        </p>
                    </div>
                    {/* Header */}
                    <div className="text-center border-b-2 border-foreground/80 print:border-black pb-5 mb-6 space-y-1">
                        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-widest font-sans print:text-indigo-700">
                            <Award className="w-5 h-5 text-primary print:text-indigo-600" />
                            Academic Examination & Evaluation Board
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-wide text-foreground print:text-black font-serif">
                            Detailed Marks Certificate (DMC)
                        </h1>
                        <p className="text-sm font-semibold text-muted-foreground print:text-gray-600 font-sans">
                            {result?.exam_session?.title} — Academic Session {result?.exam_session?.session_year}
                        </p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="flex items-center gap-4 p-4 rounded-xs bg-muted/40 border border-border print:bg-gray-50 print:border-gray-300 text-xs font-sans mb-6">
                        <ProfileAvatar
                            src={result?.student?.photo_url}
                            name={studentName}
                            className="w-14 h-14 border-2 border-primary/20"
                            iconClassName="w-7 h-7"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                            <div>
                                <span className="block text-muted-foreground print:text-gray-500 font-medium">Student Name</span>
                                <span className="font-extrabold text-foreground print:text-black text-sm">{studentName}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground print:text-gray-500 font-medium">Roll Number</span>
                                <span className="font-bold text-foreground print:text-black">{rollNo}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground print:text-gray-500 font-medium">Class & Section</span>
                                <span className="font-bold text-foreground print:text-black">{result?.school_class?.name}</span>
                            </div>
                            <div>
                                <span className="block text-muted-foreground print:text-gray-500 font-medium">Class Position</span>
                                <span className="font-black text-primary print:text-indigo-700 text-sm">
                                    {result?.position_in_class ? `#${result?.position_in_class}` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Marks Breakdown Table */}
                    <table className="w-full border-collapse border border-border print:border-gray-300 text-xs mb-6 font-sans">
                        <thead className="bg-muted/60 text-foreground print:bg-gray-100 print:text-black">
                            <tr>
                                <th className="border border-border print:border-gray-300 px-4 py-2.5 text-left font-bold uppercase">Subject</th>
                                <th className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-bold uppercase w-24">Max Marks</th>
                                <th className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-bold uppercase w-28">Obtained Marks</th>
                                <th className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-bold uppercase w-24">Percentage</th>
                                <th className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-bold uppercase w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border print:divide-gray-200">
                            {subjectMarks?.map((sm) => {
                                const isAbsent = Boolean(sm.is_absent);
                                const obtained = isAbsent ? 0 : Number(sm.obtained_marks);
                                const total = Number(sm.total_marks) || 100;
                                const subPercent = total > 0 ? ((obtained / total) * 100).toFixed(1) : 0;
                                const isPass = !isAbsent && subPercent >= 33;

                                return (
                                    <tr key={sm.id} className="hover:bg-muted/40 print:hover:bg-transparent">
                                        <td className="border border-border print:border-gray-300 px-4 py-2.5 font-bold text-foreground print:text-black">
                                            {sm.subject?.subject_name}
                                        </td>
                                        <td className="border border-border print:border-gray-300 px-4 py-2.5 text-center text-muted-foreground print:text-gray-700 font-medium">
                                            {sm.total_marks}
                                        </td>
                                        <td className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-extrabold text-foreground print:text-black">
                                            {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : sm.obtained_marks}
                                        </td>
                                        <td className="border border-border print:border-gray-300 px-4 py-2.5 text-center text-muted-foreground print:text-gray-700 font-semibold">
                                            {isAbsent ? '0%' : `${subPercent}%`}
                                        </td>
                                        <td className="border border-border print:border-gray-300 px-4 py-2.5 text-center font-bold">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                                isPass 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 print:bg-emerald-50 print:text-emerald-700' 
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 print:bg-rose-50 print:text-rose-700'
                                            }`}>
                                                {isPass ? 'PASS' : 'FAIL'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Total Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-foreground text-background dark:bg-muted dark:text-foreground rounded-xs text-center text-xs font-sans mb-10 print:bg-gray-900 print:text-white">
                        <div>
                            <span className="block text-[11px] uppercase opacity-75 font-medium">Total Marks</span>
                            <span className="text-base font-extrabold">
                                {result?.total_obtained_marks} / {result?.total_max_marks}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase opacity-75 font-medium">Overall Percentage</span>
                            <span className="text-base font-extrabold text-primary dark:text-indigo-300 print:text-indigo-300">
                                {result?.percentage}%
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase opacity-75 font-medium">Academic Grade</span>
                            <span className="text-base font-black text-amber-500 dark:text-amber-300 print:text-amber-300">
                                {result?.grade || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase opacity-75 font-medium">Final Result</span>
                            <span className={`text-base font-black uppercase ${
                                result?.status === 'pass' ? 'text-emerald-500 dark:text-emerald-400 print:text-emerald-400' : 'text-rose-500 dark:text-rose-400 print:text-rose-400'
                            }`}>
                                {result?.status === 'pass' ? 'PASSED' : 'FAILED'}
                            </span>
                        </div>
                    </div>

                    {result?.teacher_remarks && (
                        <div className="mb-8 p-3.5 bg-muted/40 border border-border rounded-xs text-xs print:bg-gray-50 print:border-gray-300">
                            <span className="font-bold text-foreground print:text-black">Teacher Remarks: </span>
                            <span className="text-muted-foreground print:text-gray-700 italic">"{result.teacher_remarks}"</span>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="flex justify-between items-end pt-12 text-xs font-bold text-foreground print:text-black font-sans">
                        <div className="border-t border-border print:border-black pt-2 w-36 text-center">
                            <p>Class Teacher</p>
                            <span className="text-[10px] text-muted-foreground print:text-gray-500 font-normal">Signature & Date</span>
                        </div>
                        <div className="border-t border-border print:border-black pt-2 w-36 text-center">
                            <p>Controller of Exam</p>
                            <span className="text-[10px] text-muted-foreground print:text-gray-500 font-normal">Official Seal</span>
                        </div>
                        <div className="border-t border-border print:border-black pt-2 w-36 text-center">
                            <p>Principal</p>
                            <span className="text-[10px] text-muted-foreground print:text-gray-500 font-normal">Signature & Stamp</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}