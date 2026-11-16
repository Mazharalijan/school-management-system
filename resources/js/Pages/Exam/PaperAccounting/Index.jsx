import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import Pagination from '@/components/Pagination';
import { cn } from '@/lib/utils';
import {
    Coins,
    TrendingUp,
    TrendingDown,
    Receipt,
    Printer,
    Search,
    Trash2,
    Plus,
    Users,
    FileSpreadsheet,
    CheckCircle2,
    Clock,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
} from 'lucide-react';
import GenerateClassPaperFeeModal from './components/GenerateClassPaperFeeModal';
import CollectPaperFeeModal from './components/CollectPaperFeeModal';
import LogPaperExpenseModal from './components/LogPaperExpenseModal';
import PaperFeeReceiptModal from './components/PaperFeeReceiptModal';

export default function ExamPaperAccountingIndex({
    examSessions = [],
    activeSession = null,
    classes = [],
    fees,
    expenses,
    pnl = {},
    filters = {},
    settings = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.active_tab || 'fees');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || 'all');
    const [selectedFeeStatus, setSelectedFeeStatus] = useState(filters.fee_status || 'all');
    const [selectedCategory, setSelectedCategory] = useState(filters.expense_category || 'all');

    // Modals
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [isExpenseOpen, setIsExpenseOpen] = useState(false);
    const [collectFee, setCollectFee] = useState(null);
    const [receiptFee, setReceiptFee] = useState(null);

    const handleSessionChange = (sessionId) => {
        router.get(
            route('exam-paper-accounting.index'),
            { exam_session_id: sessionId, active_tab: activeTab },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (params) => {
        router.get(
            route('exam-paper-accounting.index'),
            {
                exam_session_id: activeSession?.id,
                active_tab: params.active_tab !== undefined ? params.active_tab : activeTab,
                school_class_id: params.school_class_id !== undefined ? params.school_class_id : selectedClass,
                fee_status: params.fee_status !== undefined ? params.fee_status : selectedFeeStatus,
                expense_category: params.expense_category !== undefined ? params.expense_category : selectedCategory,
                search: params.search !== undefined ? params.search : search,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleDeleteExpense = (expense) => {
        if (confirm(`Delete paper expense record "${expense.title}" of Rs. ${expense.amount}?`)) {
            router.delete(route('exam-paper-accounting.expenses.destroy', expense.id), { preserveScroll: true });
        }
    };

    const handleDeleteFee = (fee) => {
        if (confirm(`Remove unpaid paper fee charge for ${fee.student?.full_name || 'the student'}?`)) {
            router.delete(route('exam-paper-accounting.fees.destroy', fee.id), { preserveScroll: true });
        }
    };

    const categoryLabels = {
        printing: 'Printing & Photocopying',
        stationery: 'Answer Sheets & Stationery',
        typing_composing: 'Typing & Composing',
        marking_evaluation: 'Marking Honorarium',
        other: 'Miscellaneous',
    };

    const isProfit = pnl.is_profit;
    const netAmount = Math.abs(pnl.net_profit_loss || 0);

    return (
        <AppLayout>
            <Head title="Exam Paper Money & P&L Module" />

            <div className="space-y-6">
                {/* Header & Term Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                                Exam Paper Money &amp; Profit / Loss Accounting
                            </h1>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                Exam Finance
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Track term exam paper fees charged to students, monitor paper printing &amp; stationery expenditures, and review net exam profit/loss.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Session Switcher */}
                        {examSessions.length > 0 && (
                            <select
                                value={activeSession?.id || ''}
                                onChange={(e) => handleSessionChange(e.target.value)}
                                className="p-2 text-xs font-semibold rounded-lg border border-input bg-card text-foreground shadow-xs"
                            >
                                {examSessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title} ({s.session_year})
                                    </option>
                                ))}
                            </select>
                        )}

                        <Button
                            onClick={() => setIsGenerateOpen(true)}
                            size="sm"
                            variant="secondary"
                            className="text-xs gap-1.5 shadow-xs whitespace-nowrap shrink-0 inline-flex items-center"
                        >
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span>Charge Class</span>
                        </Button>

                        <Button
                            onClick={() => setIsExpenseOpen(true)}
                            size="sm"
                            variant="outline"
                            className="border-border hover:bg-muted text-xs gap-1.5 whitespace-nowrap shrink-0 inline-flex items-center"
                        >
                            <Receipt className="w-3.5 h-3.5 shrink-0" />
                            <span>Log Paper Expense</span>
                        </Button>
                    </div>
                </div>

                {/* 4 P&L Metric Cards for this Exam Term */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Paper Fees Charged */}
                    <Card className="border-border bg-card text-card-foreground shadow-xs relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Paper Fees Charged</span>
                                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <span className="text-xl font-black font-mono text-foreground">
                                    Rs. {Number(pnl.total_charged || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 flex justify-between">
                                <span>{pnl.total_students || 0} Students billed</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{pnl.collection_rate || 0}% rate</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Paper Fees Collected */}
                    <Card className="border-border bg-card text-card-foreground shadow-xs relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Paper Money Collected
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                                    Rs. {Number(pnl.total_collected || 0).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Pending unpaid: Rs. {Number(pnl.total_unpaid || 0).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    {/* 3. Paper Expenses Incurred */}
                    <Card className="border-border bg-card text-card-foreground shadow-xs relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                    Paper Costs Incurred
                                </span>
                                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                    <Receipt className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                                    Rs. {Number(pnl.total_expenses || 0).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {pnl.expenses_count || 0} Bills (Printing, typing, sheets)
                            </p>
                        </CardContent>
                    </Card>

                    {/* 4. Net Paper Profit / Loss */}
                    <Card className={`border-border bg-card text-card-foreground shadow-xs relative overflow-hidden ${
                        isProfit ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-rose-500/30'
                    }`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Net Term Paper Result
                                </span>
                                <Badge className={
                                    isProfit
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]"
                                        : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 text-[10px]"
                                }>
                                    {isProfit ? 'Profit' : 'Loss'} ({pnl.profit_margin || 0}%)
                                </Badge>
                            </div>
                            <div className="mt-2">
                                <span className={`text-xl font-black font-mono ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {isProfit ? '+ Rs. ' : '- Rs. '}
                                    {netAmount.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Integrated into school P&amp;L flow
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-muted p-1 rounded-lg inline-flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('fees');
                            handleFilterChange({ active_tab: 'fees' });
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0",
                            activeTab === 'fees'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>Student Paper Fees ({fees.total || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('expenses');
                            handleFilterChange({ active_tab: 'expenses' });
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0",
                            activeTab === 'expenses'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        <span>Paper Expenses Ledger ({expenses.total || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('pnl_breakdown');
                            handleFilterChange({ active_tab: 'pnl_breakdown' });
                        }}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0",
                            activeTab === 'pnl_breakdown'
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <PieChart className="w-3.5 h-3.5 shrink-0" />
                        <span>Exam P&amp;L Breakdown</span>
                    </button>
                </div>

                {/* TAB 1: STUDENT PAPER FEES */}
                {activeTab === 'fees' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs">
                            <CardContent className="p-3">
                                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search student or roll no..."
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
                                        value={selectedFeeStatus}
                                        onChange={(e) => {
                                            setSelectedFeeStatus(e.target.value);
                                            handleFilterChange({ fee_status: e.target.value });
                                        }}
                                        className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                                    >
                                        <option value="all">All Collection Status</option>
                                        <option value="paid">Paid &amp; Collected</option>
                                        <option value="unpaid">Unpaid / Due</option>
                                    </select>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Fees Table */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                                        <tr>
                                            <th className="p-3">Student</th>
                                            <th className="p-3">Class</th>
                                            <th className="p-3">Particulars</th>
                                            <th className="p-3 text-right">Fee Amount</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3">Receipt / Date</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {fees.data?.length > 0 ? (
                                            fees.data.map((fee) => {
                                                const student = fee.student || {};
                                                const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                                                const isPaid = fee.status === 'paid';

                                                return (
                                                    <tr key={fee.id} className="hover:bg-muted/40 transition-colors">
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
                                                            {fee.school_class?.name || 'N/A'}
                                                        </td>

                                                        <td className="p-3 text-muted-foreground">
                                                            {fee.notes || 'Term Paper Fee'}
                                                        </td>

                                                        <td className="p-3 text-right">
                                                            <span className="font-mono font-bold text-foreground block">
                                                                Rs. {Number(fee.amount).toFixed(2)}
                                                            </span>
                                                            {isPaid && (
                                                                <span className="text-[10px] text-emerald-600 font-mono">
                                                                    Paid: Rs. {Number(fee.paid_amount || fee.amount).toFixed(2)}
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="p-3 text-center">
                                                            {isPaid ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px]">
                                                                    Paid
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 text-[10px]">
                                                                    Unpaid
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        <td className="p-3">
                                                            {fee.receipt_no ? (
                                                                <div>
                                                                    <span className="font-mono font-semibold text-foreground block">
                                                                        {fee.receipt_no}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {fee.paid_date} ({fee.payment_method || 'CASH'})
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="p-3 text-right whitespace-nowrap">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {!isPaid && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setCollectFee(fee)}
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
                                                                        onClick={() => setReceiptFee(fee)}
                                                                        className="h-7 px-2.5 text-xs font-semibold border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                                        title="Print Paper Fee Receipt"
                                                                    >
                                                                        <Printer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                                        <span>Receipt</span>
                                                                    </Button>
                                                                )}

                                                                {!isPaid && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleDeleteFee(fee)}
                                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                                        title="Remove Charge"
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
                                                <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                                                    No student paper fees found for this exam term. Click "Charge Class" to charge students.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination data={fees} />
                        </Card>
                    </div>
                )}

                {/* TAB 2: EXAM PAPER EXPENSES LEDGER */}
                {activeTab === 'expenses' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground">Filter Category:</span>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            handleFilterChange({ expense_category: e.target.value });
                                        }}
                                        className="p-2 text-xs h-9 rounded-md border border-input bg-background text-foreground"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="printing">Printing &amp; Photocopying</option>
                                        <option value="stationery">Answer Sheets &amp; Stationery</option>
                                        <option value="typing_composing">Typing &amp; Composing</option>
                                        <option value="marking_evaluation">Marking Honorarium</option>
                                        <option value="other">Miscellaneous</option>
                                    </select>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={() => setIsExpenseOpen(true)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Paper Expense
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Expenses Table */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Expense Title</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">Vendor / Bill #</th>
                                            <th className="p-3">Paid Via</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {expenses.data?.length > 0 ? (
                                            expenses.data.map((expense) => (
                                                <tr key={expense.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="p-3 font-mono text-muted-foreground">
                                                        {expense.expense_date}
                                                    </td>

                                                    <td className="p-3">
                                                        <span className="font-bold text-foreground block">
                                                            {expense.title}
                                                        </span>
                                                        {expense.notes && (
                                                            <span className="text-[10px] text-muted-foreground italic">
                                                                {expense.notes}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-[10px] font-semibold border-border">
                                                            {categoryLabels[expense.category] || expense.category}
                                                        </Badge>
                                                    </td>

                                                    <td className="p-3 text-muted-foreground">
                                                        <span>{expense.vendor_name || 'Direct'}</span>
                                                        {expense.invoice_bill_no && (
                                                            <span className="text-[10px] font-mono block">
                                                                Bill: {expense.invoice_bill_no}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-3 uppercase font-semibold text-muted-foreground">
                                                        {expense.payment_method || 'CASH'}
                                                    </td>

                                                    <td className="p-3 text-right">
                                                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                                                            Rs. {Number(expense.amount).toFixed(2)}
                                                        </span>
                                                    </td>

                                                    <td className="p-3 text-right whitespace-nowrap">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteExpense(expense)}
                                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                                                    No paper expenses logged yet for this exam session.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination data={expenses} />
                        </Card>
                    </div>
                )}

                {/* TAB 3: TERM P&L BREAKDOWN & AUDITING */}
                {activeTab === 'pnl_breakdown' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Term Financial Reconciliation */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs">
                            <CardHeader className="bg-muted/40 border-b border-border pb-3">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-emerald-500" />
                                    Exam Term Paper Financial Reconciliation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="flex justify-between items-center py-2 border-b border-border">
                                    <span className="text-muted-foreground">Total Paper Fees Billed:</span>
                                    <span className="font-mono font-bold text-foreground">
                                        Rs. {Number(pnl.total_charged || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border text-emerald-600 dark:text-emerald-400">
                                    <span className="font-semibold">Total Paper Fees Collected (Inflow):</span>
                                    <span className="font-mono font-bold text-sm">
                                        + Rs. {Number(pnl.total_collected || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border text-rose-600 dark:text-rose-400">
                                    <span className="font-semibold">Total Paper Expenditures (Outflow):</span>
                                    <span className="font-mono font-bold text-sm">
                                        - Rs. {Number(pnl.total_expenses || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-muted/40 px-3 rounded-lg font-bold text-sm">
                                    <span className="text-foreground">Net Exam Term Paper Margin:</span>
                                    <span className={`font-mono text-base ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isProfit ? '+ Rs. ' : '- Rs. '}
                                        {netAmount.toLocaleString()} ({pnl.profit_margin || 0}%)
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground italic">
                                    * This net figure automatically flows into the school's master Profit &amp; Loss accounts and financial dashboards.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Right: Category Expenditures Breakdown */}
                        <Card className="border-border bg-card text-card-foreground shadow-xs">
                            <CardHeader className="bg-muted/40 border-b border-border pb-3">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-primary" />
                                    Expenses by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {pnl.expenses_by_category?.length > 0 ? (
                                    pnl.expenses_by_category.map((cat, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-semibold text-foreground">
                                                    {categoryLabels[cat.category] || cat.category}
                                                </span>
                                                <span className="font-bold text-foreground font-mono">
                                                    Rs. {Number(cat.total).toLocaleString()} ({cat.percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-rose-500 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground text-center py-8">
                                        No categorized expenses recorded for this exam term.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Modals */}
            <GenerateClassPaperFeeModal
                isOpen={isGenerateOpen}
                onClose={() => setIsGenerateOpen(false)}
                activeSessionId={activeSession?.id}
                classes={classes}
            />

            <LogPaperExpenseModal
                isOpen={isExpenseOpen}
                onClose={() => setIsExpenseOpen(false)}
                activeSessionId={activeSession?.id}
                activeSessionTitle={activeSession?.title}
            />

            {collectFee && (
                <CollectPaperFeeModal
                    isOpen={Boolean(collectFee)}
                    onClose={() => setCollectFee(null)}
                    paperFee={collectFee}
                />
            )}

            {receiptFee && (
                <PaperFeeReceiptModal
                    isOpen={Boolean(receiptFee)}
                    onClose={() => setReceiptFee(null)}
                    paperFee={receiptFee}
                />
            )}
        </AppLayout>
    );
}
