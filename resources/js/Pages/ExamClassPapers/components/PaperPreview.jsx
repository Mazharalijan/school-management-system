import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

export default function PaperPreview({ paper, sections = [], schoolInfo = {} }) {
    const handlePrint = () => {
        window.print();
    };

    // Calculate total paper marks
    const totalMarks = sections.reduce(
        (acc, sec) => acc + (parseFloat(sec.total_marks) || 0),
        0
    ) || paper.total_marks;

    // School defaults with fallback options
    const schoolName = schoolInfo?.name || paper.school_name || 'Excellence Academy';
    const schoolTagline = schoolInfo?.tagline || 'Quality Education for Future Leaders';
    const schoolAddress = schoolInfo?.address || '123 Academic Way, Education District';
    const schoolLogo = schoolInfo?.logo_url || paper.school_logo || null;
    const academicSession = schoolInfo?.academic_session || paper.academic_session || '2026 - 2027';

    return (
        <AppLayout title={`Preview: ${paper.paper_title}`}>
            {/* Embedded Print CSS for Page Margins and Clean Breaks */}
            <style>
                {`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 15mm 15mm 15mm 15mm;
                        }
                        body {
                            background: #ffffff !important;
                            color: #000000 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .page-break-inside-avoid {
                            break-inside: avoid;
                        }
                        .section-break-before {
                            break-before: auto;
                        }
                    }
                `}
            </style>

            {/* Top Navigation & Print Toolbar (Hidden when printing) */}
            <div className="bg-slate-900 text-white py-3 px-6 print:hidden sticky top-0 z-20 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        href={route('exam-class-papers.show', paper.id)}
                        className="inline-flex items-center text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        Back to Paper Editor
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePrint}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Sheet Area */}
            <div className="py-8 bg-slate-200/70 min-h-screen print:bg-white print:py-0">
                <div className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-xl print:shadow-none print:border-none print:max-w-none print:w-full p-8 md:p-12 space-y-6 text-slate-900 font-serif">
                    
                    {/* Header: School Branding */}
                    <div className="border-b-2 border-slate-900 pb-4">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            {/* Logo */}
                            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                {schoolLogo ? (
                                    <img
                                        src={schoolLogo}
                                        alt={schoolName}
                                        className="max-h-20 max-w-20 object-contain"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold font-sans">
                                        LOGO
                                    </div>
                                )}
                            </div>

                            {/* Center Branding Details */}
                            <div className="text-center flex-1 space-y-0.5">
                                <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900 leading-tight">
                                    {schoolName}
                                </h1>
                                {schoolTagline && (
                                    <p className="text-xs font-sans italic text-slate-600">
                                        {schoolTagline}
                                    </p>
                                )}
                                {schoolAddress && (
                                    <p className="text-[11px] font-sans text-slate-500">
                                        {schoolAddress}
                                    </p>
                                )}
                                <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 print:bg-transparent text-[11px] font-sans font-bold uppercase tracking-wider rounded border border-slate-200 print:border-none">
                                    Session: {academicSession}
                                </div>
                            </div>

                            {/* Right Spacer / Additional Badge */}
                            <div className="w-20 text-right font-sans text-[10px] text-slate-400 uppercase hidden sm:block">
                                Confidential
                            </div>
                        </div>

                        {/* Paper Title Header */}
                        <div className="text-center mt-3 pt-2 border-t border-slate-200">
                            <h2 className="text-base font-bold uppercase tracking-wider text-slate-800">
                                {paper.paper_title}
                            </h2>
                        </div>

                        {/* Exam Metadata Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans font-bold pt-3 mt-3 border-t border-slate-900 text-slate-800">
                            <div>Class: <span className="font-semibold">{paper.school_class?.name || paper.school_class?.class_name || 'N/A'}</span></div>
                            <div>Subject: <span className="font-semibold">{paper.subject?.name || paper.subject?.subject_name || 'N/A'}</span></div>
                            <div className="sm:text-center">Time: <span className="font-semibold">{paper.duration_minutes || 180} Mins</span></div>
                            <div className="text-right">Max Marks: <span className="font-semibold">{totalMarks}</span></div>
                        </div>
                    </div>

                    {/* General Instructions Box */}
                    {paper.instructions && (
                        <div className="text-xs font-sans bg-slate-50 print:bg-transparent p-3 rounded border border-slate-200 print:border-slate-400 space-y-1 page-break-inside-avoid">
                            <span className="font-bold underline block uppercase text-[11px] text-slate-800">
                                General Instructions:
                            </span>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {paper.instructions}
                            </p>
                        </div>
                    )}

                    {/* Sections & Questions List */}
                    <div className="space-y-8 pt-2">
                        {sections.map((section, sIdx) => (
                            <div key={section.id || sIdx} className="space-y-4 section-break-before">
                                
                                {/* Section Title Header */}
                                <div className="text-center border-b border-slate-900 pb-1 page-break-inside-avoid">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                                        SECTION - {section.section_name}
                                    </h3>
                                    {section.title && (
                                        <p className="text-xs italic font-normal text-slate-700 mt-0.5">
                                            ({section.title})
                                        </p>
                                    )}
                                </div>

                                {/* Questions Container */}
                                <div className="space-y-5">
                                    {(section.questions || []).map((qItem, qIdx) => {
                                        const q = qItem.question_bank || qItem.questionBank || qItem;
                                        const options = q.options || q.choices || [];

                                        return (
                                            <div 
                                                key={qItem.id || qIdx} 
                                                className="text-sm leading-relaxed space-y-2 page-break-inside-avoid"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold min-w-[24px]">
                                                            Q{qIdx + 1}.
                                                        </span>
                                                        <span className="text-slate-900 font-medium whitespace-pre-line">
                                                            {q.question_text || q.question || 'Question content not found.'}
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-xs whitespace-nowrap font-sans">
                                                        [{qItem.marks || q.marks || 1} {parseFloat(qItem.marks || q.marks || 1) === 1 ? 'Mark' : 'Marks'}]
                                                    </span>
                                                </div>

                                                {/* MCQ Choices */}
                                                {options.length > 0 && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-8 pt-1 font-sans text-xs">
                                                        {options.map((opt, optIdx) => (
                                                            <div key={optIdx} className="flex items-baseline gap-1.5">
                                                                <span className="font-semibold">
                                                                    ({String.fromCharCode(97 + optIdx)})
                                                                </span>
                                                                <span>{opt.option_text || opt.text || opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Paper Footer */}
                    <div className="pt-8 page-break-inside-avoid">
                        <div className="text-center text-xs font-sans font-semibold text-slate-400 border-t border-slate-200 pt-4 uppercase tracking-widest">
                            *** End of Question Paper ***
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-sans text-slate-400 pt-2">
                            <span>{schoolName} &copy; {new Date().getFullYear()}</span>
                            <span>Session {academicSession}</span>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}