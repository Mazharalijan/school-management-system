import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Dmc({ result, subjectMarks }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout title="Detailed Marks Certificate">
            <Head title={`DMC - ${result?.student?.name}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-end mb-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900"
                    >
                        Print DMC Sheet
                    </button>
                </div>

                {/* Printable DMC Certificate Container */}
                <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="text-center border-b pb-6 mb-6">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-800">
                            Detailed Marks Certificate
                        </h1>
                        <p className="text-sm font-medium text-slate-600">{result?.exam_session?.title}</p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <p><span className="font-semibold text-slate-600">Student Name:</span> {result?.student?.name}</p>
                            <p><span className="font-semibold text-slate-600">Roll / ID:</span> #{result?.student?.id}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold text-slate-600">Class:</span> {result?.school_class?.name}</p>
                            <p><span className="font-semibold text-slate-600">Position in Class:</span> #{result?.position_in_class}</p>
                        </div>
                    </div>

                    {/* Subjects Marks Breakdown Table */}
                    <table className="min-w-full border-collapse border border-slate-300 text-sm mb-6">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-slate-300 px-4 py-2 text-left">Subject</th>
                                <th className="border border-slate-300 px-4 py-2 text-center">Total Marks</th>
                                <th className="border border-slate-300 px-4 py-2 text-center">Obtained Marks</th>
                                <th className="border border-slate-300 px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectMarks?.map((sm) => (
                                <tr key={sm.id}>
                                    <td className="border border-slate-300 px-4 py-2 font-medium">{sm.subject?.subject_name}</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center">{sm.total_marks}</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center">
                                        {sm.is_absent ? <span className="text-red-500 font-bold">ABSENT</span> : sm.obtained_marks}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2 text-center">
                                        {sm.is_absent ? 'Fail' : sm.obtained_marks >= 33 ? 'Pass' : 'Fail'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border rounded-md text-center text-sm font-semibold mb-8">
                        <div>
                            <span className="block text-xs uppercase text-slate-500">Total Marks</span>
                            <span className="text-lg text-slate-800">{result?.total_obtained_marks} / {result?.total_max_marks}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-slate-500">Percentage</span>
                            <span className="text-lg text-slate-800">{result?.percentage}%</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase text-slate-500">Grade / Status</span>
                            <span className={`text-lg uppercase ${result?.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                                {result?.grade} ({result?.status})
                            </span>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end pt-12 text-xs text-slate-500">
                        <div className="border-t border-slate-400 pt-1 w-32 text-center">Class Teacher</div>
                        <div className="border-t border-slate-400 pt-1 w-32 text-center">Controller Exam</div>
                        <div className="border-t border-slate-400 pt-1 w-32 text-center">Principal</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}