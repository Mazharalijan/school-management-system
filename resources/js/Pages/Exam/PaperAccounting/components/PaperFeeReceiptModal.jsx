import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, Receipt, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaperFeeReceiptModal({ isOpen, onClose, paperFee }) {
    const { props } = usePage();
    const settings = props.system_settings || {};
    const currency = settings.currency_symbol || 'Rs.';

    const [printerType, setPrinterType] = useState('standard');

    if (!paperFee) return null;

    const student = paperFee.student || {};
    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const rollNo = student.roll_number || student.admission_number || 'N/A';
    const className = paperFee.school_class?.name || 'N/A';

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card text-card-foreground border-border print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
                {/* Print Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border print:hidden">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-primary" />
                            Exam Paper Money Receipt #{paperFee.receipt_no || `PMR-${paperFee.id}`}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center rounded-xs border border-border bg-muted/50 p-0.5 text-xs">
                            <span className="text-[11px] font-semibold text-muted-foreground px-2">Printer:</span>
                            <button
                                type="button"
                                onClick={() => setPrinterType('standard')}
                                className={cn(
                                    "px-2.5 py-1 font-semibold rounded-xs transition-colors flex items-center gap-1",
                                    printerType === 'standard'
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Standard (A4)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrinterType('mini')}
                                className={cn(
                                    "px-2.5 py-1 font-semibold rounded-xs transition-colors flex items-center gap-1",
                                    printerType === 'mini'
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                Mini POS (80mm)
                            </button>
                        </div>

                        <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Printer className="w-4 h-4" />
                            Print Now
                        </Button>
                    </div>
                </div>

                {/* Printable Area */}
                <div className="my-2">
                    {/* OPTION 1: MINI POS PRINTER */}
                    {printerType === 'mini' && (
                        <div className="mx-auto w-[80mm] max-w-full font-mono text-[11px] leading-tight text-black bg-white p-3 border border-dashed border-gray-300 print:border-none print:p-0 print:m-0">
                            <div className="text-center pb-2 border-b border-black">
                                {settings.logo_url && (
                                    <img
                                        src={settings.logo_url}
                                        alt="Logo"
                                        className="h-10 mx-auto mb-1 object-contain grayscale"
                                    />
                                )}
                                <h2 className="text-sm font-black uppercase tracking-wide">{settings.school_name || 'SCHOOL SYSTEM'}</h2>
                                {settings.address && <p className="text-[9px] text-gray-700 leading-tight mt-0.5">{settings.address}</p>}
                                <div className="mt-1.5 py-0.5 bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                                    EXAM PAPER FEE RECEIPT
                                </div>
                            </div>

                            <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Receipt No:</span>
                                    <span className="font-bold">{paperFee.receipt_no || `PMR-${paperFee.id}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>{paperFee.paid_date || 'Today'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Payment Method:</span>
                                    <span className="uppercase font-semibold">{paperFee.payment_method || 'CASH'}</span>
                                </div>
                            </div>

                            <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Student:</span>
                                    <span className="font-bold">{studentName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Roll No:</span>
                                    <span>{rollNo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Class:</span>
                                    <span>{className}</span>
                                </div>
                            </div>

                            <div className="py-2 border-b border-black">
                                <div className="text-[10px] font-bold uppercase mb-1">Particulars:</div>
                                <div className="flex justify-between text-[11px] font-semibold">
                                    <span>{paperFee.notes || 'Term Examination Paper Money'}</span>
                                    <span>{currency} {Number(paperFee.amount).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="py-2 border-b-2 border-black space-y-1 text-xs">
                                <div className="flex justify-between font-black text-sm">
                                    <span>TOTAL PAID:</span>
                                    <span>{currency} {Number(paperFee.paid_amount || paperFee.amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span>Balance Remaining:</span>
                                    <span>{currency} 0.00</span>
                                </div>
                            </div>

                            <div className="pt-6 pb-2 text-center text-[9px]">
                                <div className="border-t border-dotted border-gray-500 w-32 mx-auto pt-1 font-semibold">
                                    Authorized Cashier
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OPTION 2: STANDARD A4 RECEIPT */}
                    {printerType === 'standard' && (
                        <div className="border border-border/80 rounded-sm p-5 bg-card text-card-foreground shadow-xs">
                            <div className="flex items-start justify-between pb-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    {settings.logo_url ? (
                                        <img
                                            src={settings.logo_url}
                                            alt="Logo"
                                            className="h-14 w-14 object-contain rounded-xs border border-border p-1 bg-background"
                                        />
                                    ) : (
                                        <div className="h-14 w-14 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                            <Building2 className="w-7 h-7" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">{settings.school_name || 'School Name'}</h2>
                                        <p className="text-xs text-muted-foreground">{settings.address || 'Campus Address'}</p>
                                        <p className="text-xs text-muted-foreground">Phone: {settings.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className="bg-primary/15 text-primary border-primary/30 uppercase text-xs mb-1">
                                        Exam Paper Fee Voucher
                                    </Badge>
                                    <div className="text-xs font-mono font-bold text-foreground">
                                        Receipt: {paperFee.receipt_no || `PMR-${paperFee.id}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Date: {paperFee.paid_date || 'Today'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-border bg-muted/20 px-3 my-3 rounded-xs">
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Student Name</span>
                                    <span className="font-bold text-foreground">{studentName}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Roll / Adm No</span>
                                    <span className="font-mono text-foreground">{rollNo} / {student.admission_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Class</span>
                                    <span className="font-semibold text-foreground">{className}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Payment Method</span>
                                    <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400">{paperFee.payment_method || 'CASH'}</span>
                                </div>
                            </div>

                            <div className="border border-border rounded-sm overflow-hidden my-3">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted text-foreground">
                                        <tr>
                                            <th className="p-2.5 text-left font-bold">Particulars</th>
                                            <th className="p-2.5 text-left font-bold">Details</th>
                                            <th className="p-2.5 text-right font-bold">Amount Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr>
                                            <td className="p-2.5 font-bold text-foreground">
                                                Exam Paper Money Fee
                                            </td>
                                            <td className="p-2.5 text-muted-foreground">
                                                {paperFee.notes || 'Term Examination Question Papers, Composing & Answer Sheets'}
                                            </td>
                                            <td className="p-2.5 text-right font-mono font-bold text-foreground">
                                                {currency} {Number(paperFee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-muted/40 font-bold border-t border-border">
                                        <tr className="text-emerald-600 dark:text-emerald-400">
                                            <td colSpan={2} className="p-2.5 text-right">Net Paid &amp; Cleared:</td>
                                            <td className="p-2.5 text-right font-mono font-black text-sm">
                                                {currency} {Number(paperFee.paid_amount || paperFee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex justify-between items-end pt-8 text-xs text-muted-foreground">
                                <div className="space-y-1">
                                    <p>Status: <span className="text-emerald-600 font-bold uppercase">PAID &amp; VERIFIED</span></p>
                                </div>
                                <div className="text-center">
                                    <div className="border-t border-border w-44 pt-1 font-semibold text-foreground">
                                        Authorized Stamp &amp; Sign
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
