import React from 'react';
import DataTable from '@/components/DataTable';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination'; // Adjust path if needed
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Receipt, Trash2, Phone } from 'lucide-react';

export default function StudentTable({
    students, // Can be paginated object or array
    paginationLinks,
    from,
    to,
    total,
    onViewDetails,
    onEdit,
    onCollectFee,
    onDelete,
}) {
    // Handle both cases: students as paginated object or array
    const data = Array.isArray(students) ? students : students?.data || [];
    const links = paginationLinks || students?.links;
    const metaFrom = from ?? students?.from;
    const metaTo = to ?? students?.to;
    const metaTotal = total ?? students?.total;

    const columns = [
        {
            header: 'Admission No',
            accessor: 'admission_number',
            className: 'font-mono font-bold text-slate-800',
        },
        {
            header: 'Student Name',
            render: (student) => (
                <div>
                    <div className="font-semibold text-slate-800">
                        {student.first_name} {student.last_name}
                    </div>
                    <span className="text-xs text-slate-400 capitalize">
                        {student.gender} | DOB: {student.date_of_birth}
                    </span>
                </div>
            ),
        },
        {
            header: 'Class & Section',
            render: (student) => {
                const classInfo = student.current_enrollment?.school_class;
                const sectionInfo = student.current_enrollment?.section;

                return classInfo ? (
                    <div className="flex items-center space-x-1.5">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {classInfo.name}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">
                            Sec {sectionInfo?.name || 'N/A'}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">Unassigned</span>
                );
            },
        },
        {
            header: 'Guardian Info',
            render: (student) => (
                <div>
                    <div className="text-xs font-medium text-slate-700">
                        {student.guardian_name} ({student.guardian_relation})
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{student.guardian_phone}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            render: (student) => (
                <Badge
                    className={
                        student.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-0'
                    }
                >
                    {student.status}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            align: 'right',
            render: (student) => (
                <div className="flex items-center justify-end space-x-1">
                    <TableActionButton
                        icon={Eye}
                        title="View Details"
                        variant="default"
                        onClick={() => onViewDetails && onViewDetails(student)}
                    />
                    <TableActionButton
                        icon={Pencil}
                        title="Edit Student"
                        variant="primary"
                        onClick={() => onEdit && onEdit(student)}
                    />
                    <TableActionButton
                        icon={Receipt}
                        title="Collect Fee"
                        variant="primary"
                        onClick={() => onCollectFee && onCollectFee(student)}
                    />
                    <TableActionButton
                        icon={Trash2}
                        title="Delete Student"
                        variant="danger"
                        onClick={() => onDelete && onDelete(student.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <DataTable
                columns={columns}
                data={data}
                emptyMessage="No student records found."
            />
            <Pagination
                links={links}
                from={metaFrom}
                to={metaTo}
                total={metaTotal}
            />
        </div>
    );
}