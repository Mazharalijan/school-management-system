import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Printer, Download, X, Award, Users, CheckSquare, Square } from 'lucide-react';
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

    const grandTotal = papers.reduce((sum, p) => sum + (Number(p.total_marks) || 100), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                            className="h-8 px-4 text-xs font-bold gap-1.5 shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print / Save All as PDF ({selectedStudentsList.length})
                        </Button>
                    </div>
                </div>

                {/* Printable Continuous Document Area */}
                <div className="mt-4 space-y-8 print:space-y-0">
                    {selectedStudentsList.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            No students selected for bulk DMC printing.
                        </div>
                    ) : (
                        selectedStudentsList.map((student, sIdx) => {
                            const totalObtained = papers.reduce((sum, p) => {
                                const key = p.subject_id || p.id;
                                const isAbsent = Boolean(student.absent?.[key] || student.absent?.[p.id]);
                                if (isAbsent) return sum;
                                const val = Number(student.marks?.[key] ?? student.marks?.[p.id] ?? 0);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);

                            const percentage = grandTotal > 0 ? ((totalObtained / grandTotal) * 100).toFixed(1) : 0;
                            const grade = calculateGrade(Number(percentage));
                            const studentResult = student.result;

                            return (
                                <div
                                    key={student.id}
                                    className="p-8 sm:p-10 bg-white text-black font-serif rounded-xl border border-gray-300 shadow-xs print:border-none print:shadow-none print:p-6 print:m-0"
                                    style={{
                                        pageBreakAfter: sIdx < selectedStudentsList.length - 1 ? 'always' : 'auto',
                                        breakAfter: sIdx < selectedStudentsList.length - 1 ? 'page' : 'auto',
                                    }}
                                >
                                    {/* DMC Header */}
                                    <div className="text-center border-b-2 border-black pb-4 space-y-1">
                                        <div className="flex items-center justify-center gap-2 text-indigo-900 font-sans font-bold text-xs uppercase tracking-widest">
                                            <Award className="w-4 h-4 text-indigo-700" />
                                            {settings.school_name || 'Academic Comprehensive School Portal'}
                                        </div>
                                        <h2 className="text-xl font-black uppercase tracking-wider font-sans text-black">
                                            DETAILED MARKS CERTIFICATE (DMC)
                                        </h2>
                                        <p className="text-xs font-semibold text-gray-600 font-sans">
                                            {examTerm?.name} • Academic Session {settings.current_session_year || '2026-2027'}
                                        </p>
                                    </div>

                                    {/* Student Profile Info */}
                                    <div className="flex items-center gap-4 text-xs font-sans border border-gray-300 p-3.5 rounded-lg bg-gray-50 my-5">
                                        <ProfileAvatar
                                            src={student.photo_url}
                                            name={student.name}
                                            className="w-12 h-12 border-2 border-gray-300"
                                            iconClassName="w-6 h-6"
                                        />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                                            <div>
                                                <span className="block text-gray-500 font-medium text-[11px]">Student Name:</span>
                                                <strong className="text-black text-sm">{student.name}</strong>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 font-medium text-[11px]">Roll Number:</span>
                                                <strong className="text-black">{student.roll_no}</strong>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 font-medium text-[11px]">Class:</span>
                                                <strong className="text-black">{classDetails?.name || 'Class'}</strong>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 font-medium text-[11px]">Class Position:</span>
                                                <strong className="text-indigo-800 font-black">
                                                    {studentResult?.position_in_class ? `#${studentResult.position_in_class}` : 'N/A'}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marks Breakdown Table */}
                                    <table className="w-full border-collapse text-left font-sans text-xs border border-gray-300 my-4">
                                        <thead>
                                            <tr className="bg-gray-100 text-black border-b border-gray-300 font-bold uppercase">
                                                <th className="p-2.5 border-r border-gray-300">Subject</th>
                                                <th className="p-2.5 text-center border-r border-gray-300 w-24">Max Marks</th>
                                                <th className="p-2.5 text-center border-r border-gray-300 w-28">Obtained</th>
                                                <th className="p-2.5 text-center border-r border-gray-300 w-24">Percentage</th>
                                                <th className="p-2.5 text-center w-24">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {papers.map((p) => {
                                                const key = p.subject_id || p.id;
                                                const isAbsent = Boolean(student.absent?.[key] || student.absent?.[p.id]);
                                                const rawVal = student.marks?.[key] ?? student.marks?.[p.id];
                                                const marks = isAbsent ? 'ABSENT' : Number(rawVal ?? 0);
                                                const max = Number(p.total_marks) || 100;
                                                const subjectPercent = isAbsent ? 0 : max > 0 ? ((marks / max) * 100).toFixed(1) : 0;
                                                const isPass = !isAbsent && subjectPercent >= 33;

                                                return (
                                                    <tr key={p.id}>
                                                        <td className="p-2.5 border-r border-gray-300 font-semibold text-black">
                                                            {p.subject?.name || p.name}
                                                        </td>
                                                        <td className="p-2.5 border-r border-gray-300 text-center text-gray-700">
                                                            {max}
                                                        </td>
                                                        <td className="p-2.5 border-r border-gray-300 text-center font-bold">
                                                            {isAbsent ? (
                                                                <span className="text-rose-600 font-bold">ABSENT</span>
                                                            ) : (
                                                                marks
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 border-r border-gray-300 text-center text-gray-700 font-mono">
                                                            {isAbsent ? '-' : `${subjectPercent}%`}
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold">
                                                            {isPass ? (
                                                                <span className="text-emerald-700">PASS</span>
                                                            ) : (
                                                                <span className="text-rose-700">FAIL</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100 border-t-2 border-black font-bold">
                                                <td className="p-2.5 border-r border-gray-300 uppercase">Grand Total</td>
                                                <td className="p-2.5 border-r border-gray-300 text-center">{grandTotal}</td>
                                                <td className="p-2.5 border-r border-gray-300 text-center font-black text-indigo-900 text-sm">
                                                    {totalObtained}
                                                </td>
                                                <td className="p-2.5 border-r border-gray-300 text-center font-mono">
                                                    {percentage}%
                                                </td>
                                                <td className="p-2.5 text-center font-black text-sm text-indigo-900">
                                                    Grade: {grade}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    {/* Signatures & Evaluation Footer */}
                                    <div className="pt-8 mt-6 border-t border-gray-300 flex justify-between items-end text-xs font-sans">
                                        <div className="space-y-1 text-left text-gray-600">
                                            <p className="text-[11px]">Evaluation Status: <strong className="text-black uppercase">{percentage >= 33 ? 'Promoted' : 'Needs Improvement'}</strong></p>
                                            <p className="text-[10px] text-gray-500">Date of Issue: {new Date().toLocaleDateString()}</p>
                                        </div>

                                        <div className="flex gap-10 text-center">
                                            <div className="space-y-1">
                                                <div className="w-28 border-b-2 border-black h-8" />
                                                <span className="font-semibold text-gray-700">Class Teacher</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="w-32 border-b-2 border-black h-8" />
                                                <span className="font-bold text-black">Exam Controller</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="w-28 border-b-2 border-black h-8" />
                                                <span className="font-bold text-black">Principal</span>
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
