import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Printer,
    ArrowLeft,
    DollarSign,
    FileText,
    Receipt,
    Building2,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Show({ invoice }) {
    const { props } = usePage();
    const settings = props.system_settings || {};
    const currency = settings.currency_symbol || '$';

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [printerType, setPrinterType] = useState('standard'); // 'standard' (A4) or 'mini' (POS 80mm)
    const [standardLayout, setStandardLayout] = useState('single'); // 'single' or '3copy'

    const { data, setData, post, processing, errors, reset } = useForm({
        amount_paid: Number(invoice.due_amount || 0) > 0 ? invoice.due_amount : '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        transaction_reference: '',
        note: '',
    });

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        post(route('fees.invoices.collect', invoice.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                reset();
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const items = invoice.items || [];
    const payments = invoice.payments || [];
    const student = invoice.student || {};
    const schoolClass = invoice.school_class || invoice.schoolClass || {};
    const section = invoice.section || {};

    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const rollNo = student.roll_number || student.roll_no || student.admission_number || 'N/A';

    return (
        <AppLayout title={`Invoice ${invoice.invoice_no}`}>
            <Head title={`Invoice ${invoice.invoice_no}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Navigation & Controls Bar (Hidden during print) */}
                <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <Link
                        href={route('fees.invoices.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Fee Invoices
                    </Link>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Printer Type Selector */}
                        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
                            <span className="text-[11px] font-semibold text-muted-foreground px-2">Printer:</span>
                            <button
                                type="button"
                                onClick={() => setPrinterType('standard')}
                                className={cn(
                                    "px-2.5 py-1 font-semibold rounded-md transition-colors flex items-center gap-1",
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
                                    "px-2.5 py-1 font-semibold rounded-md transition-colors flex items-center gap-1",
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
                            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setStandardLayout('single')}
                                    className={cn(
                                        "px-2 py-1 text-[11px] font-medium rounded-md transition-colors",
                                        standardLayout === 'single'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Single
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStandardLayout('3copy')}
                                    className={cn(
                                        "px-2 py-1 text-[11px] font-medium rounded-md transition-colors",
                                        standardLayout === '3copy'
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    3-Part
                                </button>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs whitespace-nowrap shrink-0 inline-flex items-center"
                        >
                            <Printer className="w-4 h-4 shrink-0" />
                            <span>Print Voucher</span>
                        </Button>

                        {Number(invoice.due_amount || 0) > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs whitespace-nowrap shrink-0 inline-flex items-center"
                            >
                                <DollarSign className="w-4 h-4 shrink-0" />
                                <span>Collect Payment</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Printable Document View */}
                <div className="flex justify-center">
                    {printerType === 'mini' ? (
                        /* MINI POS (80mm) THERMAL RECEIPT LAYOUT */
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

                            {/* Metadata */}
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
                        /* 3-PART A4 VOUCHER (Student | School | Bank) */
                        <div
                            id="printable-3copy-invoice"
                            className="w-full bg-white text-black p-4 space-y-4 print:p-0"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3">
                                {['STUDENT COPY', 'ACCOUNTS / SCHOOL COPY', 'BANK COPY'].map((copyTitle) => (
                                    <div
                                        key={copyTitle}
                                        className="border-2 border-dashed border-gray-300 p-3 rounded-lg text-xs space-y-3 flex flex-col justify-between"
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
                        /* STANDARD A4 SINGLE PAGE VOUCHER */
                        <div
                            id="printable-standard-invoice"
                            className="w-full bg-card text-card-foreground p-8 rounded-2xl shadow-xs border border-border space-y-6 print:bg-white print:text-black print:shadow-none print:border-none print:p-0"
                        >
                            {/* Header */}
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
                            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border print:bg-gray-50 print:border-gray-200 text-xs">
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

                            {/* Payment Ledger (if any) */}
                            {payments.length > 0 && (
                                <div className="pt-4 border-t border-border print:border-gray-300">
                                    <h4 className="text-xs font-bold text-muted-foreground print:text-gray-600 uppercase mb-2">
                                        Payment Transactions
                                    </h4>
                                    <div className="space-y-1.5 text-xs">
                                        {payments.map((p) => (
                                            <div key={p.id} className="flex justify-between items-center bg-muted/40 p-2.5 rounded-lg border border-border print:bg-gray-50 print:border-gray-200">
                                                <span>
                                                    Receipt: <strong>{p.receipt_no}</strong> ({p.payment_date}) via <span className="capitalize">{p.payment_method}</span>
                                                    {p.transaction_reference ? ` • Ref: ${p.transaction_reference}` : ''}
                                                </span>
                                                <span className="font-mono font-bold text-emerald-600 print:text-emerald-700">
                                                    +{currency}{Number(p.amount_paid).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Signatures */}
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

                {/* Collect Payment Modal */}
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-border animate-in fade-in-50 zoom-in-95">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Collect Fee Payment</h3>
                                    <p className="text-xs text-muted-foreground">Invoice #{invoice.invoice_no} • {studentName}</p>
                                </div>
                                <Badge variant="outline" className="font-mono font-bold">
                                    Due: {currency}{Number(invoice.due_amount).toFixed(2)}
                                </Badge>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                        Amount to Collect ({currency}) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={Number(invoice.due_amount || 0)}
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    />
                                    {errors.amount_paid && (
                                        <p className="text-xs text-destructive mt-1">{errors.amount_paid}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Payment Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Method *
                                        </label>
                                        <select
                                            value={data.payment_method}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="online">Online / UPI</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                        Reference / Bank Slip # (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TXN-123456"
                                        value={data.transaction_reference}
                                        onChange={(e) => setData('transaction_reference', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                        Receipt Notes / Remarks (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Paid in full by father"
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        {processing ? 'Processing...' : 'Confirm Payment'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
