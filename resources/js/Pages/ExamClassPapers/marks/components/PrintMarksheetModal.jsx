// resources/js/Pages/ExamClassPapers/marks/components/PrintMarksheetModal.jsx
import React, { useState } from 'react';
import { Printer, X, UserCheck, GraduationCap, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintMarksheetModal({
  isOpen,
  onClose,
  classDetails,
  examTerm,
  papers = [],
  teachers = [],
  selectedTeacherId,
  onTeacherChange,
  students = []
}) {
  if (!isOpen) return null;

  const currentTeacher = teachers.find(t => t.id === Number(selectedTeacherId)) || teachers[0] || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Print Award / Marksheet Sheet</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Assigned Evaluator:
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => onTeacherChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.emp_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
              <Printer className="w-4 h-4 mr-1.5" /> Print Blank Sheet
            </Button>
          </div>
        </div>

        {/* Print Preview Canvas */}
        <div className="p-6 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible">
          <div className="border border-slate-300 p-8 rounded-xl print:border-none print:p-0">
            
            {/* Header Document Metadata */}
            <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-wide">Academic Marks Evaluation Sheet</h2>
              <p className="text-xs font-semibold text-slate-600 mt-1">{examTerm?.name || 'Term Examination 2026'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold mb-6 text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent print:border-none">
              <div>
                <p><span className="text-slate-500">Class & Section:</span> <strong>{classDetails?.name} ({classDetails?.section})</strong></p>
                <p className="mt-1"><span className="text-slate-500">Total Students:</span> <strong>{students.length}</strong></p>
              </div>
              <div className="text-right">
                <p><span className="text-slate-500">Evaluator / Teacher:</span> <strong>{currentTeacher?.name || 'Unassigned'}</strong></p>
                <p className="mt-1"><span className="text-slate-500">Employee ID:</span> <strong>{currentTeacher?.emp_id || 'N/A'}</strong></p>
              </div>
            </div>

            {/* Empty Marksheet Entry Grid for Manual Writing / Printing */}
            <table className="w-full border-collapse border border-slate-800 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800">
                  <th className="border border-slate-800 py-2.5 px-2 text-center w-12">Roll #</th>
                  <th className="border border-slate-800 py-2.5 px-3 min-w-[150px]">Student Name</th>
                  {papers.map((paper) => (
                    <th key={paper.id} className="border border-slate-800 py-2 px-2 text-center min-w-[90px]">
                      <div>{paper.subject_name}</div>
                      <div className="text-[10px] text-slate-600 font-normal">Max: {paper.total_marks}</div>
                    </th>
                  ))}
                  <th className="border border-slate-800 py-2.5 px-2 text-center min-w-[80px]">Total</th>
                  <th className="border border-slate-800 py-2.5 px-2 text-center min-w-[90px]">Signature</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-400">
                    <td className="border border-slate-800 py-3 px-2 text-center font-bold">{student.roll_no}</td>
                    <td className="border border-slate-800 py-3 px-3 font-semibold">{student.name}</td>
                    {papers.map((paper) => (
                      <td key={paper.id} className="border border-slate-800 py-3 px-2 text-center">
                        {/* Blank entry box for physical writing */}
                      </td>
                    ))}
                    <td className="border border-slate-800 py-3 px-2"></td>
                    <td className="border border-slate-800 py-3 px-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="mt-12 pt-6 border-t border-slate-300 flex justify-between items-end text-xs font-bold text-slate-800">
              <div className="text-center">
                <div className="w-40 border-b border-slate-800 mb-1"></div>
                <p>Teacher Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-800 mb-1"></div>
                <p>Exam Controller Signature</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}