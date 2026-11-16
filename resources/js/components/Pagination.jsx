import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ links, from, to, total, className = '' }) {
    // Hide pagination if there are no records or only 1 page
    if (!links || links.length <= 3 || total === 0) {
        return null;
    }

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-card border-t border-border text-card-foreground", className)}>
            {/* Meta Details */}
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{from ?? 0}</span> to{' '}
                <span className="font-semibold text-foreground">{to ?? 0}</span> of{' '}
                <span className="font-semibold text-foreground">{total}</span> results
            </div>

            {/* Pagination Links */}
            <div className="flex items-center space-x-1">
                {links.map((link, key) => {
                    // Previous Button Icon Swap
                    if (link.label.includes('&laquo;') || link.label.toLowerCase().includes('previous')) {
                        return (
                            <Link
                                key={key}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={cn(
                                    "inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors border",
                                    !link.url
                                        ? "text-muted-foreground/40 border-border/40 pointer-events-none cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                )}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Link>
                        );
                    }

                    // Next Button Icon Swap
                    if (link.label.includes('&raquo;') || link.label.toLowerCase().includes('next')) {
                        return (
                            <Link
                                key={key}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={cn(
                                    "inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors border",
                                    !link.url
                                        ? "text-muted-foreground/40 border-border/40 pointer-events-none cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                )}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        );
                    }

                    // Numbered Page Buttons
                    return (
                        <Link
                            key={key}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            className={cn(
                                "inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors border",
                                link.active
                                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                                    : !link.url
                                    ? "text-muted-foreground/40 border-border/40 pointer-events-none cursor-not-allowed"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                            )}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
