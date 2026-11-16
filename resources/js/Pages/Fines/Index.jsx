import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import Pagination from '@/components/Pagination';
import PageHeader from '@/components/PageHeader';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Receipt,
    Printer,
    Search,
    Trash2,
    ShieldCheck,
    Plus,
    Filter,
    Coins,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import ImposeFineModal from './components/ImposeFineModal';
import CollectFineModal from './components/CollectFineModal';
import WaiveFineModal from './components/WaiveFineModal';
import FineReceiptModal from './components/FineReceiptModal';

export default function FinesIndex({ fines, classes = [], stats = {}, filters = {}, settings = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || 'all');
    const [selectedType, setSelectedType] = useState(filters.fine_type || 'all');
    const [selectedMode, setSelectedMode] = useState(filters.collection_mode || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // Modals state
    const [isImposeOpen, setIsImposeOpen] = useState(false);
    const [collectFine, setCollectFine] = useState(null);
    const [waiveFine, setWaiveFine] = useState(null);
    const [receiptFine, setReceiptFine] = useState(null);

    const handleFilterChange = (params) => {
        router.get(
            route('fines.index'),
            {
                search: params.search !== undefined ? params.search : search,
                school_class_id: params.school_class_id !== undefined ? params.school_class_id : selectedClass,
                fine_type: params.fine_type !== undefined ? params.fine_type : selectedType,
                collection_mode: params.collection_mode !== undefined ? params.collection_mode : selectedMode,
                status: params.status !== undefined ? params.status : selectedStatus,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleDeleteFine = (fine) => {
        if (confirm(`Are you sure you want to delete this fine record for ${fine.student?.full_name || 'the student'}?`)) {
            router.delete(route('fines.destroy', fine.id), { preserveScroll: true });
        }
    };

    const fineTypeStyles = {
        leave: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        exam: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        test: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
        discipline: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
        other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700',
    };

    const fineTypeLabels = {
        leave: 'Short Leave / Absent',
        exam: 'Exam Penalty',
        test: 'Class Test',
        discipline: 'Discipline & Uniform',
        other: 'General Fine',
    };

    const collectionModeLabels = {
        on_the_spot: 'On The Spot',
        monthly: 'Monthly Fee Invoice',
        year_end: 'Year-End Settlement',
    };

    return (
        <AppLayout>
            <Head title="Student Fines & Penalties" />

            <div className="space-y-6">
                {/* Unified Page Header */}
                <PageHeader
                    title="Student Fines & Disciplinary Ledger"
                    subtitle="Track leave fines, test & exam penalties, manage on-the-spot cash receipts or bundle into monthly fee invoices."
                    buttonText="Impose New Fine"
                    icon={Plus}
                    onButtonClick={() => setIsImposeOpen(true)}
                >
                    {stats.include_in_financial_flow ? (
                        <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            Active in P&amp;L Flow
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Excluded from P&amp;L Flow
                        </Badge>
                    )}
                </PageHeader>

                {/* 4 Top KPI Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border bg-card text-card-foreground shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Total Imposed</span>
                                <AlertCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-black font-mono text-foreground">
                                    Rs. {Number(stats.total_fines_amount || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">{stats.total_fines_count || 0} Fines</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card text-card-foreground shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Collected</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                                    Rs. {Number(stats.total_collected_amount || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Settled</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card text-card-foreground shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Collection</span>
                                <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                                    Rs. {Number(stats.total_pending_amount || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Unpaid</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card text-card-foreground shadow-xs">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Waived / Excused</span>
                                <ShieldCheck className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                                    Rs. {Number(stats.total_waived_amount || 0).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">Excused</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Toolbar */}
                <Card className="border-border bg-card text-card-foreground shadow-xs">
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search student or roll..."
                                    className="pl-8 text-xs h-9"
                                />
                            </div>

                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    handleFilterChange({ school_class_id: e.target.value });
                                }}
                                className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="all">All Classes</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    handleFilterChange({ fine_type: e.target.value });
                                }}
                                className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="all">All Fine Types</option>
                                <option value="leave">Short Leave / Absent</option>
                                <option value="exam">Exam Penalty</option>
                                <option value="test">Class Test Penalty</option>
                                <option value="discipline">Discipline &amp; Uniform</option>
                                <option value="other">General Fine</option>
                            </select>

                            <select
                                value={selectedMode}
                                onChange={(e) => {
                                    setSelectedMode(e.target.value);
                                    handleFilterChange({ collection_mode: e.target.value });
                                }}
                                className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="all">All Collection Modes</option>
                                <option value="on_the_spot">On The Spot</option>
                                <option value="monthly">Monthly Fee Invoice</option>
                                <option value="year_end">Year-End Settlement</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                            >
                                <option value="all">All Statuses</option>
                                <option value="unpaid">Unpaid / Pending</option>
                                <option value="paid">Paid &amp; Settled</option>
                                <option value="waived">Waived</option>
                            </select>
                        </form>
                    </CardContent>
                </Card>

                {/* Fines Ledger Table */}
                <Card className="border-border bg-card text-card-foreground shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                                <tr>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Class</th>
                                    <th className="p-3">Fine Category</th>
                                    <th className="p-3">Collection Mode</th>
                                    <th className="p-3">Reason &amp; Remarks</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3">Receipt / Date</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fines.data?.length > 0 ? (
                                    fines.data.map((fine) => {
                                        const student = fine.student || {};
                                        const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                                        const isPaid = fine.status === 'paid';
                                        const isWaived = fine.status === 'waived';
                                        const isUnpaid = fine.status === 'unpaid';

                                        return (
                                            <tr key={fine.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <ProfileAvatar
                                                            src={student.photo_url || student.photo_path}
                                                            name={studentName}
                                                            className="w-8 h-8 rounded-full border border-border"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-foreground block">
                                                                {studentName}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                Roll: {student.roll_number || 'N/A'} | Adm: {student.admission_number || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-3 font-semibold text-foreground">
                                                    {fine.school_class?.name || 'N/A'}
                                                </td>

                                                <td className="p-3">
                                                    <Badge variant="outline" className={`text-[10px] font-semibold border ${fineTypeStyles[fine.fine_type] || fineTypeStyles.other}`}>
                                                        {fineTypeLabels[fine.fine_type] || fine.fine_type}
                                                    </Badge>
                                                </td>

                                                <td className="p-3">
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {collectionModeLabels[fine.collection_mode] || fine.collection_mode}
                                                    </span>
                                                </td>

                                                <td className="p-3 max-w-[200px]">
                                                    <p className="truncate text-foreground" title={fine.reason}>
                                                        {fine.reason}
                                                    </p>
                                                    {fine.waived_reason && (
                                                        <p className="text-[10px] text-purple-600 dark:text-purple-400 italic truncate" title={fine.waived_reason}>
                                                            Waiver: {fine.waived_reason}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="p-3 text-right">
                                                    <span className="font-mono font-bold text-foreground block">
                                                        Rs. {Number(fine.amount).toFixed(2)}
                                                    </span>
                                                    {isPaid && (
                                                        <span className="text-[10px] text-emerald-600 font-mono">
                                                            Paid: Rs. {Number(fine.paid_amount || fine.amount).toFixed(2)}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-3 text-center">
                                                    {isPaid ? (
                                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]">
                                                            Paid
                                                        </Badge>
                                                    ) : isWaived ? (
                                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 text-[10px]">
                                                            Waived
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-[10px]">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {fine.receipt_no ? (
                                                        <div>
                                                            <span className="font-mono font-semibold text-foreground block">
                                                                {fine.receipt_no}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {fine.paid_date || fine.fine_date}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            Imposed: {fine.fine_date}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {isUnpaid && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setCollectFine(fine)}
                                                                className="h-7 px-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                            >
                                                                <Coins className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Collect</span>
                                                            </Button>
                                                        )}

                                                        {isPaid && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setReceiptFine(fine)}
                                                                className="h-7 px-2.5 text-xs font-semibold border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                                title="Print Fine Receipt"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                                <span>Receipt</span>
                                                            </Button>
                                                        )}

                                                        {isUnpaid && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setWaiveFine(fine)}
                                                                className="h-7 px-2 text-xs font-semibold text-purple-600 dark:text-purple-400 border-border hover:bg-muted inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                                                                title="Waive Fine"
                                                            >
                                                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Waive</span>
                                                            </Button>
                                                        )}

                                                        {(isUnpaid || isWaived) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteFine(fine)}
                                                                className="h-7 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">
                                            No student fines matching the specified filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination data={fines} />
                </Card>
            </div>

            {/* Modals */}
            <ImposeFineModal
                isOpen={isImposeOpen}
                onClose={() => setIsImposeOpen(false)}
                classes={classes}
            />

            {collectFine && (
                <CollectFineModal
                    isOpen={Boolean(collectFine)}
                    onClose={() => setCollectFine(null)}
                    fine={collectFine}
                />
            )}

            {waiveFine && (
                <WaiveFineModal
                    isOpen={Boolean(waiveFine)}
                    onClose={() => setWaiveFine(null)}
                    fine={waiveFine}
                />
            )}

            {receiptFine && (
                <FineReceiptModal
                    isOpen={Boolean(receiptFine)}
                    onClose={() => setReceiptFine(null)}
                    fine={receiptFine}
                />
            )}
        </AppLayout>
    );
}
