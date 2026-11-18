import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({
    data,
    links: propLinks,
    from: propFrom,
    to: propTo,
    total: propTotal,
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) {
    // 1. Client-Side Interactive Pagination Mode
    if (onPageChange && totalPages && totalPages > 1) {
        const pages = [];
        const current = currentPage || 1;

        // Simple sliding window for page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= current - 1 && i <= current + 1)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return (
            <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-card border-t border-border text-card-foreground text-xs", className)}>
                <div className="text-muted-foreground">
                    {propTotal !== undefined && (
                        <span>
                            Showing <span className="font-semibold text-foreground">{propFrom ?? ((current - 1) * 10 + 1)}</span> to{' '}
                            <span className="font-semibold text-foreground">{propTo ?? Math.min(current * 10, propTotal)}</span> of{' '}
                            <span className="font-semibold text-foreground">{propTotal.toLocaleString()}</span> entries
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, current - 1))}
                        disabled={current <= 1}
                        className={cn(
                            "inline-flex items-center justify-center h-8 px-2.5 rounded-xs text-xs font-medium transition-colors border",
                            current <= 1
                                ? "text-muted-foreground/40 border-border/40 cursor-not-allowed"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted border-border cursor-pointer"
                        )}
                    >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                        Previous
                    </button>

                    {pages.map((p, idx) => {
                        if (p === '...') {
                            return (
                                <span key={idx} className="px-2 py-1 text-muted-foreground">
                                    ...
                                </span>
                            );
                        }

                        const isActive = p === current;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    "inline-flex items-center justify-center h-8 w-8 rounded-xs text-xs font-medium transition-colors border cursor-pointer",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                )}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, current + 1))}
                        disabled={current >= totalPages}
                        className={cn(
                            "inline-flex items-center justify-center h-8 px-2.5 rounded-xs text-xs font-medium transition-colors border",
                            current >= totalPages
                                ? "text-muted-foreground/40 border-border/40 cursor-not-allowed"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted border-border cursor-pointer"
                        )}
                    >
                        Next
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                </div>
            </div>
        );
    }

    // 2. Inertia Server-Side Link-Based Pagination Mode
    const links = data?.links || propLinks;
    const from = data?.from ?? propFrom;
    const to = data?.to ?? propTo;
    const total = data?.total ?? propTotal;

    // Hide pagination if no links or only 1 page
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-card border-t border-border text-card-foreground text-xs", className)}>
            {/* Meta Details */}
            <div className="text-muted-foreground">
                {total !== undefined && total !== null ? (
                    <span>
                        Showing <span className="font-semibold text-foreground">{from ?? 0}</span> to{' '}
                        <span className="font-semibold text-foreground">{to ?? 0}</span> of{' '}
                        <span className="font-semibold text-foreground">{Number(total).toLocaleString()}</span> results
                    </span>
                ) : (
                    <span>
                        Page Navigation
                    </span>
                )}
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
                                    "inline-flex items-center justify-center h-8 px-2.5 rounded-xs text-xs font-medium transition-colors border",
                                    !link.url
                                        ? "text-muted-foreground/40 border-border/40 pointer-events-none cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                )}
                            >
                                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
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
                                    "inline-flex items-center justify-center h-8 px-2.5 rounded-xs text-xs font-medium transition-colors border",
                                    !link.url
                                        ? "text-muted-foreground/40 border-border/40 pointer-events-none cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                )}
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
                                "inline-flex items-center justify-center h-8 w-8 rounded-xs text-xs font-medium transition-colors border",
                                link.active
                                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
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
