import React from 'react';
import { cn } from '@/lib/utils';

export default function FilterSelect({
    value = '',
    onChange,
    options = [],
    placeholder = 'Select option',
    valueKey = 'id',
    labelKey = 'name',
    className = 'w-48 shrink-0',
}) {
    return (
        <div className={className}>
            <select
                className={cn(
                    "w-full h-10 px-3 py-2 text-sm rounded-xs border border-input bg-background text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors",
                    "dark:bg-card dark:text-foreground"
                )}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" className="bg-background text-foreground">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt[valueKey]} value={opt[valueKey]} className="bg-background text-foreground">
                        {opt[labelKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}
