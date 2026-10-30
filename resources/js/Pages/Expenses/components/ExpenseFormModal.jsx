import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Receipt, Loader2 } from 'lucide-react';

export default function ExpenseFormModal({
    isOpen,
    onClose,
    expense = null,
    categories = [],
    paymentMethods = [],
}) {
    const isEdit = Boolean(expense);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        expense_category_id: '',
        title: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_no: '',
        paid_to: '',
        notes: '',
        status: 'paid',
    });

    useEffect(() => {
        if (expense) {
            setData({
                expense_category_id: expense.expense_category_id || '',
                title: expense.title || '',
                amount: expense.amount || '',
                expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
                payment_method: expense.payment_method || 'cash',
                reference_no: expense.reference_no || '',
                paid_to: expense.paid_to || '',
                notes: expense.notes || '',
                status: expense.status || 'paid',
            });
        } else {
            reset();
            setData('expense_date', new Date().toISOString().split('T')[0]);
            setData('payment_method', 'cash');
            setData('status', 'paid');
            if (categories.length > 0) {
                setData('expense_category_id', categories[0].id);
            }
        }
        clearErrors();
    }, [expense, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('expenses.update', expense.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('expenses.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {isEdit ? <Pencil className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                        {isEdit ? 'Edit Expense Record' : 'Record New School Expense'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Category & Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category" className="text-xs font-bold text-slate-600 uppercase">
                                Expense Category *
                            </Label>
                            <select
                                id="category"
                                value={data.expense_category_id}
                                onChange={(e) => setData('expense_category_id', e.target.value)}
                                className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} ({cat.code})
                                    </option>
                                ))}
                            </select>
                            {errors.expense_category_id && <span className="text-xs text-rose-500 mt-0.5">{errors.expense_category_id}</span>}
                        </div>

                        <div>
                            <Label htmlFor="amount" className="text-xs font-bold text-slate-600 uppercase">
                                Amount (PKR / Rs.) *
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="mt-1 font-mono font-semibold"
                                required
                            />
                            {errors.amount && <span className="text-xs text-rose-500 mt-0.5">{errors.amount}</span>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="title" className="text-xs font-bold text-slate-600 uppercase">
                            Expense Title / Purpose *
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="e.g. Monthly Electricity Bill (PESCO) or Generator Diesel 100L"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1"
                            required
                        />
                        {errors.title && <span className="text-xs text-rose-500 mt-0.5">{errors.title}</span>}
                    </div>

                    {/* Date & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expense_date" className="text-xs font-bold text-slate-600 uppercase">
                                Expense Date *
                            </Label>
                            <Input
                                id="expense_date"
                                type="date"
                                value={data.expense_date}
                                onChange={(e) => setData('expense_date', e.target.value)}
                                className="mt-1"
                                required
                            />
                            {errors.expense_date && <span className="text-xs text-rose-500 mt-0.5">{errors.expense_date}</span>}
                        </div>

                        <div>
                            <Label htmlFor="payment_method" className="text-xs font-bold text-slate-600 uppercase">
                                Payment Method *
                            </Label>
                            <select
                                id="payment_method"
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                                required
                            >
                                <option value="cash">Cash in Hand</option>
                                <option value="bank_transfer">Bank Transfer / Online</option>
                                <option value="cheque">Bank Cheque</option>
                                <option value="online">Digital Wallet / Card</option>
                            </select>
                            {errors.payment_method && <span className="text-xs text-rose-500 mt-0.5">{errors.payment_method}</span>}
                        </div>
                    </div>

                    {/* Payee / Vendor & Reference # */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="paid_to" className="text-xs font-bold text-slate-600 uppercase">
                                Paid To / Payee / Vendor
                            </Label>
                            <Input
                                id="paid_to"
                                type="text"
                                placeholder="e.g. PESCO, PSO Fuel Station, Al-Madina Mart"
                                value={data.paid_to}
                                onChange={(e) => setData('paid_to', e.target.value)}
                                className="mt-1"
                            />
                            {errors.paid_to && <span className="text-xs text-rose-500 mt-0.5">{errors.paid_to}</span>}
                        </div>

                        <div>
                            <Label htmlFor="reference_no" className="text-xs font-bold text-slate-600 uppercase">
                                Reference / Invoice / Cheque #
                            </Label>
                            <Input
                                id="reference_no"
                                type="text"
                                placeholder="e.g. CHQ-99120 or INV-4491"
                                value={data.reference_no}
                                onChange={(e) => setData('reference_no', e.target.value)}
                                className="mt-1 font-mono text-xs"
                            />
                            {errors.reference_no && <span className="text-xs text-rose-500 mt-0.5">{errors.reference_no}</span>}
                        </div>
                    </div>

                    {/* Notes & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="notes" className="text-xs font-bold text-slate-600 uppercase">
                                Description / Notes
                            </Label>
                            <textarea
                                id="notes"
                                rows="2"
                                placeholder="Additional details or justification..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 w-full p-2.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            {errors.notes && <span className="text-xs text-rose-500 mt-0.5">{errors.notes}</span>}
                        </div>

                        <div>
                            <Label htmlFor="status" className="text-xs font-bold text-slate-600 uppercase">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                                <option value="paid">Paid & Completed</option>
                                <option value="pending">Pending Approval</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                </>
                            ) : isEdit ? (
                                'Update Expense'
                            ) : (
                                'Record Expense'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
