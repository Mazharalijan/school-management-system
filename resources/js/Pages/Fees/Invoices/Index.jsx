import React, { useState } from 'react';
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
import { Receipt, Plus, Eye, DollarSign } from 'lucide-react';

export default function Index({ invoices, classes = [], filters = {} }) {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        school_class_id: '',
        month: 'September',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

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
                        className="w-40 shrink-0 h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="">All Statuses</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                    </select>

                    <select
                        value={filters.month || ''}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="w-40 shrink-0 h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="">All Months</option>
                        {months.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </FilterBar>

                {/* Invoices Table Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Invoice #</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Student</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Class</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Month</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Total</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Paid</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Status</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-slate-600 uppercase text-xs">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {invoices?.data?.length > 0 ? (
                                        invoices.data.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-indigo-600 text-xs">
                                                    {inv.invoice_no}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">
                                                    {inv.student ? `${inv.student.first_name || ''} ${inv.student.last_name || ''}`.trim() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                                        {inv.school_class?.name || 'Class'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">{inv.month}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900 font-mono text-xs">
                                                    ${Number(inv.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 font-semibold font-mono text-xs">
                                                    ${Number(inv.paid_amount || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(inv.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route('fees.invoices.show', inv.id)}
                                                        className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                                        Collect
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-slate-400">
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
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">Generate Bulk Invoices</h2>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Target Class *</Label>
                                    <select
                                        value={data.school_class_id}
                                        onChange={(e) => setData('school_class_id', e.target.value)}
                                        className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        required
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Billing Month</Label>
                                    <select
                                        value={data.month}
                                        onChange={(e) => setData('month', e.target.value)}
                                        className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        {months.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Issue Date</Label>
                                        <Input
                                            type="date"
                                            value={data.issue_date}
                                            onChange={(e) => setData('issue_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Due Date</Label>
                                        <Input
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
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
                                        className="bg-slate-900 hover:bg-slate-800 text-white"
                                    >
                                        Generate
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