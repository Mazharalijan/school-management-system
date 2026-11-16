import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FilterBar({
    children,
    showReset = false,
    onReset,
    className = '',
}) {
    return (
        <Card className={cn("mb-6 border-border bg-card shadow-sm text-card-foreground", className)}>
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
                            className="h-10 px-3 flex items-center space-x-1.5 text-muted-foreground hover:text-foreground shrink-0 border-border bg-background hover:bg-muted"
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
