import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TableActionButton({
    onClick,
    title,
    icon: Icon,
    variant = 'default', // 'default' | 'primary' | 'danger'
}) {
    const variantStyles = {
        default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
        primary: 'text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40',
        danger: 'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            title={title}
            className={cn("h-8 w-8 transition-colors", variantStyles[variant] || variantStyles.default)}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
