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
                    <h3 className="text-sm font-bold text-slate-900">Configured Expense Categories</h3>
                    <p className="text-xs text-slate-500">Categories define accounting buckets for institutional expenditure</p>
                </div>
                <Button
                    onClick={onOpenCreateCategory}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-semibold"
                >
                    <FolderPlus className="w-3.5 h-3.5 mr-1.5" /> + New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <Card key={cat.id} className="border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">
                                    {cat.name}
                                </CardTitle>
                                <span className="font-mono text-[11px] text-indigo-600 font-semibold block mt-0.5">
                                    {cat.code}
                                </span>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[10px]">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                                {cat.description || 'General school operational expenditure allocation.'}
                            </p>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Recorded Vouchers:</span>
                                <Badge variant="outline" className="font-mono font-bold text-slate-800 bg-slate-50">
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
