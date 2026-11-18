import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, Link } from '@inertiajs/react';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import StudentTable from './components/StudentTable';
import StudentFormModal from './components/StudentFormModal';
import StudentDetailsModal from './components/StudentDetailsModal';
import CollectPaymentModal from '@/Pages/Students/components/CollectPaymentModal';
import { UserPlus, TrendingUp } from 'lucide-react';

export default function StudentIndex({ students, classes, filters }) {
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Search & Filter state initialized from props
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedClassFilter, setSelectedClassFilter] = useState(filters.class_id || '');

    // Ref to skip initial search trigger on mount
    const isFirstRender = useRef(true);

    // Debounced Search logic (300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('students.index'),
                {
                    search: searchQuery,
                    class_id: selectedClassFilter,
                },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Instant Class Filter Handler
    const handleClassChange = (e) => {
        const value = e?.target ? e.target.value : e;
        setSelectedClassFilter(value);

        router.get(
            route('students.index'),
            {
                search: searchQuery,
                class_id: value,
            },
            { preserveState: true, replace: true }
        );
    };

    // Reset Filters Handler
    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedClassFilter('');
        router.get(route('students.index'), {}, { preserveState: true, replace: true });
    };

    // Action Handlers
    const handleOpenAdd = () => {
        setSelectedStudent(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (student) => {
        setSelectedStudent(student);
        setIsFormModalOpen(true);
    };

    const handleViewDetails = (student) => {
        setSelectedStudent(student);
        setIsDetailsModalOpen(true);
    };

    const handleOpenPaymentModal = (student) => {
        setSelectedStudent(student);
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedStudent(null);
    };

    const handleDeleteStudent = (studentId) => {
        if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
            router.delete(route('students.destroy', studentId));
        }
    };

    // Helper: extract section options for selected class
    const selectedClassObj = classes.find((c) => String(c.id) === String(selectedStudent?.current_enrollment?.school_class_id));
    const sections = selectedClassObj ? selectedClassObj.sections : [];

    return (
        <AppLayout title="Student Directory">
            {/* Page Header */}
            <PageHeader
                title="Student Directory"
                subtitle="Manage admissions, student profiles, and class section assignments."
                buttonText="New Admission"
                icon={UserPlus}
                onButtonClick={handleOpenAdd}
            >
                <Link
                    href={route('students.promotion.index')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                    <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Student Promotion</span>
                </Link>
            </PageHeader>

            {/* Single-Row Search & Filter Bar */}
            <FilterBar showReset={searchQuery || selectedClassFilter} onReset={handleResetFilter}>
                <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)}
                    placeholder="Search students..."
                />
                <FilterSelect
                    value={selectedClassFilter}
                    onChange={handleClassChange}
                    options={classes}
                    placeholder="Filter by class..."
                />
            </FilterBar>

            {/* Students Table */}
            <StudentTable
                students={students}
                onViewDetails={handleViewDetails}
                onEdit={handleOpenEdit}
                onCollectFee={handleOpenPaymentModal}
                onDelete={handleDeleteStudent}
            />

            {/* Create / Edit Form Modal */}
            <StudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                student={selectedStudent}
                classes={classes}
                sections={sections}
            />

            {/* Comprehensive Student Details Modal */}
            {selectedStudent && (
                <StudentDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedStudent(null);
                    }}
                    student={selectedStudent}
                />
            )}

            {/* Fee Collection Modal */}
            {selectedStudent && (
                <CollectPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={handleClosePaymentModal}
                    student={selectedStudent}
                />
            )}
        </AppLayout>
    );
}