import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    GraduationCap, 
    Receipt, 
    TrendingUp, 
    TrendingDown, 
    CreditCard,
    Calendar,
    Layers,
    ArrowRight,
    FileSpreadsheet,
    PieChart,
    Wallet,
    Award,
    Settings,
    Package,
    SlidersHorizontal,
    Activity,
    Clock,
    DollarSign,
    CheckCircle2,
    BookOpen
} from 'lucide-react';

export default function Dashboard({ 
    stats, 
    recentExpenses = [], 
    recentFeePayments = [], 
    monthlyTrends = [], 
    currentPeriod = 'all_time' 
}) {
    const handlePeriodChange = (periodKey) => {
        router.get(
            route('dashboard'),
            { period: periodKey },
            { preserveState: true, replace: true }
        );
    };

    const fin = stats.financials?.selected_period || {};
    const isProfit = fin.is_profit;
    const netAmount = Math.abs(fin.net_profit_loss || 0);

    const periods = [
        { key: 'all_time', label: 'All Time' },
        { key: 'this_year', label: 'This Year (2026)' },
        { key: 'this_month', label: 'This Month' },
        { key: 'last_month', label: 'Last Month' },
    ];

    const maxMonthlyVal = Math.max(
        ...(monthlyTrends?.map((m) => Math.max(m.revenue || 0, m.total_expenses || 0)) || [1]),
        1
    );

    const formatCurrency = (amount) => {
        return `Rs. ${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    // Quick operation navigation modules (tested and fully working)
    const quickOperations = [
        {
            title: 'Student Admissions',
            subtitle: 'Enrollment & profiles',
            href: '/students',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'hover:border-blue-500',
            badge: `${stats.students?.total || 0} enrolled`,
        },
        {
            title: 'Teachers & Faculty',
            subtitle: 'Staff directory & payroll',
            href: '/staff',
            icon: GraduationCap,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            border: 'hover:border-indigo-500',
            badge: `${stats.staff?.teachers || 0} faculty`,
        },
        {
            title: 'Fee Invoices',
            subtitle: 'Challans & collections',
            href: '/fees/invoices',
            icon: CreditCard,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'hover:border-emerald-500',
            badge: 'Billing',
        },
        {
            title: 'Fee Structure',
            subtitle: 'Class fee head setup',
            href: '/fees/structure',
            icon: SlidersHorizontal,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'hover:border-teal-500',
            badge: 'Config',
        },
        {
            title: 'Expenses & P&L',
            subtitle: 'Disbursements & ledger',
            href: `/expenses?preset=${currentPeriod}`,
            icon: Receipt,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'hover:border-rose-500',
            badge: 'Ledger',
        },
        {
            title: 'Class Matrix',
            subtitle: 'Classes & sections setup',
            href: '/classes',
            icon: Layers,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'hover:border-amber-500',
            badge: `${stats.academics?.classes || 0} classes`,
        },
        {
            title: 'Timetable Generator',
            subtitle: 'Weekly periods & breaks',
            href: '/timetable',
            icon: Calendar,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'hover:border-violet-500',
            badge: 'Schedules',
        },
        {
            title: 'Exams & Papers',
            subtitle: 'Exam sessions & printing',
            href: '/exam-class-papers',
            icon: FileSpreadsheet,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            border: 'hover:border-cyan-500',
            badge: 'Examinations',
        },
        {
            title: 'Marks Entry & DMC',
            subtitle: 'Student marks & rankings',
            href: '/marks/entry',
            icon: Award,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'hover:border-purple-500',
            badge: 'Grading',
        },
        {
            title: 'Question Bank',
            subtitle: 'Subjects, chapters & MCQs',
            href: '/question-bank',
            icon: BookOpen,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            border: 'hover:border-sky-500',
            badge: 'Assessment',
        },
        {
            title: 'Assets & Inventory',
            subtitle: 'Stock & staff allocation',
            href: '/inventory',
            icon: Package,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'hover:border-emerald-600',
            badge: 'Supplies',
        },
        {
            title: 'System Settings',
            subtitle: 'School profile & defaults',
            href: '/settings',
            icon: Settings,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            border: 'hover:border-slate-500',
            badge: 'Admin',
        },
    ];

    return (
        <AppLayout title="Executive Dashboard">
            <Head title="Executive Dashboard - School Management System" />

            <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
                {/* Header Strip with Integrated Period Selector (Square / Sharp Design) */}
                <div className="bg-white border border-slate-200 p-5 rounded-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                Institutional Overview
                            </h2>
                            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                SMS Core v2.4
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Real-time metrics for students, faculty, operating expenses, and financial profit &amp; loss.
                        </p>
                    </div>

                    {/* Clean Sharp Period Switcher */}
                    <div className="flex items-center border border-slate-200 bg-slate-50 p-1 rounded-none self-start md:self-auto overflow-x-auto">
                        {periods.map((p) => {
                            const active = currentPeriod === p.key;
                            return (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => handlePeriodChange(p.key)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors whitespace-nowrap ${
                                        active
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4 Core Metric KPI Cards (Clean, Sharp Edges, High Contrast) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Student Counts */}
                    <Card className="rounded-none border border-slate-200 bg-white relative overflow-hidden shadow-none hover:border-slate-400 transition-colors">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Student Body
                                </span>
                                <div className="w-8 h-8 rounded-none bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                                    {stats.students?.total || 0}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                    {stats.students?.active || 0} Active
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>{stats.students?.male || 0} Boys &bull; {stats.students?.female || 0} Girls</span>
                                <Link
                                    href="/students"
                                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                >
                                    <span>Directory</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Teachers & Faculty */}
                    <Card className="rounded-none border border-slate-200 bg-white relative overflow-hidden shadow-none hover:border-slate-400 transition-colors">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Faculty &amp; Staff
                                </span>
                                <div className="w-8 h-8 rounded-none bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                                    {stats.staff?.teachers || 0}
                                </span>
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-200">
                                    {stats.staff?.active || 0} Active
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>{stats.academics?.classes || 0} Classes &bull; {stats.academics?.sections || 0} Sections</span>
                                <Link
                                    href="/staff"
                                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                                >
                                    <span>Staff List</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Total Expenses */}
                    <Card 
                        onClick={() => router.get('/expenses', { preset: currentPeriod, tab: 'expenses' })}
                        className="rounded-none border border-slate-200 bg-white relative overflow-hidden shadow-none hover:border-slate-400 transition-colors cursor-pointer group"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-rose-700 transition-colors">
                                    Total Expenses
                                </span>
                                <div className="w-8 h-8 rounded-none bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                    <Receipt className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                                    {formatCurrency(fin.expenses)}
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span className="truncate">
                                    Ops: {formatCurrency(fin.operating_expenses)}
                                </span>
                                <Link
                                    href={`/expenses?preset=${currentPeriod}&tab=expenses`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors shrink-0"
                                >
                                    <span>Disbursements</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Profit & Loss Status */}
                    <Card 
                        onClick={() => router.get('/expenses', { preset: currentPeriod, tab: 'pnl' })}
                        className="rounded-none border border-slate-200 bg-white relative overflow-hidden shadow-none hover:border-slate-400 transition-colors cursor-pointer group"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                                    Net Profit &amp; Loss
                                </span>
                                <div className={`w-8 h-8 rounded-none border flex items-center justify-center transition-colors ${
                                    isProfit 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' 
                                        : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100'
                                }`}>
                                    {isProfit ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className={`text-2xl font-extrabold font-mono tracking-tight ${
                                    isProfit ? 'text-emerald-700' : 'text-slate-900'
                                }`}>
                                    {formatCurrency(netAmount)}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                    isProfit 
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                        : 'bg-rose-100 text-rose-800 border-rose-300'
                                }`}>
                                    {isProfit ? 'Surplus' : 'Deficit'}
                                </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Revenue: {formatCurrency(fin.revenue)}</span>
                                <Link
                                    href={`/expenses?preset=${currentPeriod}&tab=pnl`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                                >
                                    <span>P&amp;L Ledger</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Operations Station (Sharp Tiles, High Utility) */}
                <div className="bg-white border border-slate-200 p-5 rounded-none">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <span>Core Operations Station</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Direct access to institutional administrative modules.
                            </p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 self-start sm:self-auto">
                            12 Active Modules
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {quickOperations.map((op) => {
                            const Icon = op.icon;
                            return (
                                <Link
                                    key={op.title}
                                    href={op.href}
                                    className={`p-3.5 bg-white border border-slate-200 ${op.border} hover:shadow-xs transition-all group flex flex-col justify-between rounded-none text-left`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`w-8 h-8 ${op.bg} ${op.color} border border-slate-100 flex items-center justify-center rounded-none`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-mono font-medium text-slate-400 px-1.5 py-0.5 bg-slate-50 border border-slate-200/60">
                                                {op.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                            {op.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                            {op.subtitle}
                                        </p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-600">
                                        <span>Open module</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Monthly Trends & Category Allocation Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Monthly Trends Comparison Chart (2 Cols) */}
                    <Card className="lg:col-span-2 rounded-none border border-slate-200 bg-white shadow-none">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-blue-600" />
                                        <span>Monthly Cashflow Comparison (Last 6 Months)</span>
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Revenue collections vs. total operational &amp; payroll disbursements.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-emerald-600 rounded-none" />
                                        <span className="text-slate-600">Revenue</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-rose-600 rounded-none" />
                                        <span className="text-slate-600">Expenses</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {monthlyTrends.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-52 pt-4 pb-2 border-b border-slate-200">
                                        {monthlyTrends.map((m, idx) => {
                                            const revPercent = Math.min(100, Math.round(((m.revenue || 0) / maxMonthlyVal) * 100));
                                            const expPercent = Math.min(100, Math.round(((m.total_expenses || 0) / maxMonthlyVal) * 100));
                                            
                                            return (
                                                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                                                    {/* Tooltip on hover */}
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] rounded-none px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                                                        Rev: {formatCurrency(m.revenue)} | Exp: {formatCurrency(m.total_expenses)}
                                                    </div>

                                                    {/* Dual Bars (Sharp rectangular) */}
                                                    <div className="w-full flex items-end justify-center gap-1 h-full">
                                                        <div 
                                                            style={{ height: `${Math.max(revPercent, 4)}%` }}
                                                            className="w-1/2 max-w-[20px] bg-emerald-600 rounded-none transition-all duration-300 hover:brightness-110"
                                                            title={`Revenue: ${formatCurrency(m.revenue)}`}
                                                        />
                                                        <div 
                                                            style={{ height: `${Math.max(expPercent, 4)}%` }}
                                                            className="w-1/2 max-w-[20px] bg-rose-600 rounded-none transition-all duration-300 hover:brightness-110"
                                                            title={`Expenses: ${formatCurrency(m.total_expenses)}`}
                                                        />
                                                    </div>
                                                    
                                                    {/* Month label */}
                                                    <span className="mt-2 text-[10px] sm:text-xs font-semibold text-slate-600 truncate w-full text-center font-mono">
                                                        {m.month?.split(' ')?.[0] || m.month}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Monthly KPI Row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                                        <div className="p-3 bg-slate-50 border border-slate-200">
                                            <span className="text-slate-500 text-[11px] block">Period Total Revenue</span>
                                            <span className="font-bold text-emerald-700 text-sm font-mono mt-0.5 block">
                                                {formatCurrency(fin.revenue)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200">
                                            <span className="text-slate-500 text-[11px] block">Operating Expenses</span>
                                            <span className="font-bold text-slate-800 text-sm font-mono mt-0.5 block">
                                                {formatCurrency(fin.operating_expenses)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200">
                                            <span className="text-slate-500 text-[11px] block">Staff Payroll</span>
                                            <span className="font-bold text-slate-800 text-sm font-mono mt-0.5 block">
                                                {formatCurrency(fin.payroll_expenses)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200">
                                            <span className="text-slate-500 text-[11px] block">Net Period Balance</span>
                                            <span className={`font-bold text-sm font-mono mt-0.5 block ${
                                                isProfit ? 'text-emerald-700' : 'text-rose-600'
                                            }`}>
                                                {isProfit ? '+' : '-'}{formatCurrency(netAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No financial records recorded for this time frame.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Expense Breakdown By Category (1 Col) */}
                    <Card className="rounded-none border border-slate-200 bg-white shadow-none flex flex-col">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-rose-600" />
                                    <span>Operating Allocation</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 bg-slate-100 border border-slate-200">
                                    {stats.financials?.categories_breakdown?.length || 0} categories
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                                {stats.financials?.categories_breakdown?.length > 0 ? (
                                    stats.financials.categories_breakdown.slice(0, 5).map((cat) => (
                                        <div key={cat.id} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-slate-700 truncate pr-2 max-w-[170px]">
                                                    {cat.name}
                                                </span>
                                                <span className="font-mono font-semibold text-slate-900 shrink-0">
                                                    {formatCurrency(cat.total)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-none h-1.5 overflow-hidden flex">
                                                <div 
                                                    className="bg-rose-600 h-1.5 rounded-none transition-all duration-300"
                                                    style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                                <span>{cat.count} vouchers</span>
                                                <span>{cat.percentage}% of ops</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-xs text-slate-400 py-8">
                                        No categorized operating expenses recorded.
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <Link
                                    href={`/expenses?preset=${currentPeriod}&tab=categories`}
                                    className="w-full py-2 px-3 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <span>Manage expense categories</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities: Fee Collections & Expense Disbursements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recent Student Fee Payments */}
                    <Card className="rounded-none border border-slate-200 bg-white shadow-none">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                <span>Recent Student Fee Receipts</span>
                            </CardTitle>
                            <Link
                                href="/fees/invoices"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <span>All invoices</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentFeePayments.length > 0 ? (
                                <div className="divide-y divide-slate-100 text-xs">
                                    {recentFeePayments.map((payment) => (
                                        <div key={payment.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="min-w-0 pr-3">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {payment.student_name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                                    {payment.receipt_no} &bull; {payment.date}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-bold text-emerald-700 font-mono text-sm block">
                                                    +{formatCurrency(payment.amount)}
                                                </span>
                                                <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-200/50">
                                                    {payment.payment_method?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    No fee collections recorded yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Expense Disbursements */}
                    <Card className="rounded-none border border-slate-200 bg-white shadow-none">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-rose-600" />
                                <span>Recent Expense Disbursements</span>
                            </CardTitle>
                            <Link
                                href={`/expenses?preset=${currentPeriod}&tab=expenses`}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                            >
                                <span>Expense log</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentExpenses.length > 0 ? (
                                <div className="divide-y divide-slate-100 text-xs">
                                    {recentExpenses.map((expense) => (
                                        <div key={expense.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="min-w-0 pr-3">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {expense.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    <span className="text-indigo-600 font-medium">{expense.category}</span>
                                                    {' '}&bull; {expense.date}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="font-bold text-rose-600 font-mono text-sm block">
                                                    -{formatCurrency(expense.amount)}
                                                </span>
                                                <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-200/50">
                                                    {expense.payment_method?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-xs text-slate-400">
                                    No recent expenses recorded yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}