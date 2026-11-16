import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, FileSpreadsheet } from 'lucide-react';

export default function LogPaperExpenseModal({ isOpen, onClose, activeSessionId, activeSessionTitle }) {
    const form = useForm({
        exam_session_id: activeSessionId || '',
        title: '',
        category: 'printing',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        vendor_name: '',
        invoice_bill_no: '',
        payment_method: 'cash',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('exam-paper-accounting.expenses.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Receipt className="w-5 h-5 text-rose-500" />
                        Log Exam Paper Expenditure
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="p-2.5 rounded-lg border border-border bg-muted/30 text-xs">
                        <span className="text-muted-foreground">Charging to Exam Term:</span>{' '}
                        <span className="font-bold text-foreground">{activeSessionTitle || 'Active Exam Term'}</span>
                    </div>

                    <div>
                        <Label htmlFor="title" className="text-xs font-semibold">Expense Title / Description *</Label>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="e.g. 5,000 Photocopies of Mid Term Exam Papers"
                            required
                            className="text-xs mt-1"
                        />
                        {form.errors.title && (
                            <p className="text-xs text-destructive mt-1">{form.errors.title}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="category" className="text-xs font-semibold">Expense Category *</Label>
                            <select
                                id="category"
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                className="w-full mt-1 p-2 text-xs rounded-md border border-input bg-background text-foreground"
                                required
                            >
                                <option value="printing">Paper Printing &amp; Photocopying</option>
                                <option value="stationery">Answer Sheets, Envelopes &amp; Bundles</option>
                                <option value="typing_composing">Typing, Composing &amp; Proofreading</option>
                                <option value="marking_evaluation">Paper Marking Honorarium</option>
                                <option value="other">Miscellaneous &amp; Logistics</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="amount" className="text-xs font-semibold">Amount Incurred (Rs.) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                step="any"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                placeholder="e.g. 12500"
                                required
                                className="text-xs mt-1"
                            />
                            {form.errors.amount && (
                                <p className="text-xs text-destructive mt-1">{form.errors.amount}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="expense_date" className="text-xs font-semibold">Expense Date *</Label>
                            <Input
                                id="expense_date"
                                type="date"
                                value={form.data.expense_date}
                                onChange={(e) => form.setData('expense_date', e.target.value)}
                                required
                                className="text-xs mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment_method" className="text-xs font-semibold">Paid Via *</Label>
                            <select
                                id="payment_method"
                                value={form.data.payment_method}
                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                className="w-full mt-1 p-2 text-xs rounded-md border border-input bg-background text-foreground"
                                required
                            >
                                <option value="cash">Cash</option>
                                <option value="bank_transfer">Bank Transfer / Cheque</option>
                                <option value="online">Online Payment</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="vendor_name" className="text-xs font-semibold">Vendor / Press Name</Label>
                            <Input
                                id="vendor_name"
                                value={form.data.vendor_name}
                                onChange={(e) => form.setData('vendor_name', e.target.value)}
                                placeholder="e.g. Star Printers &amp; Stationers"
                                className="text-xs mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="invoice_bill_no" className="text-xs font-semibold">Bill / Receipt #</Label>
                            <Input
                                id="invoice_bill_no"
                                value={form.data.invoice_bill_no}
                                onChange={(e) => form.setData('invoice_bill_no', e.target.value)}
                                placeholder="e.g. BILL-9821"
                                className="text-xs mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-xs font-semibold">Audit Notes</Label>
                        <Input
                            id="notes"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Additional notes or remarks"
                            className="text-xs mt-1"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing} className="bg-rose-600 hover:bg-rose-700 text-white">
                            {form.processing ? 'Saving...' : 'Record Paper Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
