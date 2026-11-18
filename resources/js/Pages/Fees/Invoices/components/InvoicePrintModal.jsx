import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Printer, X, FileText, Receipt, CheckCircle2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicePrintModal({ isOpen, onClose, invoice }) {
    const { props } = usePage();
    const settings = props.system_settings || {};
    const currency = settings.currency_symbol || '$';

    // Printer Type: 'standard' (A4) or 'mini' (POS 80mm Thermal)
    const [printerType, setPrinterType] = useState('standard');
    // For Standard: 'single' (Full page) or '3copy' (Student / School / Bank copies)
    const [standardLayout, setStandardLayout] = useState('single');

    if (!invoice) return null;

    const items = invoice.items || [];
    const payments = invoice.payments || [];
    const student = invoice.student || {};
    const schoolClass = invoice.school_class || invoice.schoolClass || {};
    const section = invoice.section || {};

    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const rollNo = student.roll_number || student.roll_no || student.admission_number || 'N/A';

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card text-card-foreground border-border print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
                {/* Print Control Toolbar (Hidden on print) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border print:hidden">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Printer className="w-4 h-4 text-primary" />
                            Print Fee Invoice #{invoice.invoice_no}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Printer Type Selector */}
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

                        {printerType === 'standard' && (
                            <div className="flex items-center rounded-xs border border-border bg-muted/50 p-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStandardLayout('single')}
                                    className={cn(
                                        "px-2 py-1 text-[11px] font-medium rounded-xs transition-colors",
                                        standardLayout === 'single'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Single Page
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStandardLayout('3copy')}
                                    className={cn(
                                        "px-2 py-1 text-[11px] font-medium rounded-xs transition-colors",
                                        standardLayout === '3copy'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="3-Part Bank / Institution Voucher"
                                >
                                    3-Part Voucher
                                </button>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs whitespace-nowrap shrink-0 inline-flex items-center"
                        >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            <span>Print Now</span>
                        </Button>
                    </div>
                </div>

                {/* Dynamic Print Preview Area */}
                <div className="mt-4 flex justify-center">
                    {/* OPTION 1: MINI POS (80mm Thermal Receipt Printer) */}
                    {printerType === 'mini' ? (
                        <div
                            id="printable-mini-invoice"
                            className="w-[80mm] max-w-[80mm] p-3 bg-white text-black font-mono text-[11px] leading-tight border border-gray-300 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0"
                            style={{ width: '80mm' }}
                        >
                            {/* School Header */}
                            <div className="text-center pb-2 border-b border-dashed border-gray-400">
                                <h2 className="text-xs font-black uppercase tracking-wider">{settings.school_name || 'Academic School Portal'}</h2>
                                {settings.school_tagline && (
                                    <p className="text-[9px] text-gray-600">{settings.school_tagline}</p>
                                )}
                                <p className="text-[9px] text-gray-600 mt-0.5">
                                    {settings.address || 'Campus Address'}
                                </p>
                                {settings.phone && (
                                    <p className="text-[9px] text-gray-600">Tel: {settings.phone}</p>
                                )}
                                <div className="mt-1 font-bold uppercase tracking-widest text-[10px] bg-gray-100 py-0.5">
                                    FEE PAYMENT RECEIPT
                                </div>
                            </div>

                            {/* Voucher & Student Metadata */}
                            <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Voucher #:</span>
                                    <strong className="font-bold">{invoice.invoice_no}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Issue Date:</span>
                                    <span>{invoice.issue_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Due Date:</span>
                                    <span>{invoice.due_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Billing Month:</span>
                                    <span>{invoice.month} {invoice.session_year}</span>
                                </div>
                                <div className="pt-1 mt-1 border-t border-dotted border-gray-300">
                                    <div className="flex justify-between">
                                        <span>Student:</span>
                                        <strong className="truncate max-w-[140px]">{studentName}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Roll No:</span>
                                        <span>{rollNo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Class:</span>
                                        <span>{schoolClass.name || 'N/A'}{section.name ? ` (${section.name})` : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Table */}
                            <div className="py-2 border-b border-dashed border-gray-400">
                                <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-dotted border-gray-300">
                                    <span>Fee Description</span>
                                    <span>Amount</span>
                                </div>
                                <div className="divide-y divide-dotted divide-gray-200 py-1 space-y-1">
                                    {items.length > 0 ? (
                                        items.map((item, idx) => (
                                            <div key={item.id || idx} className="flex justify-between text-[10px] pt-0.5">
                                                <span className="truncate max-w-[150px]">{item.title}</span>
                                                <span className="font-semibold">{currency}{Number(item.amount).toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex justify-between text-[10px]">
                                            <span>Monthly Tuition Fee</span>
                                            <span className="font-semibold">{currency}{Number(invoice.total_amount).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{currency}{Number(invoice.subtotal || invoice.total_amount).toFixed(2)}</span>
                                </div>
                                {Number(invoice.previous_arrears) > 0 && (
                                    <div className="flex justify-between">
                                        <span>Previous Arrears:</span>
                                        <span>{currency}{Number(invoice.previous_arrears).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(invoice.discount) > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span>Discount:</span>
                                        <span>-{currency}{Number(invoice.discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-[11px] pt-1 border-t border-dotted border-gray-300">
                                    <span>Total Payable:</span>
                                    <span>{currency}{Number(invoice.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span>Paid to Date:</span>
                                    <span className="font-bold">{currency}{Number(invoice.paid_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-[12px] pt-1 border-t border-gray-400">
                                    <span>Balance Due:</span>
                                    <span>{currency}{Number(invoice.due_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="text-center pt-1">
                                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase border border-black">
                                        STATUS: {invoice.status || 'UNPAID'}
                                    </span>
                                </div>
                            </div>

                            {/* Cashier Signature & Footer */}
                            <div className="pt-4 text-center space-y-3 text-[9px]">
                                <div className="flex justify-between items-end pt-4 px-1">
                                    <div className="border-t border-black w-20 text-center pt-0.5">Parent Sig</div>
                                    <div className="border-t border-black w-20 text-center pt-0.5">Cashier Sig</div>
                                </div>
                                <p className="text-[8px] text-gray-500 italic">
                                    {settings.receipt_footer_note || 'Fees once paid are non-refundable. Please keep this receipt.'}
                                </p>
                                <p className="text-[8px] text-gray-400">Printed: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    ) : standardLayout === '3copy' ? (
                        /* OPTION 2: STANDARD A4 - 3-PART VOUCHER (Student | School | Bank) */
                        <div
                            id="printable-3copy-invoice"
                            className="w-full bg-white text-black p-4 space-y-4 print:p-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
                                {['STUDENT COPY', 'ACCOUNTS / SCHOOL COPY', 'BANK COPY'].map((copyTitle) => (
                                    <div
                                        key={copyTitle}
                                        className="border-2 border-dashed border-gray-300 p-3 rounded-sm text-xs space-y-3 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="text-center pb-2 border-b border-gray-200">
                                                <h3 className="font-black text-xs uppercase">{settings.school_name || 'Academic School Portal'}</h3>
                                                <span className="inline-block bg-gray-100 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200 mt-0.5">
                                                    {copyTitle}
                                                </span>
                                            </div>
                                            <div className="py-2 text-[10px] space-y-0.5 border-b border-gray-200">
                                                <div className="flex justify-between">
                                                    <span>Voucher #:</span>
                                                    <strong>{invoice.invoice_no}</strong>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Month:</span>
                                                    <span>{invoice.month} {invoice.session_year}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Student:</span>
                                                    <span className="font-bold truncate max-w-[120px]">{studentName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Roll No / Class:</span>
                                                    <span>{rollNo} • {schoolClass.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="py-2 text-[10px] space-y-1">
                                                <div className="flex justify-between font-semibold">
                                                    <span>Description</span>
                                                    <span>Amount</span>
                                                </div>
                                                {items.map((it, idx) => (
                                                    <div key={it.id || idx} className="flex justify-between text-gray-700">
                                                        <span className="truncate max-w-[110px]">{it.title}</span>
                                                        <span>{currency}{Number(it.amount).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                                <div className="border-t border-gray-200 pt-1 flex justify-between font-bold">
                                                    <span>Total Due:</span>
                                                    <span>{currency}{Number(invoice.due_amount || invoice.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200 flex justify-between text-[9px] text-gray-600">
                                            <span>Date: {invoice.issue_date}</span>
                                            <span>Auth Sign: __________</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* OPTION 3: STANDARD A4 - FULL SINGLE PAGE INSTITUTIONAL INVOICE */
                        <div
                            id="printable-standard-invoice"
                            className="w-full bg-card text-card-foreground p-6 rounded-sm border border-border shadow-xs print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6"
                        >
                            {/* Formal Institutional Header */}
                            <div className="flex justify-between items-start border-b border-border print:border-gray-300 pb-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                        <Building2 className="w-6 h-6 text-primary print:text-black" />
                                        <h2 className="text-xl font-black uppercase tracking-wide text-foreground print:text-black font-sans">
                                            {settings.school_name || 'Academic School Portal'}
                                        </h2>
                                    </div>
                                    {settings.school_tagline && (
                                        <p className="text-xs text-muted-foreground print:text-gray-600 italic">
                                            {settings.school_tagline}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground print:text-gray-600">
                                        {settings.address || 'Institutional Campus'} • Tel: {settings.phone || 'N/A'} • Email: {settings.email || 'office@school.edu'}
                                    </p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <span className="text-xl font-mono font-bold text-primary print:text-black">
                                        {invoice.invoice_no}
                                    </span>
                                    <p className="text-xs text-muted-foreground print:text-gray-600">
                                        Issue Date: <strong>{invoice.issue_date}</strong>
                                    </p>
                                    <p className="text-xs text-muted-foreground print:text-gray-600">
                                        Due Date: <strong className="text-rose-600 print:text-black">{invoice.due_date}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Student Metadata Box */}
                            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xs border border-border print:bg-gray-50 print:border-gray-200 text-xs">
                                <ProfileAvatar
                                    src={student.photo_url}
                                    name={studentName}
                                    className="w-12 h-12 border-2 border-primary/20"
                                    iconClassName="w-6 h-6"
                                />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                    <div>
                                        <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Student Name</span>
                                        <strong className="text-foreground print:text-black text-sm">{studentName}</strong>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Roll Number</span>
                                        <strong className="text-foreground print:text-black">{rollNo}</strong>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Class & Section</span>
                                        <strong className="text-foreground print:text-black">
                                            {schoolClass.name || 'Class'}{section.name ? ` (${section.name})` : ''}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground print:text-gray-500 font-medium text-[11px]">Billing Cycle</span>
                                        <strong className="text-primary print:text-black">
                                            {invoice.month} {invoice.session_year}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <table className="w-full text-left text-xs divide-y divide-border print:divide-gray-200">
                                <thead>
                                    <tr className="text-muted-foreground print:text-gray-600 font-bold uppercase">
                                        <th className="py-2.5">Fee Head / Description</th>
                                        <th className="py-2.5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border print:divide-gray-100">
                                    {items.length > 0 ? (
                                        items.map((it) => (
                                            <tr key={it.id}>
                                                <td className="py-2 font-medium text-foreground print:text-black">{it.title}</td>
                                                <td className="py-2 text-right font-mono font-semibold text-foreground print:text-black">
                                                    {currency}{Number(it.amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="py-2 font-medium">Monthly Tuition Fee</td>
                                            <td className="py-2 text-right font-mono font-semibold">
                                                {currency}{Number(invoice.total_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Financial Summary */}
                            <div className="border-t border-border print:border-gray-200 pt-4 space-y-1.5 text-xs text-right max-w-xs ml-auto">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground print:text-gray-600">Subtotal:</span>
                                    <span className="font-mono">{currency}{Number(invoice.subtotal || invoice.total_amount).toFixed(2)}</span>
                                </div>
                                {Number(invoice.previous_arrears) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground print:text-gray-600">Arrears:</span>
                                        <span className="font-mono">{currency}{Number(invoice.previous_arrears).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(invoice.discount) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Discount:</span>
                                        <span className="font-mono">-{currency}{Number(invoice.discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-sm border-t border-border print:border-gray-200 pt-1.5">
                                    <span>Total Payable:</span>
                                    <span className="font-mono text-primary print:text-black">
                                        {currency}{Number(invoice.total_amount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-emerald-600 print:text-emerald-700 font-semibold">
                                    <span>Paid to Date:</span>
                                    <span className="font-mono">{currency}{Number(invoice.paid_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-rose-600 print:text-black text-base border-t border-border print:border-gray-200 pt-1.5">
                                    <span>Net Balance Due:</span>
                                    <span className="font-mono">{currency}{Number(invoice.due_amount || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Signatures & Legal */}
                            <div className="pt-8 border-t border-border print:border-gray-300 flex justify-between items-end text-xs text-muted-foreground print:text-gray-600">
                                <div className="space-y-1">
                                    <p className="text-[11px] italic">{settings.receipt_footer_note || 'Thank you for your prompt fee payment.'}</p>
                                    <p className="text-[10px]">Valid with official school stamp and signature.</p>
                                </div>
                                <div className="flex gap-12 text-center text-xs">
                                    <div className="space-y-1">
                                        <div className="w-28 border-b border-border print:border-black h-8" />
                                        <span>Accountant</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="w-28 border-b border-border print:border-black h-8" />
                                        <span>Principal / Admin</span>
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
