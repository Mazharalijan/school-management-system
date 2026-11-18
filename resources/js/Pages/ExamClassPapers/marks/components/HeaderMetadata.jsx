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
    <div className="bg-card p-5 rounded-sm border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-card-foreground">
      <div>
        <div className="flex items-center gap-2 text-primary font-extrabold text-xs uppercase tracking-wider">
          <FileSpreadsheet className="w-4 h-4" /> Academic Marks Management
        </div>
        <h2 className="text-xl font-bold text-foreground mt-0.5">
          {classDetails?.name || 'Class'}{classDetails?.section ? ` (${classDetails.section})` : ''} — {examTerm?.name || 'Examination'}
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-xs border border-border text-foreground">
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            Prepared By: <strong className="text-foreground">{teacher.name}</strong> ({teacher.emp_id})
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span>Role: {teacher.designation}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-center">
        {isSubmitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xs text-xs font-bold">
            <Lock className="w-4 h-4 text-emerald-600" /> Submitted & Locked
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xs text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Draft Mode
          </div>
        )}
      </div>
    </div>
  );
}