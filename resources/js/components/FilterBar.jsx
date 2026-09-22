import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function FilterBar({
    children,
    showReset = false,
    onReset,
    className = '',
}) {
    return (
        <Card className={`mb-6 border-slate-200 shadow-sm ${className}`}>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-wrap">
                    {/* Render inputs & filter selects via children */}
                    {children}

                    {/* Conditional Reset Button */}
                    {showReset && (
                        <Button
                            type="button"
                            onClick={onReset}
                            variant="outline"
                            className="h-10 px-3 flex items-center space-x-1 text-slate-600 shrink-0 border-slate-200 hover:bg-slate-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}