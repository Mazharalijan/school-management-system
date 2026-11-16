import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import UnpaidStudentsWidget from './UnpaidStudentsWidget';
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
    BookOpen
} from 'lucide-react';

export default function AcademicDashboardView({
    stats,
    recentExpenses = [],
    recentFeePayments = [],
    unpaidStudents = [],
    unpaidSummary = {},
    monthlyTrends = [],
    currentPeriod = 'all_time',
    onPeriodChange,
    activeTheme = 'academic',
    onThemeChange,
    formatCurrency,
}) {
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

    const quickOperations = [
        {
            title: 'Student Admissions',
            subtitle: 'Enrollment & profiles',
            href: '/students',
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            border: 'hover:border-blue-500',
            badge: `${stats.students?.total || 0} enrolled`,
        },
        {
            title: 'Student Promotion',
            subtitle: 'Class batch promotions',
            href: '/students/promotion',
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            border: 'hover:border-emerald-500',
            badge: 'Promotions',
        },
        {
            title: 'Teachers & Faculty',
            subtitle: 'Staff directory & payroll',
            href: '/staff',
            icon: GraduationCap,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            border: 'hover:border-indigo-500',
            badge: `${stats.staff?.teachers || 0} faculty`,
        },
        {
            title: 'Fee Invoices',
            subtitle: 'Challans & collections',
            href: '/fees/invoices',
            icon: CreditCard,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            border: 'hover:border-emerald-500',
            badge: 'Billing',
        },
        {
            title: 'Fee Structure',
            subtitle: 'Class fee head setup',
            href: '/fees/structure',
            icon: SlidersHorizontal,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-950/40',
            border: 'hover:border-teal-500',
            badge: 'Config',
        },
        {
            title: 'Expenses & P&L',
            subtitle: 'Disbursements & ledger',
            href: `/expenses?preset=${currentPeriod}`,
            icon: Receipt,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/40',
            border: 'hover:border-rose-500',
            badge: 'Ledger',
        },
        {
            title: 'Class Matrix',
            subtitle: 'Classes & sections setup',
            href: '/classes',
            icon: Layers,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            border: 'hover:border-amber-500',
            badge: `${stats.academics?.classes || 0} classes`,
        },
        {
            title: 'Timetable Generator',
            subtitle: 'Weekly periods & breaks',
            href: '/timetable',
            icon: Calendar,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
            border: 'hover:border-violet-500',
            badge: 'Schedules',
        },
        {
            title: 'Exams & Papers',
            subtitle: 'Exam sessions & printing',
            href: '/exam-class-papers',
            icon: FileSpreadsheet,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-cyan-50 dark:bg-cyan-950/40',
            border: 'hover:border-cyan-500',
            badge: 'Examinations',
        },
        {
            title: 'Marks Entry & DMC',
            subtitle: 'Student marks & rankings',
            href: '/marks/entry',
            icon: Award,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
            border: 'hover:border-purple-500',
            badge: 'Grading',
        },
        {
            title: 'Question Bank',
            subtitle: 'Subjects, chapters & MCQs',
            href: '/question-bank',
            icon: BookOpen,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-950/40',
            border: 'hover:border-sky-500',
            badge: 'Assessment',
        },
        {
            title: 'System Settings',
            subtitle: 'School profile & defaults',
            href: '/settings',
            icon: Settings,
            color: 'text-slate-700 dark:text-slate-300',
            bg: 'bg-slate-100 dark:bg-slate-800',
            border: 'hover:border-slate-500',
            badge: 'Admin',
        },
    ];

    return (
        <div className="space-y-5 w-full pb-12 font-sans">
            {/* Header Strip with Integrated Period Selector */}
            <div className="bg-card text-card-foreground border border-border p-5 rounded-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            Institutional Operational Overview
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Real-time metrics for students, faculty, operating expenses, and financial profit &amp; loss.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Period Switcher */}
                    <div className="flex items-center border border-border bg-muted/50 p-1 rounded-none self-start md:self-auto overflow-x-auto">
                        {periods.map((p) => {
                            const active = currentPeriod === p.key;
                            return (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => onPeriodChange(p.key)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors whitespace-nowrap ${
                                        active
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 4 Core Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Student Counts */}
                <Card className="rounded-none border border-border bg-card text-card-foreground relative overflow-hidden shadow-none hover:border-muted-foreground/40 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Student Body
                            </span>
                            <div className="w-8 h-8 rounded-none bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">
                                {stats.students?.total || 0}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                                {stats.students?.active || 0} Active
                            </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span>{stats.students?.male || 0} Boys &bull; {stats.students?.female || 0} Girls</span>
                            <Link
                                href="/students"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <span>Directory</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Teachers & Faculty */}
                <Card className="rounded-none border border-border bg-card text-card-foreground relative overflow-hidden shadow-none hover:border-muted-foreground/40 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Faculty &amp; Staff
                            </span>
                            <div className="w-8 h-8 rounded-none bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight">
                                {stats.staff?.teachers || 0}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 border border-indigo-200 dark:border-indigo-800">
                                {stats.staff?.active || 0} Active
                            </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span>{stats.academics?.classes || 0} Classes &bull; {stats.academics?.sections || 0} Sections</span>
                            <Link
                                href="/staff"
                                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <span>Staff List</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Total Expenses */}
                <Card className="rounded-none border border-border bg-card text-card-foreground relative overflow-hidden shadow-none hover:border-muted-foreground/40 transition-colors">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Expenses
                            </span>
                            <div className="w-8 h-8 rounded-none bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-extrabold text-foreground font-mono tracking-tight">
                                {formatCurrency(fin.expenses)}
                            </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate">
                                Ops: {formatCurrency(fin.operating_expenses)}
                            </span>
                            <Link
                                href={`/expenses?preset=${currentPeriod}&tab=expenses`}
                                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 transition-colors shrink-0"
                            >
                                <span>Disbursements</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Profit & Loss Status */}
                <Card className="rounded-none border border-border bg-card text-card-foreground relative overflow-hidden shadow-none hover:border-muted-foreground/40 transition-colors">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Net Profit &amp; Loss
                            </span>
                            <div className={`w-8 h-8 rounded-none border flex items-center justify-center transition-colors ${
                                isProfit
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
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
                                isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                            }`}>
                                {formatCurrency(netAmount)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                isProfit
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            }`}>
                                {isProfit ? 'Surplus' : 'Deficit'}
                            </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span>Revenue: {formatCurrency(fin.revenue)}</span>
                            <Link
                                href={`/expenses?preset=${currentPeriod}&tab=pnl`}
                                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <span>P&amp;L Ledger</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Operations Station (Sharp Tiles) */}
            <div className="bg-card text-card-foreground border border-border p-5 rounded-none">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4 pb-3 border-b border-border">
                    <div>
                        <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <span>Core Operations Station</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Direct access to institutional administrative modules.
                        </p>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground self-start sm:self-auto">
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
                                className={`p-3.5 bg-card hover:bg-accent border border-border ${op.border} hover:shadow-xs transition-all group flex flex-col justify-between rounded-none text-left`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 ${op.bg} ${op.color} border border-border flex items-center justify-center rounded-none`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-mono font-medium text-muted-foreground px-1.5 py-0.5 bg-muted border border-border">
                                            {op.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                                        {op.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                        {op.subtitle}
                                    </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground group-hover:text-primary">
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
                <Card className="lg:col-span-2 rounded-none border border-border bg-card text-card-foreground shadow-none">
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-primary" />
                                    <span>Monthly Cashflow Comparison (Last 6 Months)</span>
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Revenue collections vs. total operational &amp; payroll disbursements.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-emerald-600 rounded-none" />
                                    <span className="text-muted-foreground">Revenue</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-rose-600 rounded-none" />
                                    <span className="text-muted-foreground">Expenses</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {monthlyTrends.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-52 pt-4 pb-2 border-b border-border">
                                    {monthlyTrends.map((m, idx) => {
                                        const revPercent = Math.min(100, Math.round(((m.revenue || 0) / maxMonthlyVal) * 100));
                                        const expPercent = Math.min(100, Math.round(((m.total_expenses || 0) / maxMonthlyVal) * 100));

                                        return (
                                            <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                                                {/* Tooltip on hover */}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-popover border border-border text-popover-foreground text-[10px] rounded-none px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                                                    Rev: {formatCurrency(m.revenue)} | Exp: {formatCurrency(m.total_expenses)}
                                                </div>

                                                {/* Dual Bars */}
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
                                                <span className="mt-2 text-[10px] sm:text-xs font-semibold text-muted-foreground truncate w-full text-center font-mono">
                                                    {m.month?.split(' ')?.[0] || m.month}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Monthly KPI Row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                                    <div className="p-3 bg-muted/40 border border-border">
                                        <span className="text-muted-foreground text-[11px] block">Period Total Revenue</span>
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm font-mono mt-0.5 block">
                                            {formatCurrency(fin.revenue)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/40 border border-border">
                                        <span className="text-muted-foreground text-[11px] block">Operating Expenses</span>
                                        <span className="font-bold text-foreground text-sm font-mono mt-0.5 block">
                                            {formatCurrency(fin.operating_expenses)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/40 border border-border">
                                        <span className="text-muted-foreground text-[11px] block">Staff Payroll</span>
                                        <span className="font-bold text-foreground text-sm font-mono mt-0.5 block">
                                            {formatCurrency(fin.payroll_expenses)}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-muted/40 border border-border">
                                        <span className="text-muted-foreground text-[11px] block">Net Period Balance</span>
                                        <span className={`font-bold text-sm font-mono mt-0.5 block ${isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {isProfit ? '+' : '-'}{formatCurrency(netAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground text-xs">
                                No financial records recorded for this time frame.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Expense Breakdown By Category (1 Col) */}
                <Card className="rounded-none border border-border bg-card text-card-foreground shadow-none flex flex-col">
                    <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <span>Operating Allocation</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono px-2 py-0.5 bg-muted border border-border">
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
                                            <span className="font-medium text-foreground truncate pr-2 max-w-[170px]">
                                                {cat.name}
                                            </span>
                                            <span className="font-mono font-semibold text-foreground shrink-0">
                                                {formatCurrency(cat.total)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-none h-1.5 overflow-hidden flex">
                                            <div
                                                className="bg-rose-600 h-1.5 rounded-none transition-all duration-300"
                                                style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                            <span>{cat.count} vouchers</span>
                                            <span>{cat.percentage}% of ops</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-muted-foreground py-8">
                                    No categorized operating expenses recorded.
                                </p>
                            )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-border">
                            <Link
                                href={`/expenses?preset=${currentPeriod}&tab=categories`}
                                className="w-full py-2 px-3 border border-border rounded-none text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                            >
                                <span>Manage expense categories</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Unpaid Student Fee Dues & Defaulters (Academic Classic Design) */}
            <UnpaidStudentsWidget
                unpaidStudents={unpaidStudents}
                unpaidSummary={unpaidSummary}
                formatCurrency={formatCurrency}
                variant="academic"
            />

            {/* Recent Activities: Fee Collections & Expense Disbursements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Recent Student Fee Payments */}
                <Card className="rounded-none border border-border bg-card text-card-foreground shadow-none">
                    <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Recent Student Fee Receipts</span>
                        </CardTitle>
                        <Link
                            href="/fees/invoices"
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            <span>All invoices</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentFeePayments.length > 0 ? (
                            <div className="divide-y divide-border text-xs">
                                {recentFeePayments.map((payment) => (
                                    <div key={payment.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 pr-3">
                                            <ProfileAvatar
                                                src={payment.photo_url}
                                                name={payment.student_name}
                                                size="sm"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground truncate">
                                                    {payment.student_name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                                    {payment.receipt_no} &bull; {payment.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm block">
                                                +{formatCurrency(payment.amount)}
                                            </span>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-none border border-border">
                                                {payment.payment_method?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs text-muted-foreground">
                                No fee collections recorded yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Expense Disbursements */}
                <Card className="rounded-none border border-border bg-card text-card-foreground shadow-none">
                    <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Recent Expense Disbursements</span>
                        </CardTitle>
                        <Link
                            href={`/expenses?preset=${currentPeriod}&tab=expenses`}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                        >
                            <span>Expense log</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentExpenses.length > 0 ? (
                            <div className="divide-y divide-border text-xs">
                                {recentExpenses.map((expense) => (
                                    <div key={expense.id} className="p-3.5 px-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="min-w-0 pr-3">
                                            <p className="font-semibold text-foreground truncate">
                                                {expense.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                <span className="text-primary font-medium">{expense.category}</span>
                                                {' '}&bull; {expense.date}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm block">
                                                -{formatCurrency(expense.amount)}
                                            </span>
                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-none border border-border">
                                                {expense.payment_method?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs text-muted-foreground">
                                No recent expenses recorded yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
