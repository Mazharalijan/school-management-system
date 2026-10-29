import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  Plus, 
  FileSpreadsheet, 
  UserCheck, 
  GraduationCap, 
  UserPlus, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

import HeaderMetadata from './components/HeaderMetadata';
import MarksEntryGrid from './components/MarksEntryGrid';
import OcrScannerModal from './components/OcrScannerModal';
import DmcPrintModal from './components/DmcPrintModal';
import PrintMarksheetModal from './components/PrintMarksheetModal';

export default function Index({
  teacher = { id: 104, name: 'Prof. Sarah Jenkins', emp_id: 'T-104', designation: 'Class Teacher' },
  examTerm = { id: 1, name: 'Mid Term Examination 2026' },
  classDetails = { id: 101, name: 'Grade 5', section: 'Section A' },
  teachers = [
    { id: 104, name: 'Prof. Sarah Jenkins', emp_id: 'T-104' },
    { id: 105, name: 'Dr. Robert Ford', emp_id: 'T-105' },
    { id: 106, name: 'Ms. Clara Oswald', emp_id: 'T-106' }
  ],
  papers = [
    { id: 1, subject_name: 'Mathematics', total_marks: 100, passing_marks: 33 },
    { id: 2, subject_name: 'English', total_marks: 100, passing_marks: 33 },
    { id: 3, subject_name: 'General Science', total_marks: 100, passing_marks: 33 },
    { id: 4, subject_name: 'Computer Studies', total_marks: 50, passing_marks: 17 }
  ],
  initialStudents = [
    { id: 1001, roll_no: '501', name: 'Ali Ahmed', marks: { 1: 85, 2: 78, 3: 92, 4: 44 }, absent: { 1: false, 2: false, 3: false, 4: false } },
    { id: 1002, roll_no: '502', name: 'Sara Khan', marks: { 1: 28, 2: 65, 3: 58, 4: 30 }, absent: { 1: false, 2: false, 3: false, 4: false } },
    { id: 1003, roll_no: '503', name: 'Usman Tariq', marks: { 1: 0, 2: 0, 3: 0, 4: 0 }, absent: { 1: true, 2: true, 3: true, 4: true } },
    { id: 1004, roll_no: '504', name: 'Zoya Fatima', marks: { 1: 95, 2: 88, 3: 91, 4: 48 }, absent: { 1: false, 2: false, 3: false, 4: false } }
  ],
  classes = [
    { id: 101, name: 'Grade 5 - Sec A' },
    { id: 102, name: 'Grade 5 - Sec B' },
    { id: 103, name: 'Grade 6 - Sec A' }
  ],
  subjects = [],
  filters = {},
  externalOcrOpen = false,
  onCloseExternalOcr = () => {}
}) {
  const [studentsData, setStudentsData] = useState(initialStudents);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Active Class State
  const [activeClassId, setActiveClassId] = useState(classDetails.id || (classes[0]?.id || ''));

  // Filter States
  const [search, setSearch] = useState(filters.search || '');
  const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');

  // Modals state
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [selectedDmcStudent, setSelectedDmcStudent] = useState(null);
  const [isPrintMarksheetOpen, setIsPrintMarksheetOpen] = useState(false);
  const [selectedPrintTeacher, setSelectedPrintTeacher] = useState(teacher.id);

  // Sync external header OCR modal trigger from Index.jsx
  useEffect(() => {
    if (externalOcrOpen) {
      setIsOcrOpen(true);
    }
  }, [externalOcrOpen]);

  const handleCloseOcr = () => {
    setIsOcrOpen(false);
    onCloseExternalOcr();
  };

  const applyFilters = (newFilters = {}) => {
    router.get(
      route('exam-class-papers.index'),
      {
        tab: 'marks',
        search,
        school_class_id: activeClassId,
        subject_id: selectedSubject,
        ...newFilters,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleClassChange = (classId) => {
    setActiveClassId(classId);
    applyFilters({ school_class_id: classId });
  };

  // Apply OCR scanned data to students
  const handleApplyOcrData = (extractedRows) => {
    setStudentsData(prev => 
      prev.map(student => {
        const match = extractedRows.find(r => r.roll_no === student.roll_no);
        if (match) {
          return {
            ...student,
            marks: match.marks || student.marks,
            absent: match.is_absent ? { 1: true, 2: true, 3: true, 4: true } : student.absent
          };
        }
        return student;
      })
    );
  };

  // Filter students by search term
  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.roll_no.toString().includes(search)
  );

  return (
    <div className="space-y-5">
      {/* 1. Class Selection Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">Select Class Directory:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {classes.map((cls) => {
            const isActive = cls.id === activeClassId;
            return (
              <button
                key={cls.id}
                onClick={() => handleClassChange(cls.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cls.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Header Metadata Summary Banner */}
      <HeaderMetadata
        teacher={teacher}
        examTerm={examTerm}
        classDetails={classDetails}
        isSubmitted={isSubmitted}
      />

      {/* 3. Filter Bar & Quick Print Action */}
      <FilterBar 
        showReset={Boolean(search || selectedSubject)} 
        onReset={() => {
          setSearch('');
          setSelectedSubject('');
          applyFilters({ search: '', subject_id: '' });
        }}
      >
        <SearchInput 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search student by name or roll no..." 
        />
        <FilterSelect 
          value={selectedSubject} 
          onChange={(val) => { setSelectedSubject(val); applyFilters({ subject_id: val }); }} 
          options={subjects} 
          placeholder="Filter Subject" 
          valueKey="id" 
          labelKey="name" 
        />

        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsPrintMarksheetOpen(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Print Blank Marksheet Sheet
          </Button>
        </div>
      </FilterBar>

      {/* 4. Primary Marks Spreadsheet Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <MarksEntryGrid
          papers={papers}
          studentsData={filteredStudents}
          setStudentsData={setStudentsData}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
          onOpenDmc={(student) => setSelectedDmcStudent(student)}
        />
      </div>

      {/* 5. OCR Scanner Modal */}
      <OcrScannerModal
        isOpen={isOcrOpen}
        onClose={handleCloseOcr}
        onApplyOcrData={handleApplyOcrData}
      />

      {/* 6. Printable DMC Certificate Modal */}
      <DmcPrintModal
        isOpen={!!selectedDmcStudent}
        onClose={() => setSelectedDmcStudent(null)}
        student={selectedDmcStudent}
        classDetails={classDetails}
        examTerm={examTerm}
        papers={papers}
        teacher={teacher}
      />

      {/* 7. Printable Blank Marksheet Form Modal */}
      <PrintMarksheetModal
        isOpen={isPrintMarksheetOpen}
        onClose={() => setIsPrintMarksheetOpen(false)}
        classDetails={classDetails}
        examTerm={examTerm}
        papers={papers}
        teachers={teachers}
        selectedTeacherId={selectedPrintTeacher}
        onTeacherChange={setSelectedPrintTeacher}
        students={filteredStudents}
      />
    </div>
  );
}