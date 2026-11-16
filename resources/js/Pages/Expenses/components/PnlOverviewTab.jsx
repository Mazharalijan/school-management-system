import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Coins,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    BarChart3,
    Printer,
    CheckCircle2,
    AlertCircle,
    Receipt
} from 'lucide-react';

export default function PnlOverviewTab({ summary, onOpenPrint }) {
    if (!summary) return null;

    const isProfit = summary.net_profit_loss?.is_profit;
    const netAmount = Math.abs(summary.net_profit_loss?.amount || 0);
    const maxMonthlyExp = Math.max(
        ...(summary.monthly_trends?.map((m) => Math.max(m.revenue, m.total_expenses)) || [1])
    );

    return (
        <div className="space-y-6">
            {/* Top 4 KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <Card className="border-border shadow-xs relative overflow-hidden bg-card text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Revenue
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-foreground font-mono">
                                Rs. {Number(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100%</span> Student fee vouchers
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Operating Expenses */}
                <Card className="border-border shadow-xs relative overflow-hidden bg-card text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Operating Expenses
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-foreground font-mono">
                                Rs. {Number(summary.expenses?.operating_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {summary.expenses?.by_category?.length || 0} Active expenditure categories
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Staff Salaries & Payroll */}
                <Card className="border-border shadow-xs relative overflow-hidden bg-card text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Staff Payroll
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-foreground font-mono">
                                Rs. {Number(summary.expenses?.payroll_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Advances: Rs. {Number(summary.expenses?.advances_issued || 0).toLocaleString('en-US')}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Net Profit / (Loss) */}
                <Card className={`border-border shadow-xs relative overflow-hidden bg-card text-card-foreground ${
                    isProfit ? 'ring-1 ring-emerald-500/30' : 'ring-1 ring-rose-500/30'
                }`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Net Operating {isProfit ? 'Surplus' : 'Deficit'}
                            </span>
                            <Badge className={
                                isProfit
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px]"
                                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px]"
                            }>
                                {isProfit ? 'Profit' : 'Deficit'} ({summary.net_profit_loss?.margin_percentage}%)
                            </Badge>
                        </div>
                        <div className="mt-2">
                            <span className={`text-xl font-black font-mono ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {isProfit ? '+ Rs. ' : '- Rs. '}
                                {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {summary.period?.formatted_period}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Income & Expense Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formal Income Statement Table */}
                <Card className="lg:col-span-2 border-border shadow-xs bg-card text-card-foreground">
                    <CardHeader className="bg-muted/40 border-b border-border pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-foreground">
                                Institutional Profit & Loss Breakdown
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                Detailed reconciliation of fee revenues, staff payouts, and utilities
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenPrint}
                            className="text-xs h-8"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> Print Statement
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border text-xs">
                            {/* Revenue Header */}
                            <div className="bg-muted/60 px-4 py-2 font-bold text-foreground uppercase tracking-wider flex justify-between">
                                <span>1. Revenue Inflows</span>
                                <span>Amount (PKR)</span>
                            </div>
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">Student Tuition & Academic Fees</span>
                                    <span className="text-[11px] text-muted-foreground">Total collected via bank, cash & digital vouchers</span>
                                </div>
                                <span className="font-bold text-foreground font-mono text-sm">
                                    Rs. {Number(summary.revenue?.fee_collections || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Student Fines Row */}
                            <div className="px-4 py-2.5 flex items-center justify-between bg-muted/20">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-foreground">Student Fines</span>
                                        {summary.revenue?.include_fines_in_financial_flow ? (
                                            <Badge variant="outline" className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                                                In Financial Flow
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300">
                                                Excluded by Setting
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        {summary.revenue?.fine_collections_count || 0} Paid student penalties (Leave, Exam, Test, Discipline)
                                    </span>
                                </div>
                                <span className="font-bold text-foreground font-mono text-sm">
                                    Rs. {Number(summary.revenue?.fine_collections || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Exam Paper Money Fees Row */}
                            <div className="px-4 py-2.5 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">Exam Paper Money Fees</span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {summary.revenue?.exam_paper_fees_count || 0} Student paper exam fee collections
                                    </span>
                                </div>
                                <span className="font-bold text-foreground font-mono text-sm text-emerald-600 dark:text-emerald-400">
                                    Rs. {Number(summary.revenue?.exam_paper_fees || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Revenue Method Pills */}
                            {summary.revenue?.by_method?.length > 0 && (
                                <div className="px-4 py-2 bg-muted/30 flex flex-wrap gap-2 text-[11px]">
                                    {summary.revenue.by_method.map((m) => (
                                        <Badge key={m.method} variant="outline" className="bg-background border-border font-normal text-foreground">
                                            <span className="capitalize font-semibold text-foreground">{m.method.replace('_', ' ')}:</span>
                                            <span className="ml-1 text-foreground font-mono">Rs. {Number(m.total).toLocaleString()}</span>
                                            <span className="ml-1 text-muted-foreground">({m.count})</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Expenses Header */}
                            <div className="bg-muted/60 px-4 py-2 font-bold text-foreground uppercase tracking-wider flex justify-between">
                                <span>2. Operating & Payroll Outflows</span>
                                <span>Amount (PKR)</span>
                            </div>

                            {/* Staff Payroll */}
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-foreground block">Staff & Faculty Salaries</span>
                                    <span className="text-[11px] text-muted-foreground">Monthly settlements and compensation payouts</span>
                                </div>
                                <span className="font-bold text-foreground font-mono text-sm">
                                    Rs. {Number(summary.expenses?.payroll_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Exam Paper Expenses */}
                            <div className="px-4 py-2.5 flex items-center justify-between bg-muted/20">
                                <div>
                                    <span className="font-semibold text-foreground block">Exam Paper Expenses</span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {summary.expenses?.exam_paper_expenses_count || 0} Incurred costs (Printing, photocopying, stationery, marking honorarium)
                                    </span>
                                </div>
                                <span className="font-bold text-foreground font-mono text-sm text-rose-600 dark:text-rose-400">
                                    Rs. {Number(summary.expenses?.exam_paper_expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Categorized Expenses Items */}
                            {summary.expenses?.by_category?.map((cat) => (
                                <div key={cat.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                                        <span className="font-medium text-foreground">{cat.name}</span>
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono py-0 border-border">
                                            {cat.count} records
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-foreground font-mono">
                                            Rs. {Number(cat.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground block font-mono">
                                            {cat.percentage}% of op. exp
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Totals Summary Footer */}
                            <div className="bg-muted/40 p-4 space-y-2 border-t border-border">
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>Total Gross Revenue:</span>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        Rs. {Number(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                    <span>Total Operational Costs:</span>
                                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                        - Rs. {Number(summary.expenses?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold">
                                    <span className="text-foreground">
                                        Net Operating Income / (Deficit):
                                    </span>
                                    <span className={`font-mono text-base ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isProfit ? '+ Rs. ' : '- Rs. '}
                                        {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Category Distribution & Trends */}
                <div className="space-y-6">
                    {/* Exam Paper Money Module Result */}
                    {summary.exam_paper_accounting && (
                        <Card className="border-border shadow-xs bg-card text-card-foreground">
                            <CardHeader className="bg-muted/40 border-b border-border pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-amber-500" />
                                    Exam Paper Money P&L
                                </CardTitle>
                                <Badge className={
                                    summary.exam_paper_accounting.is_profit
                                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 text-[10px]"
                                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 text-[10px]"
                                }>
                                    {summary.exam_paper_accounting.is_profit ? 'Paper Profit' : 'Paper Deficit'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 space-y-2.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Paper Fees Collected:</span>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        Rs. {Number(summary.exam_paper_accounting.total_collected || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Paper Printing & Stationery:</span>
                                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                        - Rs. {Number(summary.exam_paper_accounting.total_expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold">
                                    <span className="text-foreground">Net Paper Margin:</span>
                                    <span className={`font-mono text-sm ${summary.exam_paper_accounting.is_profit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {summary.exam_paper_accounting.is_profit ? '+ Rs. ' : '- Rs. '}
                                        {Math.abs(summary.exam_paper_accounting.net_profit_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Category Expenditure Share */}
                    <Card className="border-border shadow-xs bg-card text-card-foreground">
                        <CardHeader className="bg-muted/40 border-b border-border pb-3">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Expense Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {summary.expenses?.by_category?.length > 0 ? (
                                summary.expenses.by_category.slice(0, 6).map((cat) => (
                                    <div key={cat.id} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-foreground truncate max-w-[180px]">
                                                {cat.name}
                                            </span>
                                            <span className="font-bold text-foreground font-mono">
                                                {cat.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                    No category expenses recorded in this period.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Comparison Bars */}
                    <Card className="border-border shadow-xs bg-card text-card-foreground">
                        <CardHeader className="bg-muted/40 border-b border-border pb-3">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                6-Month Inflow vs Outflow
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {summary.monthly_trends?.map((trend, idx) => {
                                const revWidth = maxMonthlyExp > 0 ? (trend.revenue / maxMonthlyExp) * 100 : 0;
                                const expWidth = maxMonthlyExp > 0 ? (trend.total_expenses / maxMonthlyExp) * 100 : 0;

                                return (
                                    <div key={idx} className="space-y-1 text-xs border-b border-border pb-2.5 last:border-0 last:pb-0">
                                        <div className="flex justify-between font-semibold">
                                            <span className="text-foreground">{trend.month}</span>
                                            <span className={`font-mono text-[11px] ${trend.is_profit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {trend.is_profit ? '+' : '-'}Rs. {Math.abs(trend.net_profit).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Bars */}
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] w-6 text-muted-foreground">In</span>
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(2, revWidth)}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] w-6 text-muted-foreground">Out</span>
                                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.max(2, expWidth)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
