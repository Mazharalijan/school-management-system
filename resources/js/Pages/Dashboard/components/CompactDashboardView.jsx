import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import UnpaidStudentsWidget from './UnpaidStudentsWidget';
import {
    DollarSign,
    Users,
    CreditCard,
    Activity,
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Receipt,
    GraduationCap,
    SlidersHorizontal,
    ArrowRight
} from 'lucide-react';

export default function CompactDashboardView({
    stats,
    recentExpenses = [],
    recentFeePayments = [],
    unpaidStudents = [],
    unpaidSummary = {},
    monthlyTrends = [],
    currentPeriod = 'all_time',
    onPeriodChange,
    activeTheme = 'compact',
    onThemeChange,
    formatCurrency,
}) {
    const fin = stats.financials?.selected_period || {};
    const isProfit = fin.is_profit;
    const netAmount = Math.abs(fin.net_profit_loss || 0);

    const periods = [
        { key: 'all_time', label: 'All Time' },
        { key: 'this_year', label: '2026' },
        { key: 'this_month', label: 'Month' },
        { key: 'last_month', label: 'Prev' },
    ];

    return (
        <div className="space-y-4 w-full pb-10 font-sans text-xs">
            {/* Compact Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Executive Summary
                    </h2>
                    <Badge variant={isProfit ? 'default' : 'destructive'} className="text-[10px] px-2 py-0.5">
                        {isProfit ? 'Surplus' : 'Deficit'}: {formatCurrency(netAmount)}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {/* Period Switcher */}
                    <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                        {periods.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => onPeriodChange(p.key)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors ${
                                    currentPeriod === p.key
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Print Summary"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* High Density Metric Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="font-medium text-[11px]">Revenue</span>
                        <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xl font-bold font-mono text-foreground">
                        {formatCurrency(fin.revenue)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        Margin: {fin.margin_percentage || 0}%
                    </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="font-medium text-[11px]">Expenses</span>
                        <Receipt className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                    <div className="text-xl font-bold font-mono text-foreground">
                        {formatCurrency(fin.expenses)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        Ops: {formatCurrency(fin.operating_expenses)}
                    </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="font-medium text-[11px]">Students</span>
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold font-mono text-foreground">
                        {stats.students?.active || 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        {stats.students?.total || 0} enrolled
                    </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span className="font-medium text-[11px]">Staff / Faculty</span>
                        <Activity className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <div className="text-xl font-bold font-mono text-foreground">
                        {stats.staff?.teachers || 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        {stats.academics?.classes || 0} classes
                    </span>
                </div>
            </div>

            {/* Quick Access Action Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                    { title: 'Students', href: '/students', icon: Users },
                    { title: 'Promotion', href: '/students/promotion', icon: TrendingUp },
                    { title: 'Staff', href: '/staff', icon: GraduationCap },
                    { title: 'Fee Invoices', href: '/fees/invoices', icon: CreditCard },
                    { title: 'Expenses', href: `/expenses?preset=${currentPeriod}`, icon: Receipt },
                    { title: 'Settings', href: '/settings', icon: SlidersHorizontal },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="p-2.5 rounded-md border border-border bg-card hover:bg-muted text-center flex items-center justify-center gap-1.5 font-medium text-foreground transition-colors"
                        >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>

            {/* 2-Column Compact Tables: Fee Payments & Expense Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Fee Payments */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                            Recent Collections
                        </span>
                        <Link href="/fees/invoices" className="text-[11px] text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-border/60">
                        {recentFeePayments.length > 0 ? (
                            recentFeePayments.slice(0, 5).map((payment) => (
                                <div key={payment.id} className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ProfileAvatar src={payment.photo_url} name={payment.student_name} size="xs" />
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground truncate">{payment.student_name}</p>
                                            <p className="text-[10px] text-muted-foreground">{payment.receipt_no}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                            +{formatCurrency(payment.amount)}
                                        </span>
                                        <span className="block text-[9px] text-muted-foreground">{payment.date}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground text-[11px]">No recent collections</div>
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Receipt className="h-3.5 w-3.5 text-rose-600" />
                            Recent Disbursements
                        </span>
                        <Link href={`/expenses?preset=${currentPeriod}&tab=expenses`} className="text-[11px] text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-border/60">
                        {recentExpenses.length > 0 ? (
                            recentExpenses.slice(0, 5).map((expense) => (
                                <div key={expense.id} className="p-2.5 px-3 flex items-center justify-between hover:bg-muted/30">
                                    <div className="min-w-0 pr-2">
                                        <p className="font-medium text-foreground truncate">{expense.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{expense.category}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                                            -{formatCurrency(expense.amount)}
                                        </span>
                                        <span className="block text-[9px] text-muted-foreground">{expense.date}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground text-[11px]">No recent disbursements</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Unpaid Student Fee Dues */}
            <UnpaidStudentsWidget
                unpaidStudents={unpaidStudents}
                unpaidSummary={unpaidSummary}
                formatCurrency={formatCurrency}
            />
        </div>
    );
}
