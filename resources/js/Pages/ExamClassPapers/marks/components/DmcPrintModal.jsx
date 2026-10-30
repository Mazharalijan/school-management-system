// resources/js/Pages/ExamClassPapers/marks/components/DmcPrintModal.jsx
import React from 'react';
import { X, Printer, Award } from 'lucide-react';

export default function DmcPrintModal({ isOpen, onClose, student, classDetails, examTerm, papers, teacher }) {
  if (!isOpen || !student) return null;

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
  const studentResult = student.result;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold">Official Detailed Marks Certificate (DMC) Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print DMC
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div id="printable-dmc" className="p-8 bg-white text-slate-900 font-serif space-y-6">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h2 className="text-lg font-black tracking-wider uppercase font-sans text-indigo-900">ACADEMIC EVALUATION & EXAMINATION BOARD</h2>
            <h3 className="text-sm font-bold text-slate-700 font-sans tracking-wide">DETAILED MARKS CERTIFICATE (DMC)</h3>
            <p className="text-xs font-semibold text-slate-500 font-sans">{examTerm?.name} {examTerm?.session_year ? `(${examTerm.session_year})` : ''}</p>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans border border-slate-200 p-3.5 rounded-xl bg-slate-50">
            <div>
              <span className="block text-slate-500 font-medium text-[11px]">Student Name:</span>
              <strong className="text-slate-900 text-sm">{student.name}</strong>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-[11px]">Roll Number:</span>
              <strong className="text-slate-900">{student.roll_no}</strong>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-[11px]">Class:</span>
              <strong className="text-slate-900">{classDetails?.name || 'Class'}</strong>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-[11px]">Class Position:</span>
              <strong className="text-indigo-700 font-black">
                {studentResult?.position_in_class ? `#${studentResult.position_in_class}` : 'N/A'}
              </strong>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <table className="w-full border-collapse text-left font-sans text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                <th className="p-2.5 border-r border-slate-300 font-bold uppercase">Subject</th>
                <th className="p-2.5 text-center border-r border-slate-300 font-bold uppercase w-24">Max Marks</th>
                <th className="p-2.5 text-center border-r border-slate-300 font-bold uppercase w-24">Pass Marks</th>
                <th className="p-2.5 text-center border-r border-slate-300 font-bold uppercase w-28">Obtained Marks</th>
                <th className="p-2.5 text-center font-bold uppercase w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {papers.map((p) => {
                const key = p.subject_id || p.id;
                const isAbsent = !!student.absent?.[key] || !!student.absent?.[p.id];
                const mark = isAbsent ? 'ABS' : (student.marks?.[key] ?? student.marks?.[p.id] ?? 0);
                const passThreshold = p.passing_marks ?? Math.round(p.total_marks * 0.33);
                const isPass = !isAbsent && Number(mark) >= passThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold border-r border-slate-200 text-slate-800">{p.subject_name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200 text-slate-600 font-medium">{p.total_marks}</td>
                    <td className="p-2.5 text-center border-r border-slate-200 text-slate-600 font-medium">{passThreshold}</td>
                    <td className="p-2.5 text-center font-extrabold border-r border-slate-200 text-slate-900">
                      {isAbsent ? <span className="text-rose-600 font-bold">ABSENT</span> : mark}
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
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

          {/* Result Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl font-sans text-center text-xs">
            <div>
              <span className="block text-[11px] text-slate-400">Total Marks</span>
              <strong className="text-base text-white">{totalObtained} / {grandTotal}</strong>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Percentage</span>
              <strong className="text-base text-indigo-300">{percentage}%</strong>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Grade</span>
              <strong className="text-base text-amber-300">{grade}</strong>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Final Status</span>
              <strong className={`text-base uppercase ${Number(percentage) >= 33 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(percentage) >= 33 ? 'PASSED' : 'FAILED'}
              </strong>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center font-sans text-xs">
            <div className="border-t border-slate-400 pt-2">
              <strong>{teacher?.name || 'Class Teacher'}</strong>
              <div className="text-[10px] text-slate-500">Class Teacher Signature</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <strong>Controller of Examinations</strong>
              <div className="text-[10px] text-slate-500">Official Stamp & Date</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}