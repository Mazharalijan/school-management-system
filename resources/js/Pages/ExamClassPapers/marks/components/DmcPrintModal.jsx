import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Printer, Award, User, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DmcPrintModal({ isOpen, onClose, student, classDetails, examTerm, papers, teacher }) {
  if (!isOpen || !student) return null;

  const { system_settings: systemSettings = {} } = usePage().props;
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

  const grade = studentResult?.grade || calculateGrade(Number(percentage));
  const studentName = student.name || 'Student';
  const fatherName = student.guardian_name || student.father_name || '-';
  const admissionNo = student.admission_number || student.adm_no || '-';
  const rollNo = student.roll_no || student.roll_number || admissionNo || `#${student.id}`;
  const dob = formatDate(student.date_of_birth);
  const className = `${classDetails?.name || 'Class'}${student.section_name ? ` - ${student.section_name}` : ''}`;
  const studentPhoto = student.photo_url || (student.photo_path ? `/storage/${student.photo_path}` : null);
  const schoolLogo = systemSettings?.logo_url || (systemSettings?.logo_path ? `/storage/${systemSettings.logo_path}` : null);

  const schoolName = systemSettings?.school_name || 'GOVERNMENT PRIMARY SCHOOL';
  const schoolAddress = systemSettings?.address || 'District Charsadda';
  const schoolTagline = systemSettings?.school_tagline || 'Elementary & Secondary Education';
  const sessionTitle = examTerm?.name || 'Annual Examination';
  const sessionYear = examTerm?.session_year || systemSettings?.current_session_year || new Date().getFullYear();

  const totalStudents = student.total_students || 40;
  const position = studentResult?.position_in_class || 'N/A';
  const remarks = studentResult?.teacher_remarks || (Number(percentage) >= 33 ? 'Passed' : 'Failed');

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Dynamic Paper Adjustment & Print Styling */}
      <style>{`
        @page {
          size: auto;
          margin: 6mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-dmc, #printable-dmc * {
            visibility: visible;
          }
          #printable-dmc {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bg-card text-card-foreground rounded-sm max-w-4xl w-full border border-border shadow-2xl overflow-hidden flex flex-col my-4 print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Modal Toolbar (Hidden during print) */}
        <div className="p-3.5 border-b border-border flex items-center justify-between bg-card text-foreground print:hidden">
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
              className="px-3.5 py-1.5 rounded-xs bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Certificate
            </button>
            <button onClick={onClose} className="p-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div id="printable-dmc" className="p-4 sm:p-5 bg-white text-black font-serif relative overflow-hidden print:p-0 print:m-0 print:border-none print:shadow-none">
          
          {/* Framed Container */}
          <div className="border-2 border-black p-4 sm:p-5 relative overflow-hidden">
            
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
                    {systemSettings?.registration_number ? `REG #${systemSettings.registration_number}` : 'KPESED'}
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
                      const isAbsent = !!student.absent?.[key] || !!student.absent?.[p.id];
                      const mark = isAbsent ? 'ABS' : (student.marks?.[key] ?? student.marks?.[p.id] ?? 0);
                      const passThreshold = p.passing_marks ?? Math.round(p.total_marks * 0.33);
                      const isPass = !isAbsent && Number(mark) >= passThreshold;
                      const max = Number(p.total_marks) || 100;
                      const subPercent = isAbsent ? 0 : max > 0 ? ((Number(mark) / max) * 100).toFixed(1) : 0;

                      return (
                        <tr key={p.id} className="border-b border-black text-center font-medium">
                          <td className="border-r border-black py-1 px-1.5 print:py-0.5 font-bold">{index + 1}</td>
                          <td className="border-r border-black py-1 px-2.5 print:py-0.5 text-left font-bold text-[11px] print:text-[10px] truncate max-w-[200px]">
                            {p.subject_name || p.subject?.name || p.name}
                          </td>
                          <td className="border-r border-black py-1 px-2 print:py-0.5 font-semibold font-mono">{max}</td>
                          <td className="border-r border-black py-1 px-2 print:py-0.5 font-black font-mono">
                            {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : mark}
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
                  <span>DMC #{studentResult?.id ? `DMC-${studentResult.id}` : 'DMC-PREVIEW'} • Total Prints: {printCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
