// resources/js/Pages/ExamClassPapers/marks/components/DmcPrintModal.jsx
import React from 'react';
import { X, Printer } from 'lucide-react';

export default function DmcPrintModal({ isOpen, onClose, student, classDetails, examTerm, papers, teacher }) {
  if (!isOpen || !student) return null;

  const totalObtained = papers.reduce((sum, p) => sum + (Number(student.marks?.[p.id]) || 0), 0);
  const grandTotal = papers.reduce((sum, p) => sum + p.total_marks, 0);
  const percentage = ((totalObtained / grandTotal) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <span className="text-xs font-bold">Official DMC Certificate Preview</span>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print DMC
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div id="printable-dmc" className="p-8 bg-white text-slate-900 font-serif space-y-6">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h2 className="text-xl font-black tracking-wider uppercase font-sans">ACADEMIC EVALUATION BOARD</h2>
            <h3 className="text-sm font-bold text-slate-700 font-sans">DETAILED MARKS CERTIFICATE (DMC)</h3>
            <p className="text-xs font-medium text-slate-500 font-sans">{examTerm.name}</p>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans border p-4 rounded-xl bg-slate-50">
            <div>Student Name: <strong className="text-slate-900">{student.name}</strong></div>
            <div>Roll Number: <strong className="text-slate-900">{student.roll_no}</strong></div>
            <div>Class & Section: <strong className="text-slate-900">{classDetails.name} ({classDetails.section})</strong></div>
            <div>Prepared By: <strong className="text-slate-900">{teacher.name} ({teacher.emp_id})</strong></div>
          </div>

          {/* Marks Breakdown Table */}
          <table className="w-full border-collapse text-left font-sans text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300">Subject</th>
                <th className="p-2 text-center border border-slate-300">Max Marks</th>
                <th className="p-2 text-center border border-slate-300">Pass Marks</th>
                <th className="p-2 text-center border border-slate-300">Obtained Marks</th>
                <th className="p-2 text-center border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => {
                const mark = student.marks?.[p.id] ?? 0;
                const isPass = Number(mark) >= p.passing_marks;
                return (
                  <tr key={p.id} className="border border-slate-200">
                    <td className="p-2 font-bold border border-slate-200">{p.subject_name}</td>
                    <td className="p-2 text-center border border-slate-200">{p.total_marks}</td>
                    <td className="p-2 text-center border border-slate-200">{p.passing_marks}</td>
                    <td className="p-2 text-center font-extrabold border border-slate-200">{mark}</td>
                    <td className={`p-2 text-center font-bold border border-slate-200 ${isPass ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isPass ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Result Summary */}
          <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-xl font-sans">
            <div>Total Obtained: <strong>{totalObtained} / {grandTotal}</strong></div>
            <div>Percentage: <strong>{percentage}%</strong></div>
            <div>Final Status: <strong className="text-emerald-400">{Number(percentage) >= 40 ? 'PASSED' : 'RE-APPEAR'}</strong></div>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-12 text-center font-sans text-xs">
            <div className="border-t border-slate-400 pt-2">
              <strong>{teacher.name}</strong>
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