import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    className = 'flex-1',
}) {
    return (
        <div className={cn("relative", className)}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-4 w-4" />
            </div>
            <Input
                placeholder={placeholder}
                className="pl-10 w-full bg-background text-foreground h-10 border-input focus-visible:ring-ring"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
