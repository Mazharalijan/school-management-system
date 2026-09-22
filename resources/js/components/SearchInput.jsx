import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    className = 'flex-1',
}) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
            </div>
            <Input
                placeholder={placeholder}
                className="pl-10 w-full bg-white h-10 border-slate-200 focus-visible:ring-blue-500"
                value={value}
                onChange={onChange} /* Pass the event directly */
            />
        </div>
    );
}