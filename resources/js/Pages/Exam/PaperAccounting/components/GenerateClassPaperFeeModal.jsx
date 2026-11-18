import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Users } from 'lucide-react';

export default function GenerateClassPaperFeeModal({ isOpen, onClose, activeSessionId, classes = [] }) {
    const form = useForm({
        exam_session_id: activeSessionId || '',
        school_class_id: classes[0]?.id || '',
        amount: '',
        notes: 'Term Exam Question Paper & Answer Sheet Fee',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('exam-paper-accounting.fees.generate-class'), {
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
                        <Users className="w-5 h-5 text-primary" />
                        Bulk Charge Class Paper Fee
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <p className="text-xs text-muted-foreground">
                        This charges the specified term paper money to all currently enrolled students in the selected class.
                    </p>

                    <div>
                        <Label htmlFor="school_class_id" className="text-xs font-semibold">Target School Class *</Label>
                        <select
                            id="school_class_id"
                            value={form.data.school_class_id}
                            onChange={(e) => form.setData('school_class_id', e.target.value)}
                            className="w-full mt-1 p-2 text-xs rounded-xs border border-input bg-background text-foreground"
                            required
                        >
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {form.errors.school_class_id && (
                            <p className="text-xs text-destructive mt-1">{form.errors.school_class_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="amount" className="text-xs font-semibold">Paper Fee Amount Per Student (Rs.) *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            step="any"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                            placeholder="e.g. 350"
                            required
                            className="text-xs mt-1"
                        />
                        {form.errors.amount && (
                            <p className="text-xs text-destructive mt-1">{form.errors.amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-xs font-semibold">Description / Notes</Label>
                        <Input
                            id="notes"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="e.g. Mid-Term 2026 Question Paper & Answer Bundle"
                            className="text-xs mt-1"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {form.processing ? 'Generating...' : 'Charge Class Students'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
