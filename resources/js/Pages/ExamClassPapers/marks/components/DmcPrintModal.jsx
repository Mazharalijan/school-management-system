import React, { useState } from 'react';
import { X, Printer, Award } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DmcPrintModal({ isOpen, onClose, student, classDetails, examTerm, papers, teacher }) {
  if (!isOpen || !student) return null;

  const [printCount, setPrintCount] = useState(1);
  const [copyLabel, setCopyLabel] = useState('ORIGINAL');

  const studentResult = student.result;

  const handlePrint = async () => {
    if (studentResult?.id) {
      try {
        const res = await fetch(`/marks/dmc/${studentResult.id}/print`, {
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
          setPrintCount(data.print_count);
          setCopyLabel(data.copy_label);
        }
      } catch (err) {
        console.error('DMC print log error:', err);
      }
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const totalObtained = papers.reduce((sum, p) => {
    const key = p.subject_id || p.id;
    const isAbsent = !!student.absent?.[key] || !!student.absent?.[p.id];
    if (isAbsent) return sum;
    const val = Number(student.marks?.[key] ?? student.marks?.[p.id] ?? 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const grandTotal = papers.reduce((sum, p) => sum + (Number(p.total_marks) || 100), 0);
  const percentage = grandTotal > 0 ? ((totalObtained / grandTotal) * 100).toFixed(1) : 0;
  
  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    if (pct >= 33) return 'E';
    return 'F';
  };

  const grade = calculateGrade(Number(percentage));

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-sm max-w-3xl w-full border border-border shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card text-foreground">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Official Detailed Marks Certificate (DMC) Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-mono font-bold text-xs px-2.5 py-1",
                printCount === 1
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300"
              )}
            >
              {copyLabel} (Print #{printCount})
            </Badge>
            <button 
              onClick={handlePrint} 
              className="px-3.5 py-1.5 rounded-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Copy
            </button>
            <button onClick={onClose} className="p-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div id="printable-dmc" className="p-8 bg-card text-card-foreground print:bg-white print:text-black font-serif space-y-6 relative">
          {/* Print Copy Stamp */}
          <div className="absolute top-4 right-4 text-right">
            <span className={cn(
              "inline-block px-2.5 py-0.5 font-mono font-bold text-[9px] uppercase tracking-wider border",
              printCount === 1
                ? "border-emerald-600 text-emerald-800 bg-emerald-50"
                : "border-amber-600 text-amber-800 bg-amber-50"
            )}>
              {copyLabel}
            </span>
          </div>
          
          {/* Header */}
          <div className="text-center border-b-2 border-foreground print:border-black pb-4 space-y-1">
            <h2 className="text-lg font-black tracking-wider uppercase font-sans text-primary print:text-indigo-900">ACADEMIC EVALUATION & EXAMINATION BOARD</h2>
            <h3 className="text-sm font-bold text-foreground print:text-black font-sans tracking-wide">DETAILED MARKS CERTIFICATE (DMC)</h3>
            <p className="text-xs font-semibold text-muted-foreground print:text-gray-600 font-sans">{examTerm?.name} {examTerm?.session_year ? `(${examTerm.session_year})` : ''}</p>
          </div>

          {/* Student Profile Info */}
          <div className="flex items-center gap-4 text-xs font-sans border border-border print:border-gray-300 p-3.5 rounded-xs bg-muted/40 print:bg-gray-50">
            <ProfileAvatar
              src={student.photo_url}
              name={student.name}
              className="w-12 h-12 border-2 border-primary/20"
              iconClassName="w-6 h-6"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              <div>
                <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Student Name:</span>
                <strong className="text-foreground print:text-black text-sm">{student.name}</strong>
              </div>
              <div>
                <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Roll Number:</span>
                <strong className="text-foreground print:text-black">{student.roll_no}</strong>
              </div>
              <div>
                <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Class:</span>
                <strong className="text-foreground print:text-black">{classDetails?.name || 'Class'}</strong>
              </div>
              <div>
                <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Class Position:</span>
                <strong className="text-primary print:text-indigo-700 font-black">
                  {studentResult?.position_in_class ? `#${studentResult.position_in_class}` : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <table className="w-full border-collapse text-left font-sans text-xs border border-border print:border-gray-300">
            <thead>
              <tr className="bg-muted/60 text-foreground print:bg-gray-100 print:text-black border-b border-border print:border-gray-300">
                <th className="p-2.5 border-r border-border print:border-gray-300 font-bold uppercase">Subject</th>
                <th className="p-2.5 text-center border-r border-border print:border-gray-300 font-bold uppercase w-24">Max Marks</th>
                <th className="p-2.5 text-center border-r border-border print:border-gray-300 font-bold uppercase w-24">Pass Marks</th>
                <th className="p-2.5 text-center border-r border-border print:border-gray-300 font-bold uppercase w-28">Obtained Marks</th>
                <th className="p-2.5 text-center font-bold uppercase w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border print:divide-gray-200">
              {papers.map((p) => {
                const key = p.subject_id || p.id;
                const isAbsent = !!student.absent?.[key] || !!student.absent?.[p.id];
                const mark = isAbsent ? 'ABS' : (student.marks?.[key] ?? student.marks?.[p.id] ?? 0);
                const passThreshold = p.passing_marks ?? Math.round(p.total_marks * 0.33);
                const isPass = !isAbsent && Number(mark) >= passThreshold;

                return (
                  <tr key={p.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                    <td className="p-2.5 font-bold border-r border-border print:border-gray-300 text-foreground print:text-black">{p.subject_name}</td>
                    <td className="p-2.5 text-center border-r border-border print:border-gray-300 text-muted-foreground print:text-gray-700 font-medium">{p.total_marks}</td>
                    <td className="p-2.5 text-center border-r border-border print:border-gray-300 text-muted-foreground print:text-gray-700 font-medium">{passThreshold}</td>
                    <td className="p-2.5 text-center font-extrabold border-r border-border print:border-gray-300 text-foreground print:text-black">
                      {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : mark}
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
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

          {/* Result Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-foreground text-background dark:bg-muted dark:text-foreground print:bg-gray-900 print:text-white rounded-xs font-sans text-center text-xs">
            <div>
              <span className="block text-[11px] opacity-75">Total Marks</span>
              <strong className="text-base">{totalObtained} / {grandTotal}</strong>
            </div>
            <div>
              <span className="block text-[11px] opacity-75">Percentage</span>
              <strong className="text-base text-primary dark:text-indigo-300 print:text-indigo-300">{percentage}%</strong>
            </div>
            <div>
              <span className="block text-[11px] opacity-75">Grade</span>
              <strong className="text-base text-amber-500 dark:text-amber-300 print:text-amber-300">{grade}</strong>
            </div>
            <div>
              <span className="block text-[11px] opacity-75">Final Status</span>
              <strong className={`text-base uppercase ${Number(percentage) >= 33 ? 'text-emerald-500 dark:text-emerald-400 print:text-emerald-400' : 'text-rose-500 dark:text-rose-400 print:text-rose-400'}`}>
                {Number(percentage) >= 33 ? 'PASSED' : 'FAILED'}
              </strong>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center font-sans text-xs text-foreground print:text-black">
            <div className="border-t border-border print:border-black pt-2">
              <strong>{teacher?.name || 'Class Teacher'}</strong>
              <div className="text-[10px] text-muted-foreground print:text-gray-500">Class Teacher Signature</div>
            </div>
            <div className="border-t border-border print:border-black pt-2">
              <strong>Controller of Examinations</strong>
              <div className="text-[10px] text-muted-foreground print:text-gray-500">Official Stamp & Date</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}