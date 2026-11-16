import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderPlus, Layers, FileSpreadsheet } from 'lucide-react';

export default function ExpenseCategoriesTab({ categories = [], onOpenCreateCategory }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Configured Expense Categories</h3>
                    <p className="text-xs text-muted-foreground">Categories define accounting buckets for institutional expenditure</p>
                </div>
                <Button
                    onClick={onOpenCreateCategory}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                >
                    <FolderPlus className="w-3.5 h-3.5 mr-1.5" /> + New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <Card key={cat.id} className="border-border shadow-xs hover:border-border/80 transition-all bg-card text-card-foreground">
                        <CardHeader className="bg-muted/40 border-b border-border p-4 pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-foreground">
                                    {cat.name}
                                </CardTitle>
                                <span className="font-mono text-[11px] text-primary font-semibold block mt-0.5">
                                    {cat.code}
                                </span>
                            </div>
                            <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px]">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                {cat.description || 'General school operational expenditure allocation.'}
                            </p>
                            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                <span>Recorded Vouchers:</span>
                                <Badge variant="outline" className="font-mono font-bold text-foreground bg-muted border-border">
                                    {cat.expenses_count ?? 0} Vouchers
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
