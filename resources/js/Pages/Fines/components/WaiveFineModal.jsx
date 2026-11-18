import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

export default function WaiveFineModal({ isOpen, onClose, fine }) {
    if (!fine) return null;

    const student = fine.student || {};
    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';

    const form = useForm({
        waived_reason: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('fines.waive', fine.id), {
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
                    <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="w-5 h-5" />
                        Waive Student Fine
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    <div className="p-3 rounded-xs border border-border bg-muted/30 text-xs space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Student:</span>
                            <span className="font-bold text-foreground">{studentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Fine Category:</span>
                            <span className="capitalize text-foreground font-semibold">{fine.fine_type} Fine</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Original Reason:</span>
                            <span className="text-foreground italic">{fine.reason}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                            <span className="text-foreground">Fine Amount:</span>
                            <span className="text-amber-600 font-mono">Rs. {Number(fine.amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="waived_reason" className="text-xs font-semibold">
                            Administrative Waiver Justification *
                        </Label>
                        <Input
                            id="waived_reason"
                            value={form.data.waived_reason}
                            onChange={(e) => form.setData('waived_reason', e.target.value)}
                            placeholder="e.g. Medical certificate provided by parent / Principal waiver"
                            required
                            className="text-xs mt-1"
                        />
                        {form.errors.waived_reason && (
                            <p className="text-xs text-destructive mt-1">{form.errors.waived_reason}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing || !form.data.waived_reason} className="bg-amber-600 hover:bg-amber-700 text-white">
                            {form.processing ? 'Waiving...' : 'Confirm Waiver'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
