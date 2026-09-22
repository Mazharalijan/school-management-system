import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import TableActionButton from '@/components/TableActionButton';
import TopicDetailModal from '../TopicDetailModal';
import { Edit, Eye, Trash2 } from 'lucide-react';

export default function TopicsTab({ topics, classes, filters, onEdit }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || '');
    const [viewingTopic, setViewingTopic] = useState(null);

    const activeClass = classes.find(c => c.id == selectedClass);
       const rawSubjects = (activeClass?.chapters || [])
        .map(chapter => chapter.subject)
        .filter(Boolean);
    const availableSubjects = Array.from(
        new Map(rawSubjects.map(subj => [subj.id, subj])).values()
    );
    const applyFilter = (params) => {
        router.get(
            route('question-bank.index'),
            { tab: 'topics', search, school_class_id: selectedClass, subject_id: selectedSubject, ...params },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedClass('');
        setSelectedSubject('');
        router.get(route('question-bank.index'), { tab: 'topics' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this topic?')) {
            router.delete(route('question-bank.topics.destroy', id), { preserveScroll: true });
        }
    };

    const columns = [
        { header: 'Topic Name', accessor: 'topic_name', className: 'font-semibold text-slate-800' },
        { header: 'Chapter', render: (item) => item.chapter?.chapter_name || item.chapter?.name || 'N/A' },
        { header: 'Subject', render: (item) => item.chapter?.subject?.subject_name || item.subject?.subject_name || 'N/A' },
        {
            header: 'Actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end space-x-1">
                    <TableActionButton title="View" icon={Eye} variant="default" onClick={() => setViewingTopic(item)} />
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
                    placeholder="Search topics..."
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

            <DataTable columns={columns} data={topics} emptyMessage="No topics found." />
            <Pagination links={topics.links} className="mt-4" />

            <TopicDetailModal
                isOpen={Boolean(viewingTopic)}
                onClose={() => setViewingTopic(null)}
                topic={viewingTopic}
            />
        </div>
    );
}