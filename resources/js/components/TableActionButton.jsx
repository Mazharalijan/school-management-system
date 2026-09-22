import React from 'react';
import { Button } from '@/components/ui/button';

export default function TableActionButton({
    onClick,
    title,
    icon: Icon,
    variant = 'default', // 'default' | 'primary' | 'danger'
}) {
    const variantStyles = {
        default: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
        primary: 'text-slate-500 hover:text-blue-600 hover:bg-blue-50',
        danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50',
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            title={title}
            className={`h-8 w-8 ${variantStyles[variant] || variantStyles.default}`}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}