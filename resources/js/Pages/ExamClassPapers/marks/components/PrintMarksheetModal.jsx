// resources/js/Pages/ExamClassPapers/marks/components/PrintMarksheetModal.jsx
import React, { useState } from 'react';
import { Printer, X, UserCheck, GraduationCap, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/ProfileAvatar';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="bg-card text-card-foreground rounded-sm shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-card border-b border-border text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base">Print Award / Marksheet Sheet</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar (Hidden during print) */}
        <div className="p-4 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" /> Assigned Evaluator:
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => onTeacherChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-background text-foreground border border-input rounded-xs outline-hidden focus:ring-1 focus:ring-ring"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.emp_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs font-semibold">
              Cancel
            </Button>
            <Button onClick={handlePrint} className="text-xs font-semibold shadow-sm">
              <Printer className="w-4 h-4 mr-1.5" /> Print Blank Sheet
            </Button>
          </div>
        </div>

        {/* Print Preview Canvas */}
        <div className="p-6 overflow-y-auto flex-1 bg-card text-card-foreground print:bg-white print:text-black print:p-0 print:overflow-visible">
          <div className="border border-border print:border-none p-8 rounded-sm print:p-0">
            
            {/* Header Document Metadata */}
            <div className="text-center pb-4 border-b-2 border-foreground print:border-black mb-6">
              <h2 className="text-xl font-black uppercase tracking-wide">Academic Marks Evaluation Sheet</h2>
              <p className="text-xs font-semibold text-muted-foreground print:text-gray-600 mt-1">{examTerm?.name || 'Term Examination 2026'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold mb-6 text-foreground print:text-black bg-muted/40 p-3 rounded-xs border border-border print:bg-transparent print:border-none">
              <div>
                <p><span className="text-muted-foreground print:text-gray-500">Class & Section:</span> <strong>{classDetails?.name} ({classDetails?.section})</strong></p>
                <p className="mt-1"><span className="text-muted-foreground print:text-gray-500">Total Students:</span> <strong>{students.length}</strong></p>
              </div>
              <div className="text-right">
                <p><span className="text-muted-foreground print:text-gray-500">Evaluator / Teacher:</span> <strong>{currentTeacher?.name || 'Unassigned'}</strong></p>
                <p className="mt-1"><span className="text-muted-foreground print:text-gray-500">Employee ID:</span> <strong>{currentTeacher?.emp_id || 'N/A'}</strong></p>
              </div>
            </div>

            {/* Empty Marksheet Entry Grid for Manual Writing / Printing */}
            <table className="w-full border-collapse border border-border print:border-black text-xs text-left">
              <thead>
                <tr className="bg-muted/60 text-foreground print:bg-gray-100 print:text-black font-bold border-b border-border print:border-black">
                  <th className="border border-border print:border-black py-2.5 px-2 text-center w-12">Roll #</th>
                  <th className="border border-border print:border-black py-2.5 px-3 min-w-[150px]">Student Name</th>
                  {papers.map((paper) => (
                    <th key={paper.id} className="border border-border print:border-black py-2 px-2 text-center min-w-[90px]">
                      <div>{paper.subject_name}</div>
                      <div className="text-[10px] text-muted-foreground print:text-gray-600 font-normal">Max: {paper.total_marks}</div>
                    </th>
                  ))}
                  <th className="border border-border print:border-black py-2.5 px-2 text-center min-w-[80px]">Total</th>
                  <th className="border border-border print:border-black py-2.5 px-2 text-center min-w-[90px]">Signature</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-border print:border-gray-400">
                    <td className="border border-border print:border-black py-3 px-2 text-center font-bold">{student.roll_no}</td>
                    <td className="border border-border print:border-black py-3 px-3 font-semibold">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          src={student.photo_url}
                          name={student.name}
                          size="xs"
                        />
                        <span>{student.name}</span>
                      </div>
                    </td>
                    {papers.map((paper) => (
                      <td key={paper.id} className="border border-border print:border-black py-3 px-2 text-center">
                        {/* Blank entry box for physical writing */}
                      </td>
                    ))}
                    <td className="border border-border print:border-black py-3 px-2"></td>
                    <td className="border border-border print:border-black py-3 px-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="mt-12 pt-6 border-t border-border print:border-gray-300 flex justify-between items-end text-xs font-bold text-foreground print:text-black">
              <div className="text-center">
                <div className="w-40 border-b border-foreground print:border-black mb-1"></div>
                <p>Teacher Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-foreground print:border-black mb-1"></div>
                <p>Exam Controller Signature</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}