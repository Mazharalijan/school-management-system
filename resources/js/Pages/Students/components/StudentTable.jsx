import React from 'react';
import DataTable from '@/components/DataTable';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination'; // Adjust path if needed
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
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
            className: 'font-mono font-bold text-foreground',
        },
        {
            header: 'Student Name',
            render: (student) => (
                <div className="flex items-center gap-3">
                    <ProfileAvatar
                        src={student.photo_url}
                        name={`${student.first_name} ${student.last_name}`}
                        className="w-9 h-9"
                        iconClassName="w-4 h-4"
                    />
                    <div>
                        <div className="font-semibold text-foreground">
                            {student.first_name} {student.last_name}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                            {student.gender} | DOB: {student.date_of_birth}
                        </span>
                    </div>
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
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {classInfo.name}
                        </Badge>
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            Sec {sectionInfo?.name || 'N/A'}
                        </Badge>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                );
            },
        },
        {
            header: 'Guardian Info',
            render: (student) => (
                <div>
                    <div className="text-xs font-medium text-foreground">
                        {student.guardian_name} ({student.guardian_relation})
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-1 mt-0.5">
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
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border-0'
                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 border-0'
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
        <div className="bg-card text-card-foreground rounded-sm shadow-xs border border-border overflow-hidden">
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