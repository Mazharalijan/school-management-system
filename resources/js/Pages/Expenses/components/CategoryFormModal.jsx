import React from 'react';
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
import { FolderPlus, Loader2 } from 'lucide-react';

export default function CategoryFormModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('expenses.categories.store'), {
            onSuccess: () => {
                onClose();
                reset();
                clearErrors();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-primary" />
                        Create Expense Category
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="category_name" className="text-xs font-bold text-muted-foreground uppercase">
                            Category Name *
                        </Label>
                        <Input
                            id="category_name"
                            type="text"
                            placeholder="e.g. Science Lab Equipment or Annual Gala"
                            value={data.name}
                            onChange={(e) => {
                                setData('name', e.target.value);
                                if (!data.code && e.target.value) {
                                    const autoCode = 'EXP-' + e.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase();
                                    setData('code', autoCode);
                                }
                            }}
                            className="mt-1"
                            required
                        />
                        {errors.name && <span className="text-xs text-rose-500 mt-0.5">{errors.name}</span>}
                    </div>

                    <div>
                        <Label htmlFor="category_code" className="text-xs font-bold text-muted-foreground uppercase">
                            Category Code
                        </Label>
                        <Input
                            id="category_code"
                            type="text"
                            placeholder="e.g. EXP-LAB or EXP-EVENT"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            className="mt-1 font-mono uppercase text-xs"
                        />
                        {errors.code && <span className="text-xs text-rose-500 mt-0.5">{errors.code}</span>}
                    </div>

                    <div>
                        <Label htmlFor="category_desc" className="text-xs font-bold text-muted-foreground uppercase">
                            Description
                        </Label>
                        <textarea
                            id="category_desc"
                            rows="2"
                            placeholder="Describe purpose of this expense bucket..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 w-full p-2.5 text-xs rounded-xs border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <DialogFooter className="pt-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                </>
                            ) : (
                                'Save Category'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
