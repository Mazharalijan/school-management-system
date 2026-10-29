// resources/js/Pages/ExamClassPapers/marks/components/MarksEntryGrid.jsx
import React, { useState, useMemo } from 'react';
import { Search, Save, Send, CheckCircle, UserX, FileCheck, UserPlus, Printer } from 'lucide-react';

export default function MarksEntryGrid({
  papers,
  studentsData,
  setStudentsData,
  isSubmitted,
  setIsSubmitted,
  onOpenDmc,
  onPrintSheet
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ roll_no: '', name: '' });

  const filteredStudents = useMemo(() => {
    return studentsData.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.roll_no.includes(searchQuery)
    );
  }, [studentsData, searchQuery]);

  const grandTotalMax = useMemo(() => {
    return papers.reduce((sum, p) => sum + p.total_marks, 0);
  }, [papers]);

  const handleMarkChange = (studentId, paperId, value, maxMarks) => {
    if (isSubmitted) return;
    let numVal = value === '' ? '' : Math.max(0, Math.min(Number(value), maxMarks));

    setStudentsData(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            marks: { ...student.marks, [paperId]: numVal }
          };
        }
        return student;
      })
    );
  };

  const handleAbsentToggle = (studentId, paperId) => {
    if (isSubmitted) return;

    setStudentsData(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          const isCurrentlyAbsent = !!student.absent?.[paperId];
          return {
            ...student,
            absent: { ...student.absent, [paperId]: !isCurrentlyAbsent },
            marks: { ...student.marks, [paperId]: !isCurrentlyAbsent ? 0 : '' }
          };
        }
        return student;
      })
    );
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.roll_no || !newStudent.name) return;

    const created = {
      id: Date.now(),
      roll_no: newStudent.roll_no,
      name: newStudent.name,
      marks: {},
      absent: {}
    };

    setStudentsData(prev => [...prev, created]);
    setNewStudent({ roll_no: '', name: '' });
    setShowAddForm(false);
  };

  const calculateStudentTotal = (student) => {
    return papers.reduce((sum, paper) => {
      const isAbsent = student.absent?.[paper.id];
      const val = Number(student.marks?.[paper.id]) || 0;
      return sum + (isAbsent ? 0 : val);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Control Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by Roll Number or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" /> Add Student
          </button>
        </div>
      </div>

      {/* Inline Quick Add Student Form */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Roll No (e.g. 505)"
            value={newStudent.roll_no}
            onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
            className="h-9 px-3 text-xs border border-emerald-300 rounded-lg bg-white font-semibold outline-hidden focus:ring-2 focus:ring-emerald-500"
            required
          />
          <input
            type="text"
            placeholder="Student Name"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            className="h-9 px-3 text-xs border border-emerald-300 rounded-lg bg-white font-semibold flex-1 min-w-[200px] outline-hidden focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all"
          >
            Save Entry
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-4 text-center w-16 border-r border-slate-800">Roll #</th>
                <th className="py-4 px-4 min-w-[180px] border-r border-slate-800">Student Name</th>
                
                {papers.map((paper) => (
                  <th key={paper.id} className="py-3 px-4 text-center min-w-[140px] border-r border-slate-800 bg-slate-800/60">
                    <div className="text-xs font-extrabold text-indigo-200">{paper.subject_name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold normal-case mt-0.5">
                      Max: <span className="text-white font-bold">{paper.total_marks}</span> | Pass: <span className="text-white font-bold">{paper.passing_marks}</span>
                    </div>
                  </th>
                ))}

                <th className="py-4 px-4 text-center min-w-[120px] bg-indigo-950 text-indigo-100 border-r border-slate-800">
                  Total Obtained
                </th>
                <th className="py-4 px-4 text-center w-20 bg-slate-900">DMC</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filteredStudents.map((student) => {
                const totalObtained = calculateStudentTotal(student);
                const percentage = ((totalObtained / grandTotalMax) * 100).toFixed(1);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                      {student.roll_no}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-slate-900 border-r border-slate-200">
                      {student.name}
                    </td>

                    {papers.map((paper) => {
                      const isAbsent = !!student.absent?.[paper.id];
                      const markVal = student.marks?.[paper.id] ?? '';
                      const isFail = !isAbsent && markVal !== '' && Number(markVal) < paper.passing_marks;

                      return (
                        <td key={paper.id} className="py-2 px-3 border-r border-slate-200 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={paper.total_marks}
                              disabled={isSubmitted || isAbsent}
                              value={isAbsent ? '' : markVal}
                              onChange={(e) => handleMarkChange(student.id, paper.id, e.target.value, paper.total_marks)}
                              placeholder={isAbsent ? 'ABS' : '0'}
                              className={`w-16 h-9 text-center text-xs font-extrabold rounded-lg border transition-all outline-hidden ${
                                isAbsent
                                  ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed italic'
                                  : isFail
                                  ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500'
                                  : markVal !== ''
                                  ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 focus:ring-2 focus:ring-indigo-500'
                                  : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500'
                              }`}
                            />
                            <button
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleAbsentToggle(student.id, paper.id)}
                              className={`p-1.5 rounded-md border transition-all ${
                                isAbsent
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-center bg-slate-50/80 border-r border-slate-200">
                      <div className="text-sm font-black text-slate-900">
                        {totalObtained} <span className="text-[10px] font-semibold text-slate-400">/ {grandTotalMax}</span>
                      </div>
                      <div className={`text-[10px] font-bold ${Number(percentage) >= 40 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {percentage}%
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenDmc(student)}
                        className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-bold transition-all"
                        title="View & Print DMC Certificate"
                      >
                        <FileCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Autosave active. All entries checked locally.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitted}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitted(!isSubmitted)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 ${
                isSubmitted ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4" /> {isSubmitted ? 'Unlock Sheet' : 'Submit Sheet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}