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
import BulkDmcPrintModal from './components/BulkDmcPrintModal';

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
  const [isBulkDmcOpen, setIsBulkDmcOpen] = useState(false);
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
              className="text-xs font-semibold h-9"
            >
              <ScanLine className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Offline OCR Scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintMarksheetOpen(true)}
              className="text-xs font-semibold h-9"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              Print Marksheet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDmcOpen(true)}
              className="text-xs font-semibold h-9"
              title="Bulk Print / Download all DMCs as PDF"
            >
              <Award className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Bulk DMCs
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSaveMarks(false)}
              className="text-xs font-semibold h-9"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-muted-foreground" /> : <Save className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSaveMarks(true)}
              className="text-xs font-semibold h-9 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
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
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Examination Term</span>
              <span className="text-sm font-bold text-foreground">
                {examTerm?.name} {examTerm?.session_year ? `(${examTerm.session_year})` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-border">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Class & Section</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                  {classDetails?.name || 'Class'}
                </Badge>
                {activeSectionId ? (
                  <Badge variant="outline" className="font-semibold">
                    Sec {activeSections.find(s => String(s.id) === String(activeSectionId))?.name || activeSectionId}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground font-semibold">
                    All Sections
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Students in Matrix</span>
              <span className="text-sm font-bold text-foreground font-mono">{initialStudents.length}</span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Papers Evaluated</span>
              <span className="text-sm font-bold text-foreground font-mono">{papers.length} Subjects</span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Class Evaluator</span>
              <span className="text-xs font-semibold text-foreground">{teacher?.name || 'Administrator'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-sm border flex items-center justify-between text-xs font-bold ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-foreground font-mono">×</button>
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

      <BulkDmcPrintModal
        isOpen={isBulkDmcOpen}
        onClose={() => setIsBulkDmcOpen(false)}
        classDetails={classDetails}
        examTerm={examTerm}
        papers={papers}
        students={studentsData}
        teacher={teacher}
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