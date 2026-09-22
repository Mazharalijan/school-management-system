import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import TableActionButton from '@/components/TableActionButton';
import SubjectDetailModal from '../SubjectDetailModal';
import { Edit, Eye, Trash2 } from 'lucide-react';

export default function SubjectsTab({ subjects, classes, filters, onEdit }) {
    console.log('SubjectsTab props:', { subjects}); // Debugging line
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [viewingSubject, setViewingSubject] = useState(null);

    const applyFilter = (params) => {
        router.get(
            route('question-bank.index'),
            { tab: 'subjects', search, school_class_id: selectedClass, ...params },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedClass('');
        router.get(route('question-bank.index'), { tab: 'subjects' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            router.delete(route('question-bank.subjects.destroy', id), { preserveScroll: true });
        }
    };

    const columns = [
        { header: 'Subject Name', accessor: 'subject_name', className: 'font-semibold text-slate-800' },
        {
            header: 'Chapters Count',
            align: 'right',
            render: (item) => item.chapters_count ?? (item.chapters ? item.chapters.length : 0),
        },
        {
            header: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end space-x-1">
                    <TableActionButton title="View" icon={Eye} variant="default" onClick={() => setViewingSubject(item)} />
                    <TableActionButton title="Edit" icon={Edit} variant="primary" onClick={() => onEdit(item)} />
                    <TableActionButton title="Delete" icon={Trash2} variant="danger" onClick={() => handleDelete(item.id)} />
                </div>
            ),
        },
    ];

    return (
        <div>
            <FilterBar showReset={Boolean(search || selectedClass)} onReset={handleReset}>
                <SearchInput
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        applyFilter({ search: e.target.value });
                    }}
                    placeholder="Search subjects..."
                />
                <FilterSelect
                    value={selectedClass}
                    onChange={(val) => {
                        setSelectedClass(val);
                        applyFilter({ school_class_id: val });
                    }}
                    options={classes}
                    placeholder="All Classes"
                />
            </FilterBar>

            <DataTable columns={columns} data={subjects} emptyMessage="No subjects found." />
            <Pagination links={subjects.links} className="mt-4" />

            <SubjectDetailModal
                isOpen={Boolean(viewingSubject)}
                onClose={() => setViewingSubject(null)}
                subject={viewingSubject}
            />
        </div>
    );
}