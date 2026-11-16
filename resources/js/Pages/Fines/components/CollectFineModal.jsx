import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Receipt } from 'lucide-react';

export default function CollectFineModal({ isOpen, onClose, fine }) {
    if (!fine) return null;

    const student = fine.student || {};
    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';

    const form = useForm({
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('fines.collect', fine.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Collect Fine Payment
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Student:</span>
                            <span className="font-bold text-foreground">{studentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fine Category:</span>
                            <span className="capitalize text-foreground font-semibold">{fine.fine_type} Fine</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Reason:</span>
                            <span className="text-foreground italic">{fine.reason}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                            <span className="text-foreground">Amount Due:</span>
                            <span className="text-emerald-600 font-mono">Rs. {Number(fine.amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="payment_method" className="text-xs font-semibold">Payment Method *</Label>
                        <select
                            id="payment_method"
                            value={form.data.payment_method}
                            onChange={(e) => form.setData('payment_method', e.target.value)}
                            className="w-full mt-1 p-2 text-xs rounded-md border border-input bg-background text-foreground"
                            required
                        >
                            <option value="cash">Cash in Hand</option>
                            <option value="bank_transfer">Bank Deposit / Transfer</option>
                            <option value="online">Online / EasyPaisa / JazzCash</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="paid_date" className="text-xs font-semibold">Collection Date *</Label>
                        <Input
                            id="paid_date"
                            type="date"
                            value={form.data.paid_date}
                            onChange={(e) => form.setData('paid_date', e.target.value)}
                            required
                            className="text-xs"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {form.processing ? 'Recording...' : 'Collect & Issue Receipt'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
