import React, { useState, useEffect } from 'react';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet, 
  Award,
  ScanLine,
  Save,
  Send,
  Loader2,
  FileCheck
} from 'lucide-react';

import MarksEntryGrid from './components/MarksEntryGrid';
import OcrScannerModal from './components/OcrScannerModal';
import DmcPrintModal from './components/DmcPrintModal';
import PrintMarksheetModal from './components/PrintMarksheetModal';

export default function Index({
  teacher = { id: 1, name: 'Admin User', emp_id: 'EMP-001', designation: 'Class Teacher' },
  examTerm = { id: 1, name: 'First Term Examination 2026-2027' },
  classDetails = { id: 1, name: 'Grade 1', sections: [] },
  teachers = [],
  papers = [],
  initialStudents = [],
  classes = [],
  sessions = [],
  examSessions = [],
  filters = {},
  isTab = false,
  externalOcrOpen = false,
  onCloseExternalOcr = () => {}
}) {
  // Available Sessions (from either sessions or examSessions prop)
  const availableSessions = sessions.length > 0 ? sessions : examSessions;

  // Active Filter States
  const [activeSessionId, setActiveSessionId] = useState(
    Number(filters.exam_session_id) || examTerm?.id || (availableSessions[0]?.id || 1)
  );
  const [activeClassId, setActiveClassId] = useState(
    Number(filters.school_class_id) || classDetails?.id || (classes[0]?.id || 1)
  );
  const [activeSectionId, setActiveSectionId] = useState(filters.section_id || '');
  const [search, setSearch] = useState(filters.search || '');

  // Local student marks state
  const [studentsData, setStudentsData] = useState(initialStudents);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [selectedDmcStudent, setSelectedDmcStudent] = useState(null);
  const [isPrintMarksheetOpen, setIsPrintMarksheetOpen] = useState(false);
  const [selectedPrintTeacher, setSelectedPrintTeacher] = useState(teacher?.id || 1);

  // Sync state when server props update after navigation
  useEffect(() => {
    setStudentsData(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    if (filters.exam_session_id) setActiveSessionId(Number(filters.exam_session_id));
    if (filters.school_class_id) setActiveClassId(Number(filters.school_class_id));
    if (filters.section_id !== undefined) setActiveSectionId(filters.section_id);
  }, [filters]);

  // Sync external header OCR modal trigger
  useEffect(() => {
    if (externalOcrOpen) {
      setIsOcrOpen(true);
    }
  }, [externalOcrOpen]);

  const handleCloseOcr = () => {
    setIsOcrOpen(false);
    onCloseExternalOcr();
  };

  // Find active class sections
  const activeClassObj = classes.find(c => c.id === activeClassId);
  const activeSections = activeClassObj?.sections || classDetails?.sections || [];

  // Trigger Inertia Visit to load session/class data
  const applyFilters = (newParams = {}) => {
    const targetRoute = isTab ? route('exam-class-papers.index') : route('marks.entry');
    const query = {
      ...(isTab ? { tab: 'marks' } : {}),
      exam_session_id: newParams.exam_session_id !== undefined ? newParams.exam_session_id : activeSessionId,
      school_class_id: newParams.school_class_id !== undefined ? newParams.school_class_id : activeClassId,
      section_id: newParams.section_id !== undefined ? newParams.section_id : activeSectionId,
      search: newParams.search !== undefined ? newParams.search : search,
    };

    router.get(targetRoute, query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const handleSessionChange = (sessionId) => {
    const sId = Number(sessionId);
    setActiveSessionId(sId);
    applyFilters({ exam_session_id: sId });
  };

  const handleClassChange = (classId) => {
    const cId = Number(classId);
    setActiveClassId(cId);
    applyFilters({ school_class_id: cId, section_id: '' });
  };

  const handleSectionChange = (sectionId) => {
    setActiveSectionId(sectionId);
    applyFilters({ section_id: sectionId });
  };

  const handleResetFilter = () => {
    setSearch('');
    setActiveSectionId('');
    applyFilters({ search: '', section_id: '' });
  };

  // Apply OCR scanned data to students
  const handleApplyOcrData = (extractedRows) => {
    setStudentsData(prev => 
      prev.map(student => {
        const match = extractedRows.find(r => String(r.roll_no) === String(student.roll_no));
        if (match) {
          return {
            ...student,
            marks: match.marks || student.marks,
            absent: match.is_absent ? { ...student.absent, 1: true } : student.absent
          };
        }
        return student;
      })
    );
  };

  // Save Marks / Prepare Results to Backend
  const handleSaveMarks = (prepareResults = false) => {
    setIsSaving(true);
    setNotification(null);

    const payload = {
      exam_session_id: activeSessionId,
      school_class_id: activeClassId,
      prepare_results: prepareResults,
      students: studentsData.map(student => {
        const studentMarksArray = papers.map(paper => {
          const key = paper.subject_id || paper.id;
          const isAbsent = Boolean(student.absent?.[key] ?? student.absent?.[paper.id]);
          const markVal = student.marks?.[key] ?? student.marks?.[paper.id];

          return {
            subject_id: paper.subject_id || paper.id,
            obtained_marks: isAbsent ? 0.00 : (markVal === '' || markVal === null ? 0.00 : Number(markVal)),
            total_marks: Number(paper.total_marks) || 100.00,
            is_absent: isAbsent,
            remarks: student.remarks?.[key] || null,
          };
        });

        return {
          student_id: student.id,
          teacher_remarks: student.teacher_remarks || null,
          marks: studentMarksArray,
        };
      }),
    };

    router.post(route('marks.bulk-store'), payload, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSaving(false);
        setNotification({
          type: 'success',
          message: prepareResults 
            ? 'Marks saved and student results & class positions prepared successfully!'
            : 'Marks draft saved successfully.'
        });
      },
      onError: (err) => {
        setIsSaving(false);
        setNotification({
          type: 'error',
          message: 'Error saving marks: ' + (Object.values(err)[0] || 'Please review your input fields.')
        });
      }
    });
  };

  const mainContent = (
    <div className="space-y-6">
      {/* 1. Page Header (Rendered on standalone page) */}
      {!isTab && (
        <PageHeader
          title="Marks & Results Management"
          subtitle="Record subject marks, calculate student percentages & grades, rank positions, and print official DMCs."
          icon={Award}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOcrOpen(true)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9"
            >
              <ScanLine className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Offline OCR Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintMarksheetOpen(true)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Print Marksheet
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSaveMarks(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-500" /> : <Save className="w-3.5 h-3.5 mr-1.5 text-slate-600" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSaveMarks(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold h-9 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 mr-1.5 text-white" />}
              Save & Prepare Results
            </Button>
          </div>
        </PageHeader>
      )}

      {/* 2. Unified FilterBar Matching Students UI */}
      <FilterBar showReset={Boolean(search || activeSectionId)} onReset={handleResetFilter}>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e?.target ? e.target.value : e)}
          placeholder="Filter students in matrix by name or roll no..."
          className="flex-1 min-w-[220px]"
        />

        <FilterSelect
          value={activeSessionId}
          onChange={handleSessionChange}
          options={availableSessions}
          valueKey="id"
          labelKey="title"
          placeholder="Select Exam Session"
          className="w-56 shrink-0"
        />

        <FilterSelect
          value={activeClassId}
          onChange={handleClassChange}
          options={classes}
          valueKey="id"
          labelKey="name"
          placeholder="Select Class"
          className="w-48 shrink-0"
        />

        {activeSections.length > 0 && (
          <FilterSelect
            value={activeSectionId}
            onChange={handleSectionChange}
            options={activeSections}
            valueKey="id"
            labelKey="name"
            placeholder="All Sections"
            className="w-36 shrink-0"
          />
        )}
      </FilterBar>

      {/* 3. Session & Evaluation Context Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Examination Term</span>
              <span className="text-sm font-bold text-slate-800">
                {examTerm?.name} {examTerm?.session_year ? `(${examTerm.session_year})` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Class & Section</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  {classDetails?.name || 'Class'}
                </Badge>
                {activeSectionId ? (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 font-semibold">
                    Sec {activeSections.find(s => String(s.id) === String(activeSectionId))?.name || activeSectionId}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 font-semibold">
                    All Sections
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Students in Matrix</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{initialStudents.length}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Papers Evaluated</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{papers.length} Subjects</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Class Evaluator</span>
              <span className="text-xs font-semibold text-slate-700">{teacher?.name || 'Administrator'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-lg border flex items-center justify-between text-xs font-bold ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 font-mono">×</button>
        </div>
      )}

      {/* 4. Unified Marks Spreadsheet Grid */}
      <MarksEntryGrid
        papers={papers}
        studentsData={studentsData}
        setStudentsData={setStudentsData}
        searchQuery={search}
        isSubmitted={isSubmitted}
        setIsSubmitted={setIsSubmitted}
        onOpenDmc={(student) => setSelectedDmcStudent(student)}
        onSaveDraft={() => handleSaveMarks(false)}
        onPrepareResults={() => handleSaveMarks(true)}
        isSaving={isSaving}
      />

      {/* Modals */}
      <OcrScannerModal
        isOpen={isOcrOpen}
        onClose={handleCloseOcr}
        onApplyOcrData={handleApplyOcrData}
      />

      <DmcPrintModal
        isOpen={Boolean(selectedDmcStudent)}
        onClose={() => setSelectedDmcStudent(null)}
        student={selectedDmcStudent}
        classDetails={classDetails}
        examTerm={examTerm}
        papers={papers}
        teacher={teacher}
      />

      <PrintMarksheetModal
        isOpen={isPrintMarksheetOpen}
        onClose={() => setIsPrintMarksheetOpen(false)}
        classDetails={classDetails}
        examTerm={examTerm}
        papers={papers}
        teachers={teachers.length > 0 ? teachers : [teacher]}
        selectedTeacherId={selectedPrintTeacher}
        onTeacherChange={setSelectedPrintTeacher}
        students={studentsData}
      />
    </div>
  );

  // If rendered as a standalone page via /marks/entry, wrap with AppLayout
  if (!isTab) {
    return (
      <AppLayout title="Student Marks & Results Management">
        <Head title="Exam Marks & Results Management" />
        <div className="space-y-6">
          {mainContent}
        </div>
      </AppLayout>
    );
  }

  // If rendered inside ExamClassPapers/Index tabs, return directly
  return mainContent;
}