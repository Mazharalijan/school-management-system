import React, { useState, useMemo } from 'react';
import TableActionButton from '@/components/TableActionButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  Send, 
  CheckCircle, 
  UserX, 
  FileCheck, 
  UserPlus, 
  Award, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';

export default function MarksEntryGrid({
  papers = [],
  studentsData = [],
  setStudentsData,
  searchQuery = '',
  isSubmitted = false,
  setIsSubmitted,
  onOpenDmc,
  onSaveDraft,
  onPrepareResults,
  isSaving = false,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ roll_no: '', name: '' });

  // Grand total of all subject papers
  const grandTotalMax = useMemo(() => {
    return papers.reduce((sum, p) => sum + (Number(p.total_marks) || 100), 0);
  }, [papers]);

  // Live calculation of each student's current total obtained marks
  const getStudentTotal = (student) => {
    return papers.reduce((sum, paper) => {
      const key = paper.subject_id || paper.id;
      const isAbsent = Boolean(student.absent?.[key] ?? student.absent?.[paper.id]);
      if (isAbsent) return sum;
      const val = Number(student.marks?.[key] ?? student.marks?.[paper.id]) || 0;
      return sum + val;
    }, 0);
  };

  // Live ranking map across all students
  const liveRankMap = useMemo(() => {
    const scores = studentsData.map(s => ({
      id: s.id,
      score: getStudentTotal(s),
    }));

    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);

    const rankMap = {};
    scores.forEach((item, index) => {
      rankMap[item.id] = index + 1;
    });

    return rankMap;
  }, [studentsData, papers]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return studentsData;
    const q = searchQuery.toLowerCase();
    return studentsData.filter(s => 
      s.name?.toLowerCase().includes(q) || 
      String(s.roll_no).toLowerCase().includes(q)
    );
  }, [studentsData, searchQuery]);

  const handleMarkChange = (studentId, paperKey, value, maxMarks) => {
    if (isSubmitted) return;
    let numVal = value === '' ? '' : Math.max(0, Math.min(Number(value), maxMarks));

    setStudentsData(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            marks: { ...student.marks, [paperKey]: numVal },
            absent: { ...student.absent, [paperKey]: false },
          };
        }
        return student;
      })
    );
  };

  const handleAbsentToggle = (studentId, paperKey) => {
    if (isSubmitted) return;

    setStudentsData(prev =>
      prev.map(student => {
        if (student.id === studentId) {
          const isCurrentlyAbsent = Boolean(student.absent?.[paperKey]);
          return {
            ...student,
            absent: { ...student.absent, [paperKey]: !isCurrentlyAbsent },
            marks: { ...student.marks, [paperKey]: !isCurrentlyAbsent ? 0 : '' },
          };
        }
        return student;
      })
    );
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return { label: 'A+', variant: 'bg-emerald-100 text-emerald-800' };
    if (percentage >= 80) return { label: 'A', variant: 'bg-emerald-50 text-emerald-700' };
    if (percentage >= 70) return { label: 'B', variant: 'bg-blue-50 text-blue-700' };
    if (percentage >= 60) return { label: 'C', variant: 'bg-amber-50 text-amber-700' };
    if (percentage >= 50) return { label: 'D', variant: 'bg-orange-50 text-orange-700' };
    if (percentage >= 33) return { label: 'E', variant: 'bg-yellow-50 text-yellow-800' };
    return { label: 'F', variant: 'bg-rose-100 text-rose-800' };
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.roll_no || !newStudent.name) return;

    const created = {
      id: Date.now(),
      roll_no: newStudent.roll_no,
      name: newStudent.name,
      marks: {},
      absent: {},
      remarks: {},
    };

    setStudentsData(prev => [...prev, created]);
    setNewStudent({ roll_no: '', name: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Row Action & Count Indicator */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-900">{filteredStudents.length}</span> students across <span className="font-semibold text-slate-900">{papers.length}</span> subject papers
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-8"
        >
          {showAddForm ? (
            <>
              <X className="w-3.5 h-3.5 mr-1" /> Cancel
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Quick Add Student Row
            </>
          )}
        </Button>
      </div>

      {/* Inline Quick Add Student Form */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-3 text-xs">
          <Input
            type="text"
            placeholder="Roll No (e.g. 505)"
            value={newStudent.roll_no}
            onChange={(e) => setNewStudent(prev => ({ ...prev, roll_no: e.target.value }))}
            className="w-36 h-8 text-xs bg-white"
            required
          />
          <Input
            type="text"
            placeholder="Student Full Name"
            value={newStudent.name}
            onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
            className="flex-1 min-w-[200px] h-8 text-xs bg-white"
            required
          />
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs">
            Append to Grid
          </Button>
        </form>
      )}

      {/* Primary Unified Marks Evaluation Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center border-r border-slate-200 w-16 sticky left-0 bg-slate-50 z-10 shadow-xs">
                  Roll #
                </th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[180px] sticky left-16 bg-slate-50 z-10 shadow-xs">
                  Student Name
                </th>

                {/* Subject Columns */}
                {papers.map((paper) => (
                  <th key={paper.subject_id || paper.id} className="py-2.5 px-3 border-r border-slate-200 text-center min-w-[125px]">
                    <div className="font-bold text-slate-800 normal-case text-xs truncate max-w-[130px] mx-auto">
                      {paper.subject_name || paper.name || 'Subject'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Max: {paper.total_marks || 100} • Pass: {paper.passing_marks ?? Math.round((paper.total_marks || 100) * 0.33)}
                    </div>
                  </th>
                ))}

                <th className="py-3 px-3 text-center border-r border-slate-200 bg-slate-100/60 font-bold text-slate-700 min-w-[95px]">
                  Total Obtained
                </th>
                <th className="py-3 px-2 text-center border-r border-slate-200 min-w-[65px]">
                  %age
                </th>
                <th className="py-3 px-2 text-center border-r border-slate-200 min-w-[65px]">
                  Grade
                </th>
                <th className="py-3 px-2 text-center border-r border-slate-200 min-w-[75px]">
                  Result
                </th>
                <th className="py-3 px-2 text-center border-r border-slate-200 min-w-[65px]">
                  Rank
                </th>
                <th className="py-3 px-2 text-center min-w-[60px]">
                  DMC
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={papers.length + 7} className="text-center py-10 text-slate-400">
                    No students match the current filters or no students are enrolled in this class.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const totalObtained = getStudentTotal(student);
                  const percentage = grandTotalMax > 0 
                    ? ((totalObtained / grandTotalMax) * 100).toFixed(1) 
                    : '0.0';
                  const gradeInfo = calculateGrade(Number(percentage));

                  let hasFailedSubject = false;
                  papers.forEach(paper => {
                    const subKey = paper.subject_id || paper.id;
                    const isAbsent = Boolean(student.absent?.[subKey] ?? student.absent?.[paper.id]);
                    const markVal = student.marks?.[subKey] ?? student.marks?.[paper.id];
                    const passThreshold = paper.passing_marks ?? Math.round(paper.total_marks * 0.33);

                    if (isAbsent || (markVal !== '' && Number(markVal) < passThreshold)) {
                      hasFailedSubject = true;
                    }
                  });

                  const isPassed = !hasFailedSubject && Number(percentage) >= 33.00;
                  const position = student.result?.position_in_class || liveRankMap[student.id] || 1;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 bg-white border-r border-slate-200 sticky left-0 z-5 shadow-xs">
                        {student.roll_no}
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200 sticky left-16 bg-white z-5 shadow-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <span className="truncate max-w-[150px] font-medium text-slate-800" title={student.name}>
                            {student.name}
                          </span>
                        </div>
                      </td>

                      {/* Subject Mark Inputs */}
                      {papers.map((paper) => {
                        const subKey = paper.subject_id || paper.id;
                        const isAbsent = Boolean(student.absent?.[subKey] ?? student.absent?.[paper.id]);
                        const markVal = student.marks?.[subKey] ?? student.marks?.[paper.id] ?? '';
                        const passThreshold = paper.passing_marks ?? Math.round(paper.total_marks * 0.33);
                        const isBelowPass = !isAbsent && markVal !== '' && Number(markVal) < passThreshold;

                        return (
                          <td key={subKey} className="py-1.5 px-2 border-r border-slate-200 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={paper.total_marks}
                                step="0.5"
                                disabled={isSubmitted || isAbsent}
                                value={isAbsent ? '' : markVal}
                                onChange={(e) => handleMarkChange(student.id, subKey, e.target.value, paper.total_marks)}
                                placeholder={isAbsent ? 'ABS' : '0'}
                                className={`w-14 h-8 text-center text-xs font-bold rounded border transition-all ${
                                  isAbsent
                                    ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold italic'
                                    : isBelowPass
                                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold focus:ring-1 focus:ring-rose-500'
                                    : markVal !== ''
                                    ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-bold focus:ring-1 focus:ring-blue-500'
                                    : 'bg-white border-slate-200 text-slate-700 focus:ring-1 focus:ring-blue-500'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={isSubmitted}
                                title={isAbsent ? 'Mark Present' : 'Mark Absent'}
                                onClick={() => handleAbsentToggle(student.id, subKey)}
                                className={`p-1 rounded transition-all ${
                                  isAbsent
                                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                                    : 'bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Obtained */}
                      <td className="py-2.5 px-3 text-center bg-slate-50/60 border-r border-slate-200 font-mono">
                        <span className="text-xs font-bold text-slate-900">
                          {totalObtained}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          / {grandTotalMax}
                        </span>
                      </td>

                      {/* Percentage */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">
                        {percentage}%
                      </td>

                      {/* Grade */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200">
                        <Badge className={`${gradeInfo.variant} border-0 text-[10px] font-bold py-0 px-2`}>
                          {gradeInfo.label}
                        </Badge>
                      </td>

                      {/* Pass / Fail Status */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200">
                        <Badge className={
                          isPassed 
                            ? 'bg-emerald-100 text-emerald-800 border-0 text-[10px] font-bold py-0 px-2' 
                            : 'bg-rose-100 text-rose-800 border-0 text-[10px] font-bold py-0 px-2'
                        }>
                          {isPassed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </td>

                      {/* Rank / Position */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200">
                        <Badge variant="outline" className="font-mono text-slate-700 bg-slate-50 text-[10px] font-bold">
                          #{position}
                        </Badge>
                      </td>

                      {/* DMC Certificate Button */}
                      <td className="py-2.5 px-2 text-center">
                        <TableActionButton
                          icon={FileCheck}
                          title="Print DMC Marksheet"
                          variant="primary"
                          onClick={() => onOpenDmc(student)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Unified Footer Matching Students UI */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Automatic position ranking & pass/fail calculations active. Total: <strong>{filteredStudents.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={onSaveDraft}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-8"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-500" /> : <Save className="w-3.5 h-3.5 mr-1.5 text-slate-600" />}
              Save Draft
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={onPrepareResults}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold h-8 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 mr-1.5 text-white" />}
              Save & Prepare Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}