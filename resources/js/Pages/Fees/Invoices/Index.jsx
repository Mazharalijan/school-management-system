import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';

export default function Index({ invoices, classes, filters }) {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        school_class_id: '',
        month: 'September',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const handleFilterChange = (key, value) => {
        router.get(route('fees.invoices.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true });
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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Fee Invoices" />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Invoices</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View vouchers, process payments, and generate monthly bulk billing</p>
                </div>
                <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
                >
                    + Generate Bulk Invoices
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by student name or invoice #"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
                />

                <select
                    value={filters.school_class_id || ''}
                    onChange={(e) => handleFilterChange('school_class_id', e.target.value)}
                    className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                </select>

                <select
                    value={filters.month || ''}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                    <option value="">All Months</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Invoice #</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Student</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Class</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Month</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Total</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Paid</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {invoices.data.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{inv.invoice_no}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {inv.student ? `${inv.student.first_name} ${inv.student.last_name}` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{inv.school_class?.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{inv.month}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${inv.total_amount}</td>
                                <td className="px-6 py-4 text-emerald-600 font-medium">${inv.paid_amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                        inv.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {inv.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={route('fees.invoices.show', inv.id)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                                        View / Collect
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bulk Generator Modal */}
            {isGenerateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Bulk Invoices</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Class</label>
                                <select
                                    value={data.school_class_id}
                                    onChange={(e) => setData('school_class_id', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Month</label>
                                <select
                                    value={data.month}
                                    onChange={(e) => setData('month', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                                >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                                    <input
                                        type="date"
                                        value={data.issue_date}
                                        onChange={(e) => setData('issue_date', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                                    <input
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">Generate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}