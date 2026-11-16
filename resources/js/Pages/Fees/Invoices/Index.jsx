import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Receipt, Plus, Eye, DollarSign, Printer } from 'lucide-react';
import InvoicePrintModal from './components/InvoicePrintModal';

export default function Index({ invoices, classes = [], filters = {} }) {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [collectingInvoice, setCollectingInvoice] = useState(null);
    const [printingInvoice, setPrintingInvoice] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        school_class_id: '',
        month: 'September',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const {
        data: paymentData,
        setData: setPaymentData,
        post: postPayment,
        processing: paymentProcessing,
        errors: paymentErrors,
        reset: resetPayment,
    } = useForm({
        amount_paid: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        transaction_reference: '',
        note: '',
    });

    useEffect(() => {
        if (collectingInvoice) {
            setPaymentData({
                amount_paid: Number(collectingInvoice.due_amount || 0) > 0 ? collectingInvoice.due_amount : '',
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: 'cash',
                transaction_reference: '',
                note: '',
            });
        }
    }, [collectingInvoice]);

    const handleCollectPaymentSubmit = (e) => {
        e.preventDefault();
        postPayment(route('fees.invoices.collect', collectingInvoice.id), {
            onSuccess: () => {
                setCollectingInvoice(null);
                resetPayment();
            },
        });
    };

    const handleFilterChange = (key, value) => {
        router.get(
            route('fees.invoices.index'),
            {
                ...filters,
                [key]: value,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        router.get(route('fees.invoices.index'), {}, { preserveState: true, replace: true });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        post(route('fees.invoices.generate'), {
            onSuccess: () => {
                setIsGenerateModalOpen(false);
                reset();
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">
                        Paid
                    </Badge>
                );
            case 'partially_paid':
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
                        Partially Paid
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-0">
                        Unpaid
                    </Badge>
                );
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const hasFilters = Boolean(filters.search || filters.school_class_id || filters.status || filters.month);

    return (
        <AppLayout title="Fee Invoices">
            <Head title="Fee Invoices" />

            <div className="space-y-6">
                <PageHeader
                    title="Fee Invoices"
                    subtitle="View vouchers, process payments, and generate monthly bulk billing."
                    icon={Receipt}
                    buttonText="+ Generate Bulk Invoices"
                    onButtonClick={() => setIsGenerateModalOpen(true)}
                />

                {/* Filter Bar */}
                <FilterBar showReset={hasFilters} onReset={handleResetFilters}>
                    <SearchInput
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e?.target ? e.target.value : e)}
                        placeholder="Search student or invoice #..."
                        className="flex-1 min-w-[200px]"
                    />

                    <FilterSelect
                        value={filters.school_class_id || ''}
                        onChange={(val) => handleFilterChange('school_class_id', val)}
                        options={classes}
                        valueKey="id"
                        labelKey="name"
                        placeholder="All Classes"
                        className="w-44 shrink-0"
                    />

                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-40 shrink-0 h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Statuses</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                    </select>

                    <select
                        value={filters.month || ''}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="w-40 shrink-0 h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">All Months</option>
                        {months.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </FilterBar>

                {/* Invoices Table Card */}
                <Card className="border-border bg-card text-card-foreground shadow-xs">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Invoice #</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Student</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Class</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Month</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Total</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Paid</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Status</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {invoices?.data?.length > 0 ? (
                                        invoices.data.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                                    {inv.invoice_no}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <div className="flex items-center gap-2.5">
                                                        <ProfileAvatar
                                                            src={inv.student?.photo_url}
                                                            name={inv.student ? `${inv.student.first_name || ''} ${inv.student.last_name || ''}`.trim() : ''}
                                                            className="w-7 h-7"
                                                            iconClassName="w-3.5 h-3.5"
                                                        />
                                                        <span>
                                                            {inv.student ? `${inv.student.first_name || ''} ${inv.student.last_name || ''}`.trim() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">
                                                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                                        {inv.school_class?.name || 'Class'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-xs">{inv.month}</td>
                                                <td className="px-6 py-4 font-semibold text-foreground font-mono text-xs">
                                                    ${Number(inv.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-xs">
                                                    ${Number(inv.paid_amount || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(inv.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {inv.status !== 'paid' && Number(inv.due_amount || 0) > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCollectingInvoice(inv)}
                                                                className="h-7 px-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                                title="Collect Fee Payment"
                                                            >
                                                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Collect</span>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setPrintingInvoice(inv)}
                                                            className="h-7 px-2.5 text-xs font-semibold border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                            title="Print Invoice / Voucher"
                                                        >
                                                            <Printer className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                            <span>Print</span>
                                                        </Button>
                                                        <Link
                                                            href={route('fees.invoices.show', inv.id)}
                                                            className="inline-flex items-center justify-center h-7 px-2 rounded-md text-xs font-semibold border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                                            title="View Full Voucher"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 shrink-0" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-muted-foreground">
                                                No fee invoices found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {invoices?.links && (
                            <Pagination
                                links={invoices.links}
                                from={invoices.from}
                                to={invoices.to}
                                total={invoices.total}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Generator Modal */}
                {isGenerateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-border">
                            <h2 className="text-lg font-bold text-foreground">Generate Bulk Invoices</h2>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Target Class *</Label>
                                    <select
                                        value={data.school_class_id}
                                        onChange={(e) => setData('school_class_id', e.target.value)}
                                        className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Billing Month</Label>
                                    <select
                                        value={data.month}
                                        onChange={(e) => setData('month', e.target.value)}
                                        className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        {months.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Issue Date</Label>
                                        <Input
                                            type="date"
                                            value={data.issue_date}
                                            onChange={(e) => setData('issue_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Due Date</Label>
                                        <Input
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsGenerateModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        variant="default"
                                    >
                                        Generate
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* In-Page Collect Payment Modal */}
                {collectingInvoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-card text-card-foreground rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-border animate-in fade-in-50 zoom-in-95">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <div>
                                    <h3 className="font-bold text-base text-foreground">Collect Fee Payment</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Voucher #{collectingInvoice.invoice_no} • {collectingInvoice.student ? `${collectingInvoice.student.first_name} ${collectingInvoice.student.last_name}` : 'Student'}
                                    </p>
                                </div>
                                <Badge variant="outline" className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                    Due: ${Number(collectingInvoice.due_amount).toFixed(2)}
                                </Badge>
                            </div>

                            <form onSubmit={handleCollectPaymentSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                        Amount to Collect ($) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={Number(collectingInvoice.due_amount || 0)}
                                        value={paymentData.amount_paid}
                                        onChange={(e) => setPaymentData('amount_paid', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        required
                                    />
                                    {paymentErrors.amount_paid && (
                                        <p className="text-xs text-destructive mt-1">{paymentErrors.amount_paid}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Payment Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={paymentData.payment_date}
                                            onChange={(e) => setPaymentData('payment_date', e.target.value)}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                                            Method *
                                        </label>
                                        <select
                                            value={paymentData.payment_method}
                                            onChange={(e) => setPaymentData('payment_method', e.target.value)}
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
                                        value={paymentData.transaction_reference}
                                        onChange={(e) => setPaymentData('transaction_reference', e.target.value)}
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
                                        value={paymentData.note}
                                        onChange={(e) => setPaymentData('note', e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCollectingInvoice(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={paymentProcessing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    >
                                        {paymentProcessing ? 'Processing...' : 'Confirm Payment'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Print Invoice Modal with Printer Selection */}
                {printingInvoice && (
                    <InvoicePrintModal
                        isOpen={Boolean(printingInvoice)}
                        onClose={() => setPrintingInvoice(null)}
                        invoice={printingInvoice}
                    />
                )}
            </div>
        </AppLayout>
    );
}