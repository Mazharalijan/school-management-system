import React, { useState, useMemo, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileAvatar from '@/components/ProfileAvatar';
import Pagination from '@/components/Pagination';
import {
    AlertTriangle,
    CreditCard,
    Search,
    Phone,
    ArrowRight,
    Users,
    Clock,
    FileText,
    ExternalLink,
    Filter
} from 'lucide-react';

export default function UnpaidStudentsWidget({
    unpaidStudents = [],
    unpaidSummary = {},
    formatCurrency,
    variant = 'default', // 'default' (shadcn) or 'academic' (square borders)
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'overdue', 'partially_paid', 'unpaid'
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const totalDefaulters = unpaidSummary.total_defaulters_count || unpaidStudents.length;
    const totalDue = unpaidSummary.total_unpaid_amount || unpaidStudents.reduce((acc, s) => acc + (s.due_amount || 0), 0);
    const totalInvoices = unpaidSummary.total_unpaid_invoices || unpaidStudents.length;

    const filteredStudents = useMemo(() => {
        return unpaidStudents.filter((student) => {
            const matchesSearch =
                student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.guardian_phone.includes(searchTerm);

            if (!matchesSearch) return false;

            if (statusFilter === 'all') return true;
            if (statusFilter === 'overdue') return student.is_overdue || student.status === 'overdue';
            if (statusFilter === 'partially_paid') return student.status === 'partially_paid';
            if (statusFilter === 'unpaid') return student.status === 'unpaid';

            return true;
        });
    }, [unpaidStudents, searchTerm, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredStudents.length / pageSize);
    const paginatedItems = useMemo(() => {
        return filteredStudents.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredStudents, page]);

    const isAcademic = variant === 'academic';

    return (
        <Card className={isAcademic ? 'rounded-none border border-border bg-card shadow-none' : 'border border-border bg-card shadow-xs'}>
            <CardHeader className="pb-4 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 ${isAcademic ? 'rounded-none' : 'rounded-lg'} bg-destructive/10 text-destructive`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <span>Unpaid Student Fees &amp; Defaulters</span>
                                <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 text-xs font-mono">
                                    {totalDefaulters} Students
                                </Badge>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Pending fee invoices with outstanding balances across all classes.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="text-right">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Total Dues
                            </span>
                            <span className="font-mono font-bold text-sm text-destructive block">
                                {formatCurrency(totalDue)}
                            </span>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className={`h-8 text-xs font-semibold ${isAcademic ? 'rounded-none' : 'rounded-lg'}`}
                        >
                            <Link href="/fees/invoices?status=unpaid">
                                <span>All Invoices</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter and Live Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-4 pt-3 border-t border-border">
                    <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by student, class, roll #, phone, or invoice..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-8 h-8 text-xs bg-background ${isAcademic ? 'rounded-none' : 'rounded-md'}`}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                                statusFilter === 'all'
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            } ${isAcademic ? 'rounded-none' : 'rounded-md'}`}
                        >
                            All ({unpaidStudents.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('overdue')}
                            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                                statusFilter === 'overdue'
                                    ? 'bg-destructive text-destructive-foreground font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            } ${isAcademic ? 'rounded-none' : 'rounded-md'}`}
                        >
                            Overdue
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('partially_paid')}
                            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                                statusFilter === 'partially_paid'
                                    ? 'bg-amber-600 text-white font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            } ${isAcademic ? 'rounded-none' : 'rounded-md'}`}
                        >
                            Partial
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {filteredStudents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        {unpaidStudents.length === 0 ? (
                            <p>No unpaid fee records found. All students are clear!</p>
                        ) : (
                            <p>No students match the current search filter.</p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto divide-y divide-border text-xs">
                        {paginatedItems.map((item) => (
                            <div
                                key={item.id}
                                className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                            >
                                {/* Student Info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <ProfileAvatar
                                        src={item.photo_url}
                                        name={item.student_name}
                                        className="w-9 h-9 shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-foreground truncate">
                                                {item.student_name}
                                            </p>
                                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                                                {item.class_name} {item.section_name && `(${item.section_name})`}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                            Adm: {item.admission_number} &bull; Roll: {item.roll_number}
                                        </p>
                                    </div>
                                </div>

                                {/* Invoice & Contact Metadata */}
                                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                                    <div className="text-left sm:text-right">
                                        <div className="flex items-center gap-1.5 justify-start sm:justify-end">
                                            <span className="font-mono text-[11px] text-muted-foreground font-medium">
                                                {item.invoice_no} ({item.month})
                                            </span>
                                            {item.is_overdue ? (
                                                <Badge className="bg-destructive/15 text-destructive border border-destructive/20 text-[10px] py-0 px-1.5">
                                                    Overdue
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground text-[10px] py-0 px-1.5">
                                                    Due {item.due_date}
                                                </Badge>
                                            )}
                                        </div>

                                        {item.guardian_phone && (
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 justify-start sm:justify-end">
                                                <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <a
                                                    href={`tel:${item.guardian_phone}`}
                                                    className="hover:text-primary transition-colors hover:underline font-mono"
                                                    title="Call guardian"
                                                >
                                                    {item.guardian_phone}
                                                </a>
                                                <span className="text-muted-foreground/60">&bull;</span>
                                                <span className="truncate max-w-[100px]">{item.guardian_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount Due & Action */}
                                    <div className="text-right shrink-0">
                                        <span className="font-bold font-mono text-sm text-destructive block">
                                            {formatCurrency(item.due_amount)}
                                        </span>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10 mt-0.5"
                                        >
                                            <Link href={`/fees/invoices/${item.id}`}>
                                                <CreditCard className="w-3 h-3 mr-1" />
                                                <span>Collect</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    total={filteredStudents.length}
                    from={filteredStudents.length > 0 ? (page - 1) * pageSize + 1 : 0}
                    to={Math.min(page * pageSize, filteredStudents.length)}
                    onPageChange={setPage}
                />
            </CardContent>
        </Card>
    );
}
