import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Show({ invoice }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount_paid: invoice.due_amount,
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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Head title={`Invoice ${invoice.invoice_no}`} />

            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Voucher</h1>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg font-medium">Print Voucher</button>
                    {invoice.due_amount > 0 && (
                        <button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium">
                            Record Payment
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Voucher Box */}
            <div className="bg-white text-gray-800 p-8 rounded-lg shadow-md border border-gray-200 space-y-6 print:shadow-none print:border-none print:p-0">
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-wider text-indigo-900">Academic Academy</h2>
                        <p className="text-xs text-gray-500">Fee Payment Receipt / Student Voucher</p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-indigo-600">{invoice.invoice_no}</span>
                        <p className="text-xs text-gray-500">Issued: {invoice.issue_date} | Due: {invoice.due_date}</p>
                    </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded">
                    <div>
                        <p><span className="font-semibold">Student Name:</span> {invoice.student?.first_name} {invoice.student?.last_name}</p>
                        <p><span className="font-semibold">Roll No:</span> {invoice.student?.roll_no || 'N/A'}</p>
                    </div>
                    <div>
                        <p><span className="font-semibold">Class / Section:</span> {invoice.school_class?.name} ({invoice.section?.name})</p>
                        <p><span className="font-semibold">Billing Month:</span> {invoice.month} {invoice.session_year}</p>
                    </div>
                </div>

                {/* Itemized Table */}
                <table className="w-full text-left text-sm divide-y divide-gray-200">
                    <thead>
                        <tr className="text-gray-500 font-semibold">
                            <th className="py-2">Fee Description</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td className="py-2.5">{item.title}</td>
                                <td className="py-2.5 text-right font-medium">${item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="border-t pt-4 space-y-1 text-sm text-right max-w-xs ml-auto">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span>${invoice.subtotal}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Discount:</span><span>-${invoice.discount}</span></div>
                    <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total Payable:</span><span>${invoice.total_amount}</span></div>
                    <div className="flex justify-between text-emerald-600"><span>Paid to Date:</span><span>${invoice.paid_amount}</span></div>
                    <div className="flex justify-between font-bold text-rose-600 text-lg border-t pt-1"><span>Balance Due:</span><span>${invoice.due_amount.toFixed(2)}</span></div>
                </div>

                {/* Payments History */}
                {invoice.payments.length > 0 && (
                    <div className="pt-4 border-t">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Transactions</h3>
                        <div className="space-y-1 text-xs">
                            {invoice.payments.map((p) => (
                                <div key={p.id} className="flex justify-between bg-gray-50 p-2 rounded">
                                    <span>Receipt: <strong>{p.receipt_no}</strong> ({p.payment_date}) via {p.payment_method}</span>
                                    <span className="font-semibold text-emerald-600">${p.amount_paid}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Collect Payment</h2>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Paid ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    max={invoice.due_amount}
                                    value={data.amount_paid}
                                    onChange={(e) => setData('amount_paid', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
                                <input
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                                <select
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Reference / Ref No.</label>
                                <input
                                    type="text"
                                    value={data.transaction_reference}
                                    onChange={(e) => setData('transaction_reference', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}