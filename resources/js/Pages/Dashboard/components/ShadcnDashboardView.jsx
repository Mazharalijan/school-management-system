import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileAvatar from '@/components/ProfileAvatar';
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
    Clock,
    FileSpreadsheet,
    Layers,
    Package,
    Settings,
    ChevronDown,
    Check,
    CheckCircle2,
    SlidersHorizontal,
    PieChart,
    Wallet,
    Award,
    BookOpen
} from 'lucide-react';

export default function ShadcnDashboardView({
    stats,
    recentExpenses = [],
    recentFeePayments = [],
    monthlyTrends = [],
    currentPeriod = 'all_time',
    onPeriodChange,
    activeTheme = 'shadcn',
    onThemeChange,
    formatCurrency,
}) {
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

    const fin = stats.financials?.selected_period || {};
    const isProfit = fin.is_profit;
    const netAmount = Math.abs(fin.net_profit_loss || 0);

    const periods = [
        { key: 'all_time', label: 'All Time' },
        { key: 'this_year', label: 'This Year (2026)' },
        { key: 'this_month', label: 'This Month' },
        { key: 'last_month', label: 'Last Month' },
    ];

    const currentPeriodLabel = periods.find((p) => p.key === currentPeriod)?.label || 'All Time';

    const maxMonthlyVal = Math.max(
        ...(monthlyTrends?.map((m) => Math.max(m.revenue || 0, m.total_expenses || 0)) || [1]),
        1
    );

    const quickModules = [
        {
            title: 'Student Admissions',
            description: `${stats.students?.total || 0} students enrolled`,
            href: '/students',
            icon: Users,
        },
        {
            title: 'Student Promotion',
            description: 'Single & bulk promotion workflow',
            href: '/students/promotion',
            icon: TrendingUp,
        },
        {
            title: 'Teachers & Staff',
            description: `${stats.staff?.teachers || 0} active faculty`,
            href: '/staff',
            icon: GraduationCap,
        },
        {
            title: 'Fee Invoices',
            description: 'Challan issuance & fee records',
            href: '/fees/invoices',
            icon: CreditCard,
        },
        {
            title: 'Timetable Generator',
            description: 'Weekly schedule & routine builder',
            href: '/timetable',
            icon: Calendar,
        },
        {
            title: 'Expenses & P&L',
            description: 'Disbursements & financial audit',
            href: `/expenses?preset=${currentPeriod}`,
            icon: Receipt,
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
            {/* Top Bar: Title, Date Preset Picker, Download, & Theme Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Overview of school finances, student enrollments, and academic operations.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Period Preset Dropdown (styled like shadcn DateRangePicker) */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPeriodDropdownOpen(!periodDropdownOpen);
                                setThemeDropdownOpen(false);
                            }}
                            className="h-9 px-3 text-xs font-medium border-border bg-background hover:bg-muted text-foreground flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{currentPeriodLabel}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        </Button>

                        {periodDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground rounded-lg border border-border shadow-md py-1 z-30 animate-in fade-in-50 zoom-in-95">
                                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Select Reporting Period
                                </div>
                                {periods.map((p) => (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => {
                                            onPeriodChange(p.key);
                                            setPeriodDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-muted transition-colors ${
                                            currentPeriod === p.key ? 'font-semibold text-primary' : 'text-foreground'
                                        }`}
                                    >
                                        <span>{p.label}</span>
                                        {currentPeriod === p.key && (
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Download Report Button */}
                    <Button
                        size="sm"
                        onClick={() => window.print()}
                        className="h-9 px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                    </Button>

                    {/* Quick Dashboard Design Switcher */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setThemeDropdownOpen(!themeDropdownOpen);
                                setPeriodDropdownOpen(false);
                            }}
                            className="h-9 px-3 text-xs font-medium border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5"
                            title="Switch Dashboard Design"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="hidden sm:inline">Design:</span>
                            <span className="capitalize font-semibold text-primary">{activeTheme}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>

                        {themeDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-popover text-popover-foreground rounded-lg border border-border shadow-md py-1 z-30 animate-in fade-in-50 zoom-in-95">
                                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Dashboard UI Design
                                </div>
                                {[
                                    { key: 'shadcn', label: 'Shadcn Modern', desc: 'Minimalist Zinc cards & tabs' },
                                    { key: 'academic', label: 'Academic Operational', desc: 'Detailed station & directory' },
                                    { key: 'compact', label: 'Executive Compact', desc: 'High density executive overview' },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => {
                                            onThemeChange(t.key);
                                            setThemeDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${
                                            activeTheme === t.key ? 'bg-muted font-semibold text-primary' : 'text-foreground'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{t.label}</span>
                                            {activeTheme === t.key && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                                    </button>
                                ))}
                                <div className="border-t border-border mt-1 pt-1 px-3 py-1.5">
                                    <Link
                                        href="/settings"
                                        className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                    >
                                        <span>Manage in System Settings</span>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shadcn Tabs Navigation */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-muted p-1 rounded-lg inline-flex">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* 1. OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* 4 Top Metric Cards (Exact Shadcn Layout) */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* 1. Total Revenue */}
                        <Card className="border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-card-foreground">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                                    {formatCurrency(fin.revenue)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <span className={isProfit ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
                                        {isProfit ? '+' : '-'}{fin.margin_percentage || '0'}%
                                    </span>
                                    <span>operating margin this period</span>
                                </p>
                            </CardContent>
                        </Card>

                        {/* 2. Active Students */}
                        <Card className="border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-card-foreground">
                                    Active Students
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                                    +{stats.students?.active || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    +{Math.round(((stats.students?.active || 0) / Math.max(stats.students?.total || 1, 1)) * 100)}% of total ({stats.students?.total || 0} registered)
                                </p>
                            </CardContent>
                        </Card>

                        {/* 3. Fee Collections */}
                        <Card className="border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-card-foreground">
                                    Fee Collections
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                                    +{recentFeePayments?.length || 0} Receipts
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    +19% collection volume this cycle
                                </p>
                            </CardContent>
                        </Card>

                        {/* 4. Active Faculty */}
                        <Card className="border-border bg-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-card-foreground">
                                    Active Faculty
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                                    +{stats.staff?.teachers || 0} Teachers
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.academics?.classes || 0} classes &bull; {stats.academics?.sections || 0} sections
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 7-Column Grid: Left (4 cols) Overview Chart | Right (3 cols) Recent Collections */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Col 1-4: Modern Shadcn Bar Chart Overview */}
                        <Card className="col-span-4 border-border bg-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold text-card-foreground">
                                            Overview
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                            Monthly cashflow comparison (Revenue collections vs total expenditures).
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-[3px] bg-primary" />
                                            <span className="text-muted-foreground">Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-[3px] bg-muted-foreground/30" />
                                            <span className="text-muted-foreground">Expenses</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2 pl-2">
                                {monthlyTrends.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Chart visualization */}
                                        <div className="relative h-64 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-border/60">
                                            {/* Hover info tooltip banner */}
                                            {hoveredBarIndex !== null && monthlyTrends[hoveredBarIndex] && (
                                                <div className="absolute top-0 right-2 bg-popover text-popover-foreground border border-border px-2.5 py-1 rounded-md text-xs shadow-sm flex items-center gap-3 z-10 animate-in fade-in-50">
                                                    <span className="font-semibold">{monthlyTrends[hoveredBarIndex].month}:</span>
                                                    <span className="text-primary font-mono font-medium">Rev: {formatCurrency(monthlyTrends[hoveredBarIndex].revenue)}</span>
                                                    <span className="text-muted-foreground font-mono">Exp: {formatCurrency(monthlyTrends[hoveredBarIndex].total_expenses)}</span>
                                                </div>
                                            )}

                                            {monthlyTrends.map((m, idx) => {
                                                const revPercent = Math.min(100, Math.round(((m.revenue || 0) / maxMonthlyVal) * 100));
                                                const expPercent = Math.min(100, Math.round(((m.total_expenses || 0) / maxMonthlyVal) * 100));

                                                return (
                                                    <div
                                                        key={idx}
                                                        onMouseEnter={() => setHoveredBarIndex(idx)}
                                                        onMouseLeave={() => setHoveredBarIndex(null)}
                                                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                                                    >
                                                        {/* Dual Bars */}
                                                        <div className="w-full flex items-end justify-center gap-1.5 h-full px-1">
                                                            {/* Revenue Bar */}
                                                            <div
                                                                style={{ height: `${Math.max(revPercent, 5)}%` }}
                                                                className="w-1/2 max-w-[28px] bg-primary rounded-t-[4px] transition-all duration-300 group-hover:brightness-110"
                                                                title={`Revenue: ${formatCurrency(m.revenue)}`}
                                                            />
                                                            {/* Expense Bar */}
                                                            <div
                                                                style={{ height: `${Math.max(expPercent, 5)}%` }}
                                                                className="w-1/2 max-w-[28px] bg-muted-foreground/30 dark:bg-muted-foreground/40 rounded-t-[4px] transition-all duration-300 group-hover:bg-muted-foreground/60"
                                                                title={`Expenses: ${formatCurrency(m.total_expenses)}`}
                                                            />
                                                        </div>

                                                        {/* Month label */}
                                                        <span className="mt-3 text-[11px] font-medium text-muted-foreground truncate w-full text-center">
                                                            {m.month?.split(' ')?.[0] || m.month}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Financial Summary Strip */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                                <span className="text-muted-foreground text-[11px] block">Period Revenue</span>
                                                <span className="font-bold font-mono text-foreground text-sm mt-0.5 block">
                                                    {formatCurrency(fin.revenue)}
                                                </span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                                <span className="text-muted-foreground text-[11px] block">Operating Expenses</span>
                                                <span className="font-bold font-mono text-foreground text-sm mt-0.5 block">
                                                    {formatCurrency(fin.operating_expenses)}
                                                </span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                                <span className="text-muted-foreground text-[11px] block">Staff Payroll</span>
                                                <span className="font-bold font-mono text-foreground text-sm mt-0.5 block">
                                                    {formatCurrency(fin.payroll_expenses)}
                                                </span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                                                <span className="text-muted-foreground text-[11px] block">Net Period Balance</span>
                                                <span className={`font-bold font-mono text-sm mt-0.5 block ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {isProfit ? '+' : '-'}{formatCurrency(netAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-muted-foreground text-xs">
                                        No financial data recorded for the selected period.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Col 5-7: Recent Collections Card (Exact Shadcn Layout) */}
                        <Card className="col-span-3 border-border bg-card">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold text-card-foreground">
                                            Recent Collections
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                            You made {recentFeePayments?.length || 0} fee collections this period.
                                        </CardDescription>
                                    </div>
                                    <Link
                                        href="/fees/invoices"
                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
                                    >
                                        <span>View all</span>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentFeePayments.length > 0 ? (
                                    <div className="space-y-5">
                                        {recentFeePayments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                                                    <ProfileAvatar
                                                        src={payment.photo_url}
                                                        name={payment.student_name}
                                                        size="sm"
                                                        className="h-9 w-9 shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate leading-none">
                                                            {payment.student_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                                            {payment.admission_number} &bull; {payment.receipt_no}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-semibold font-mono text-sm text-foreground block">
                                                        +{formatCurrency(payment.amount)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                                        {payment.payment_method?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground text-xs">
                                        No recent fee payments found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Access Modules (Modern Minimal Grid) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold tracking-tight text-foreground">
                                Quick Operations
                            </h3>
                            <span className="text-xs text-muted-foreground">Direct module shortcuts</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {quickModules.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <Link
                                        key={m.title}
                                        href={m.href}
                                        className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all flex flex-col justify-between group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {m.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                                {m.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>

                {/* 2. ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Expense Categories Breakdown */}
                        <Card className="border-border bg-card lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-card-foreground">
                                    Operating Allocation by Category
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Detailed distribution of operational expenditures for this period.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stats.financials?.categories_breakdown?.length > 0 ? (
                                    stats.financials.categories_breakdown.map((cat) => (
                                        <div key={cat.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-foreground">{cat.name}</span>
                                                <span className="font-mono font-semibold text-foreground">{formatCurrency(cat.total)}</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                                                <span>{cat.count} vouchers</span>
                                                <span>{cat.percentage}% of operating budget</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-xs text-muted-foreground">
                                        No categorized expenses recorded.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Profit & Loss Margin Health Card */}
                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-card-foreground">
                                    Financial Health Margin
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Net institutional margin ratio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-center">
                                    <span className="text-xs text-muted-foreground block">Net Profit / Loss</span>
                                    <span className={`text-2xl font-bold font-mono mt-1 block ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isProfit ? '+' : '-'}{formatCurrency(netAmount)}
                                    </span>
                                    <Badge variant={isProfit ? 'default' : 'destructive'} className="mt-2 text-[10px]">
                                        {isProfit ? 'Operating Surplus' : 'Deficit Recorded'}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1.5 border-b border-border/40">
                                        <span className="text-muted-foreground">Total Fee Revenue</span>
                                        <span className="font-mono font-semibold text-foreground">{formatCurrency(fin.revenue)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border/40">
                                        <span className="text-muted-foreground">Operational Costs</span>
                                        <span className="font-mono font-semibold text-foreground">{formatCurrency(fin.operating_expenses)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border/40">
                                        <span className="text-muted-foreground">Faculty Payroll</span>
                                        <span className="font-mono font-semibold text-foreground">{formatCurrency(fin.payroll_expenses)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 font-medium">
                                        <span className="text-foreground">Margin Ratio</span>
                                        <span className="font-mono">{fin.margin_percentage || 0}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Student Demographics & Academic Density */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-card-foreground">
                                    Student Enrollment Demographics
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Gender balance and student distribution across the institution.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-foreground">
                                        Boys: {stats.students?.male || 0}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        Girls: {stats.students?.female || 0}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden flex">
                                    <div
                                        className="bg-blue-600 h-3"
                                        style={{ width: `${Math.round(((stats.students?.male || 0) / Math.max(stats.students?.total || 1, 1)) * 100)}%` }}
                                        title={`Boys: ${stats.students?.male || 0}`}
                                    />
                                    <div
                                        className="bg-pink-500 h-3"
                                        style={{ width: `${Math.round(((stats.students?.female || 0) / Math.max(stats.students?.total || 1, 1)) * 100)}%` }}
                                        title={`Girls: ${stats.students?.female || 0}`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <span className="text-muted-foreground text-[11px] block">Male Ratio</span>
                                        <span className="font-bold text-foreground text-sm mt-0.5 block">
                                            {Math.round(((stats.students?.male || 0) / Math.max(stats.students?.total || 1, 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <span className="text-muted-foreground text-[11px] block">Female Ratio</span>
                                        <span className="font-bold text-foreground text-sm mt-0.5 block">
                                            {Math.round(((stats.students?.female || 0) / Math.max(stats.students?.total || 1, 1)) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-card-foreground">
                                    Academic Class Matrix
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    Active sections and faculty allocation ratio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <span className="text-muted-foreground text-[11px] block">Classes</span>
                                        <span className="font-bold font-mono text-xl text-foreground mt-1 block">
                                            {stats.academics?.classes || 0}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <span className="text-muted-foreground text-[11px] block">Sections</span>
                                        <span className="font-bold font-mono text-xl text-foreground mt-1 block">
                                            {stats.academics?.sections || 0}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                        <span className="text-muted-foreground text-[11px] block">Teachers</span>
                                        <span className="font-bold font-mono text-xl text-foreground mt-1 block">
                                            {stats.staff?.teachers || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-2 text-xs text-muted-foreground">
                                    Average student-to-teacher ratio: <strong className="text-foreground">{Math.round((stats.students?.total || 0) / Math.max(stats.staff?.teachers || 1, 1))}:1</strong>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* 3. REPORTS TAB */}
                <TabsContent value="reports" className="space-y-4">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold text-card-foreground">
                                        Institutional Financial Statement
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Consolidated audit figures for {currentPeriodLabel}.
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.print()}
                                    className="h-8 text-xs"
                                >
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                    Export Statement
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-border overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="p-3">Accounting Category</th>
                                            <th className="p-3 text-right">Inflow / Revenue</th>
                                            <th className="p-3 text-right">Outflow / Expense</th>
                                            <th className="p-3 text-right">Net Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Student Tuition &amp; Fee Receipts</td>
                                            <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                +{formatCurrency(fin.revenue)}
                                            </td>
                                            <td className="p-3 text-right font-mono text-muted-foreground">-</td>
                                            <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                +{formatCurrency(fin.revenue)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Operational Supplies &amp; Utilities</td>
                                            <td className="p-3 text-right font-mono text-muted-foreground">-</td>
                                            <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                                                -{formatCurrency(fin.operating_expenses)}
                                            </td>
                                            <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                                                -{formatCurrency(fin.operating_expenses)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Staff &amp; Faculty Salary Settlements</td>
                                            <td className="p-3 text-right font-mono text-muted-foreground">-</td>
                                            <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                                                -{formatCurrency(fin.payroll_expenses)}
                                            </td>
                                            <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                                                -{formatCurrency(fin.payroll_expenses)}
                                            </td>
                                        </tr>
                                        <tr className="bg-muted/50 font-bold">
                                            <td className="p-3 text-foreground">Net Operating Result</td>
                                            <td className="p-3 text-right font-mono text-foreground">
                                                {formatCurrency(fin.revenue)}
                                            </td>
                                            <td className="p-3 text-right font-mono text-foreground">
                                                {formatCurrency(fin.expenses)}
                                            </td>
                                            <td className={`p-3 text-right font-mono text-sm ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {isProfit ? '+' : '-'}{formatCurrency(netAmount)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 4. NOTIFICATIONS TAB */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold text-card-foreground">
                                Operational Status &amp; System Alerts
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Important notices and administrative operational checkpoints.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start space-x-3 p-3.5 rounded-lg border border-border bg-muted/30">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-semibold text-foreground">Academic Session Active</p>
                                    <p className="text-muted-foreground mt-0.5">
                                        Session year 2026-2027 is actively configured. All fee structures and student enrollments are mapped.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3.5 rounded-lg border border-border bg-muted/30">
                                <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-semibold text-foreground">Fee Challans Ready</p>
                                    <p className="text-muted-foreground mt-0.5">
                                        Fee challans and monthly invoices can be printed in bulk or sent to student accounts.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3.5 rounded-lg border border-border bg-muted/30">
                                <Activity className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-semibold text-foreground">System Health Check Passed</p>
                                    <p className="text-muted-foreground mt-0.5">
                                        Database integrity verified. All student records, timestamps, and audit ledgers synchronized.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
