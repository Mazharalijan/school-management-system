import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileAvatar({
    src,
    name = '',
    className = 'w-9 h-9',
    iconClassName = 'w-4 h-4',
    rounded = 'rounded-full',
}) {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [src]);

    if (src && !imageFailed) {
        return (
            <img
                src={src}
                alt={name || 'Profile'}
                className={cn('object-cover shrink-0 border border-slate-200 shadow-2xs', rounded, className)}
                onError={() => setImageFailed(true)}
            />
        );
    }

    return (
        <div
            className={cn(
                'bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center shrink-0 select-none shadow-2xs',
                rounded,
                className
            )}
            title={name || 'User Profile'}
        >
            <User className={cn('shrink-0 text-slate-400', iconClassName)} />
        </div>
    );
}
