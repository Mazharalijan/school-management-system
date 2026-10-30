import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Printer, ArrowLeft, Award, CheckCircle, XCircle } from 'lucide-react';

export default function Dmc({ result, subjectMarks = [] }) {
    const handlePrint = () => {
        window.print();
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Marks & Results
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
                    >
                        <Printer className="w-4 h-4" /> Print DMC Certificate
                    </button>
                </div>

                {/* Printable DMC Certificate Container */}
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-5 mb-6 space-y-1">
                        <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-widest font-sans">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Academic Examination & Evaluation Board
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900 font-serif">
                            Detailed Marks Certificate (DMC)
                        </h1>
                        <p className="text-sm font-semibold text-slate-600 font-sans">
                            {result?.exam_session?.title} — Academic Session {result?.exam_session?.session_year}
                        </p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans mb-6">
                        <div>
                            <span className="block text-slate-500 font-medium">Student Name</span>
                            <span className="font-extrabold text-slate-900 text-sm">{studentName}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Roll Number</span>
                            <span className="font-bold text-slate-900">{rollNo}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Class & Section</span>
                            <span className="font-bold text-slate-900">{result?.school_class?.name}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-medium">Class Position</span>
                            <span className="font-black text-indigo-700 text-sm">
                                {result?.position_in_class ? `#${result?.position_in_class}` : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Subjects Marks Breakdown Table */}
                    <table className="w-full border-collapse border border-slate-300 text-xs mb-6 font-sans">
                        <thead className="bg-slate-100 text-slate-800">
                            <tr>
                                <th className="border border-slate-300 px-4 py-2.5 text-left font-bold uppercase">Subject</th>
                                <th className="border border-slate-300 px-4 py-2.5 text-center font-bold uppercase w-24">Max Marks</th>
                                <th className="border border-slate-300 px-4 py-2.5 text-center font-bold uppercase w-28">Obtained Marks</th>
                                <th className="border border-slate-300 px-4 py-2.5 text-center font-bold uppercase w-24">Percentage</th>
                                <th className="border border-slate-300 px-4 py-2.5 text-center font-bold uppercase w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {subjectMarks?.map((sm) => {
                                const isAbsent = Boolean(sm.is_absent);
                                const obtained = isAbsent ? 0 : Number(sm.obtained_marks);
                                const total = Number(sm.total_marks) || 100;
                                const subPercent = total > 0 ? ((obtained / total) * 100).toFixed(1) : 0;
                                const isPass = !isAbsent && subPercent >= 33;

                                return (
                                    <tr key={sm.id} className="hover:bg-slate-50/50">
                                        <td className="border border-slate-300 px-4 py-2.5 font-bold text-slate-800">
                                            {sm.subject?.subject_name}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2.5 text-center text-slate-600 font-medium">
                                            {sm.total_marks}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2.5 text-center font-extrabold text-slate-900">
                                            {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : sm.obtained_marks}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2.5 text-center text-slate-600 font-semibold">
                                            {isAbsent ? '0%' : `${subPercent}%`}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2.5 text-center font-bold">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                                isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900 text-white rounded-xl text-center text-xs font-sans mb-10">
                        <div>
                            <span className="block text-[11px] uppercase text-slate-400 font-medium">Total Marks</span>
                            <span className="text-base font-extrabold text-white">
                                {result?.total_obtained_marks} / {result?.total_max_marks}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase text-slate-400 font-medium">Overall Percentage</span>
                            <span className="text-base font-extrabold text-indigo-300">
                                {result?.percentage}%
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase text-slate-400 font-medium">Academic Grade</span>
                            <span className="text-base font-black text-amber-300">
                                {result?.grade || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase text-slate-400 font-medium">Final Result</span>
                            <span className={`text-base font-black uppercase ${
                                result?.status === 'pass' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {result?.status === 'pass' ? 'PASSED' : 'FAILED'}
                            </span>
                        </div>
                    </div>

                    {result?.teacher_remarks && (
                        <div className="mb-8 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="font-bold text-slate-700">Teacher Remarks: </span>
                            <span className="text-slate-600 italic">"{result.teacher_remarks}"</span>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="flex justify-between items-end pt-12 text-xs font-bold text-slate-700 font-sans">
                        <div className="border-t border-slate-900 pt-2 w-36 text-center">
                            <p>Class Teacher</p>
                            <span className="text-[10px] text-slate-400 font-normal">Signature & Date</span>
                        </div>
                        <div className="border-t border-slate-900 pt-2 w-36 text-center">
                            <p>Controller of Exam</p>
                            <span className="text-[10px] text-slate-400 font-normal">Official Seal</span>
                        </div>
                        <div className="border-t border-slate-900 pt-2 w-36 text-center">
                            <p>Principal</p>
                            <span className="text-[10px] text-slate-400 font-normal">Signature & Stamp</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}