// resources/js/Pages/ExamClassPapers/marks/components/HeaderMetadata.jsx
import React from 'react';
import { FileSpreadsheet, Lock, AlertCircle, UserCheck } from 'lucide-react';

export default function HeaderMetadata({
  teacher,
  examTerm,
  classDetails,
  isSubmitted,
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
          <FileSpreadsheet className="w-4 h-4" /> Academic Marks Management
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-0.5">
          {classDetails?.name || 'Class'}{classDetails?.section ? ` (${classDetails.section})` : ''} — {examTerm?.name || 'Examination'}
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            Prepared By: <strong className="text-slate-900">{teacher.name}</strong> ({teacher.emp_id})
          </span>
          <span className="text-slate-300">•</span>
          <span>Role: {teacher.designation}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-center">
        {isSubmitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
            <Lock className="w-4 h-4 text-emerald-600" /> Submitted & Locked
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Draft Mode
          </div>
        )}
      </div>
    </div>
  );
}