import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust path to match your UI library/Button component

export default function PageHeader({
    title,
    subtitle,
    buttonText,
    onButtonClick,
    icon: Icon,
    buttonClassName = "bg-slate-800 hover:bg-slate-900 text-white shadow-sm hover:cursor-pointer",
    children, // Allows passing custom action buttons or dropdowns
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
                {/* Custom Action Slot (for filters, search, or extra buttons) */}
                {children}

                {/* Primary Action Button */}
                {buttonText && (
                    <Button
                        onClick={onButtonClick}
                        className={`flex items-center space-x-2 ${buttonClassName}`}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{buttonText}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}