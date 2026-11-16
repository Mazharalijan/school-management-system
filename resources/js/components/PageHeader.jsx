import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PageHeader({
    title,
    subtitle,
    buttonText,
    onButtonClick,
    icon: Icon,
    buttonVariant = "default",
    buttonClassName = "",
    children, // Allows passing custom action buttons or dropdowns
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
                {/* Custom Action Slot (for filters, search, or extra buttons) */}
                {children}

                {/* Primary Action Button */}
                {buttonText && (
                    <Button
                        variant={buttonVariant}
                        onClick={onButtonClick}
                        className={cn(
                            "inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-xs",
                            buttonClassName
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span>{buttonText}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}