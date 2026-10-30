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
                <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Total Revenue
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-slate-900 font-mono">
                                Rs. {Number(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-semibold">100%</span> Student fee vouchers
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Operating Expenses */}
                <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Operating Expenses
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-slate-900 font-mono">
                                Rs. {Number(summary.expenses?.operating_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {summary.expenses?.by_category?.length || 0} Active expenditure categories
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Staff Salaries & Payroll */}
                <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Staff Payroll
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-slate-900 font-mono">
                                Rs. {Number(summary.expenses?.payroll_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Advances: Rs. {Number(summary.expenses?.advances_issued || 0).toLocaleString('en-US')}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Net Profit / (Loss) */}
                <Card className={`border-slate-200 shadow-sm relative overflow-hidden bg-white ${
                    isProfit ? 'ring-1 ring-emerald-500/20' : 'ring-1 ring-rose-500/20'
                }`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isProfit ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Net Operating {isProfit ? 'Surplus' : 'Deficit'}
                            </span>
                            <Badge className={
                                isProfit
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[10px]"
                                    : "bg-rose-100 text-rose-800 hover:bg-rose-100 border-0 text-[10px]"
                            }>
                                {isProfit ? 'Profit' : 'Deficit'} ({summary.net_profit_loss?.margin_percentage}%)
                            </Badge>
                        </div>
                        <div className="mt-2">
                            <span className={`text-xl font-black font-mono ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {isProfit ? '+ Rs. ' : '- Rs. '}
                                {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {summary.period?.formatted_period}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Income & Expense Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formal Income Statement Table */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-900">
                                Institutional Profit & Loss Breakdown
                            </CardTitle>
                            <span className="text-xs text-slate-500">
                                Detailed reconciliation of fee revenues, staff payouts, and utilities
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenPrint}
                            className="text-xs h-8 border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" /> Print Statement
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 text-xs">
                            {/* Revenue Header */}
                            <div className="bg-slate-50/50 px-4 py-2 font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                                <span>1. Revenue Inflows</span>
                                <span>Amount (PKR)</span>
                            </div>
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-slate-800 block">Student Tuition & Academic Fees</span>
                                    <span className="text-[11px] text-slate-500">Total collected via bank, cash & digital vouchers</span>
                                </div>
                                <span className="font-bold text-slate-900 font-mono text-sm">
                                    Rs. {Number(summary.revenue?.fee_collections || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Revenue Method Pills */}
                            {summary.revenue?.by_method?.length > 0 && (
                                <div className="px-4 py-2 bg-slate-50/30 flex flex-wrap gap-2 text-[11px]">
                                    {summary.revenue.by_method.map((m) => (
                                        <Badge key={m.method} variant="outline" className="bg-white border-slate-200 font-normal">
                                            <span className="capitalize font-semibold text-slate-700">{m.method.replace('_', ' ')}:</span>
                                            <span className="ml-1 text-slate-900 font-mono">Rs. {Number(m.total).toLocaleString()}</span>
                                            <span className="ml-1 text-slate-400">({m.count})</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Expenses Header */}
                            <div className="bg-slate-50/50 px-4 py-2 font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                                <span>2. Operating & Payroll Outflows</span>
                                <span>Amount (PKR)</span>
                            </div>

                            {/* Staff Payroll */}
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-slate-800 block">Staff & Faculty Salaries</span>
                                    <span className="text-[11px] text-slate-500">Monthly settlements and compensation payouts</span>
                                </div>
                                <span className="font-bold text-slate-900 font-mono text-sm">
                                    Rs. {Number(summary.expenses?.payroll_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Categorized Expenses Items */}
                            {summary.expenses?.by_category?.map((cat) => (
                                <div key={cat.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                                        <span className="font-medium text-slate-700">{cat.name}</span>
                                        <Badge variant="outline" className="text-[10px] text-slate-500 font-mono py-0">
                                            {cat.count} records
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-900 font-mono">
                                            Rs. {Number(cat.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block font-mono">
                                            {cat.percentage}% of op. exp
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Totals Summary Footer */}
                            <div className="bg-slate-50 p-4 space-y-2">
                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                    <span>Total Gross Revenue:</span>
                                    <span className="font-mono font-bold text-emerald-700">
                                        Rs. {Number(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600 font-medium">
                                    <span>Total Operational Costs:</span>
                                    <span className="font-mono font-bold text-rose-700">
                                        - Rs. {Number(summary.expenses?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-900">
                                        Net Operating Income / (Deficit):
                                    </span>
                                    <span className={`font-mono text-base ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
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
                    {/* Category Expenditure Share */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-indigo-600" />
                                Expense Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {summary.expenses?.by_category?.length > 0 ? (
                                summary.expenses.by_category.slice(0, 6).map((cat) => (
                                    <div key={cat.id} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                                                {cat.name}
                                            </span>
                                            <span className="font-bold text-slate-900 font-mono">
                                                {cat.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">
                                    No category expenses recorded in this period.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monthly Comparison Bars */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                6-Month Inflow vs Outflow
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {summary.monthly_trends?.map((trend, idx) => {
                                const revWidth = maxMonthlyExp > 0 ? (trend.revenue / maxMonthlyExp) * 100 : 0;
                                const expWidth = maxMonthlyExp > 0 ? (trend.total_expenses / maxMonthlyExp) * 100 : 0;

                                return (
                                    <div key={idx} className="space-y-1 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                                        <div className="flex justify-between font-semibold">
                                            <span className="text-slate-700">{trend.month}</span>
                                            <span className={`font-mono text-[11px] ${trend.is_profit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {trend.is_profit ? '+' : '-'}Rs. {Math.abs(trend.net_profit).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Bars */}
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] w-6 text-slate-400">In</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(2, revWidth)}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] w-6 text-slate-400">Out</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
