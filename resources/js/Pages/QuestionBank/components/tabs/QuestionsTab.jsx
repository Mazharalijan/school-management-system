import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import TableActionButton from '@/components/TableActionButton';
import QuestionDetailModal from '../QuestionDetailModal';
import { Edit, Eye, Trash2 } from 'lucide-react';

export default function QuestionsTab({ questions, classes, filters, onEdit }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [viewingQuestion, setViewingQuestion] = useState(null);

    const activeClass = classes.find(c => c.id == selectedClass);
    const availableSubjects = activeClass?.subjects || [];

    const applyFilter = (params) => {
        router.get(
            route('question-bank.index'),
            { tab: 'questions', search, school_class_id: selectedClass, subject_id: selectedSubject, ...params },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedClass('');
        setSelectedSubject('');
        router.get(route('question-bank.index'), { tab: 'questions' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('question-bank.destroy', id), { preserveScroll: true });
        }
    };

    const columns = [
        {
            header: 'Question',
            accessor: 'question',
            render: (item) => (
                <div className="max-w-md truncate font-medium text-slate-800" title={item.question}>
                    {item.question}
                </div>
            ),
        },
        { header: 'Class', render: (item) => item.school_class?.name || '-' },
        { header: 'Subject', render: (item) => item.subject?.subject_name || '-' },
        { header: 'Type', render: (item) => <span className="uppercase text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">{item.question_type}</span> },
        { header: 'Marks', accessor: 'marks', align: 'right' },
        {
            header: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end space-x-1">
                    <TableActionButton title="View" icon={Eye} variant="default" onClick={() => setViewingQuestion(item)} />
                    <TableActionButton title="Edit" icon={Edit} variant="primary" onClick={() => onEdit(item)} />
                    <TableActionButton title="Delete" icon={Trash2} variant="danger" onClick={() => handleDelete(item.id)} />
                </div>
            ),
        },
    ];

    return (
        <div>
            <FilterBar showReset={Boolean(search || selectedClass || selectedSubject)} onReset={handleReset}>
                <SearchInput
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        applyFilter({ search: e.target.value });
                    }}
                    placeholder="Search questions..."
                />
                <FilterSelect
                    value={selectedClass}
                    onChange={(val) => {
                        setSelectedClass(val);
                        setSelectedSubject('');
                        applyFilter({ school_class_id: val, subject_id: '' });
                    }}
                    options={classes}
                    placeholder="All Classes"
                />
                <FilterSelect
                    value={selectedSubject}
                    onChange={(val) => {
                        setSelectedSubject(val);
                        applyFilter({ subject_id: val });
                    }}
                    options={availableSubjects}
                    placeholder="All Subjects"
                    labelKey="subject_name"
                />
            </FilterBar>

            <DataTable columns={columns} data={questions} emptyMessage="No questions found in database." />
            <Pagination links={questions.links} className="mt-4" />

            <QuestionDetailModal
                isOpen={Boolean(viewingQuestion)}
                onClose={() => setViewingQuestion(null)}
                question={viewingQuestion}
            />
        </div>
    );
}