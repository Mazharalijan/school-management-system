import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrintPnlModal({ isOpen, onClose, summary }) {
    if (!summary) return null;

    const handlePrint = () => {
        window.print();
    };

    const isProfit = summary.net_profit_loss?.is_profit;
    const netAmount = Math.abs(summary.net_profit_loss?.amount || 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-card text-card-foreground border-border">
                <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between no-print">
                    <DialogTitle className="text-sm font-bold text-foreground">
                        Formal Profit & Loss Financial Statement
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handlePrint}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Statement
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Printable Document Area */}
                <div className="p-8 bg-card text-foreground print:bg-white print:text-black print:p-0 space-y-6 text-xs">
                    {/* Institutional Header */}
                    <div className="text-center border-b-2 border-border print:border-black pb-4 space-y-1">
                        <div className="flex items-center justify-center gap-2 text-primary print:text-black font-bold uppercase tracking-widest text-[11px]">
                            <Award className="w-4 h-4" /> Academic Accounts & Financial Audit Directorate
                        </div>
                        <h1 className="text-xl font-black uppercase text-foreground print:text-black tracking-wide font-serif">
                            Army Public School & College System
                        </h1>
                        <h2 className="text-sm font-bold uppercase text-muted-foreground print:text-black tracking-wider">
                            Statement of Profit and Loss (Income Statement)
                        </h2>
                        <p className="text-xs font-semibold text-muted-foreground print:text-black font-mono">
                            Reporting Period: {summary.period?.formatted_period}
                        </p>
                    </div>

                    {/* Statement Financial Table */}
                    <div className="space-y-4">
                        {/* 1. REVENUE (INFLOWS) */}
                        <div className="border border-border print:border-gray-300 rounded-sm overflow-hidden bg-card print:bg-white">
                            <div className="bg-muted print:bg-gray-100 px-4 py-2 font-bold text-foreground print:text-black uppercase tracking-wider flex justify-between">
                                <span>I. Operational Revenue (Inflows)</span>
                                <span>Amount (PKR)</span>
                            </div>
                            <div className="divide-y divide-border print:divide-gray-200">
                                <div className="px-4 py-2.5 flex justify-between font-medium">
                                    <span className="pl-2">Student Tuition & Academic Fee Receipts</span>
                                    <span className="font-mono font-semibold">
                                        Rs. {Number(summary.revenue?.fee_collections || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {summary.revenue?.by_method?.map((m) => (
                                    <div key={m.method} className="px-4 py-1.5 flex justify-between text-[11px] text-muted-foreground print:text-gray-600">
                                        <span className="pl-6 capitalize">• Via {m.method.replace('_', ' ')} ({m.count} vouchers)</span>
                                        <span className="font-mono">
                                            Rs. {Number(m.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 print:bg-emerald-50 px-4 py-2 flex justify-between font-bold text-emerald-950 dark:text-emerald-200 print:text-emerald-950">
                                    <span>Total Operational Revenue (A)</span>
                                    <span className="font-mono">
                                        Rs. {Number(summary.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. OPERATIONAL EXPENSES (OUTFLOWS) */}
                        <div className="border border-border print:border-gray-300 rounded-sm overflow-hidden bg-card print:bg-white">
                            <div className="bg-muted print:bg-gray-100 px-4 py-2 font-bold text-foreground print:text-black uppercase tracking-wider flex justify-between">
                                <span>II. Operating Expenses (Outflows)</span>
                                <span>Amount (PKR)</span>
                            </div>
                            <div className="divide-y divide-border print:divide-gray-200">
                                {/* Payroll */}
                                <div className="px-4 py-2 flex justify-between font-semibold text-foreground print:text-black">
                                    <span className="pl-2">Teaching & Administrative Staff Payroll</span>
                                    <span className="font-mono">
                                        Rs. {Number(summary.expenses?.payroll_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Categorized Operating Expenses */}
                                {summary.expenses?.by_category?.map((cat) => (
                                    <div key={cat.id} className="px-4 py-1.5 flex justify-between text-muted-foreground print:text-gray-700">
                                        <span className="pl-4">{cat.name} ({cat.count} items)</span>
                                        <span className="font-mono">
                                            Rs. {Number(cat.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}

                                <div className="bg-rose-50/60 dark:bg-rose-950/40 print:bg-rose-50 px-4 py-2 flex justify-between font-bold text-rose-950 dark:text-rose-200 print:text-rose-950">
                                    <span>Total Operating Expenses (B)</span>
                                    <span className="font-mono">
                                        Rs. {Number(summary.expenses?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. NET PROFIT / LOSS SUMMARY */}
                        <div className={`p-4 rounded-sm border-2 flex items-center justify-between ${
                            isProfit ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 print:bg-emerald-50 print:text-emerald-950' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-200 print:bg-rose-50 print:text-rose-950'
                        }`}>
                            <div className="space-y-0.5">
                                <span className="font-bold uppercase tracking-wider text-[11px] block">
                                    III. Net Operating Income / (Loss) [A - B]
                                </span>
                                <span className="text-xs font-medium">
                                    Operating Margin: <strong>{summary.net_profit_loss?.margin_percentage}%</strong>
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black font-mono">
                                    {isProfit ? '+ Rs. ' : '- Rs. '}
                                    {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                                <span className="block text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                    {isProfit ? 'Net Surplus / Profit' : 'Net Operating Deficit'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sign-off Blocks */}
                    <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border print:border-black text-center text-[11px]">
                        <div>
                            <div className="border-t border-border print:border-black pt-1.5 font-bold text-foreground print:text-black">Accounts Officer</div>
                            <span className="text-muted-foreground print:text-gray-600 text-[10px]">Preparation & Ledger Check</span>
                        </div>
                        <div>
                            <div className="border-t border-border print:border-black pt-1.5 font-bold text-foreground print:text-black">Bursar / Finance Secretary</div>
                            <span className="text-muted-foreground print:text-gray-600 text-[10px]">Verification & Audit</span>
                        </div>
                        <div>
                            <div className="border-t border-border print:border-black pt-1.5 font-bold text-foreground print:text-black">Principal / Commandant</div>
                            <span className="text-muted-foreground print:text-gray-600 text-[10px]">Executive Approval</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
