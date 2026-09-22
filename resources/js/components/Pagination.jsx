import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links, from, to, total, className = '' }) {
    // Hide pagination if there are no records or only 1 page
    if (!links || links.length <= 3 || total === 0) {
        return null;
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-slate-200 ${className}`}>
            {/* Meta Details */}
            <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{from ?? 0}</span> to{' '}
                <span className="font-semibold text-slate-900">{to ?? 0}</span> of{' '}
                <span className="font-semibold text-slate-900">{total}</span> results
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
                                className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                                    !link.url
                                        ? 'text-slate-300 pointer-events-none cursor-not-allowed'
                                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
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
                                className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                                    !link.url
                                        ? 'text-slate-300 pointer-events-none cursor-not-allowed'
                                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        );
                    }

                    // Numeric Page Links
                    return (
                        <Link
                            key={key}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            className={`inline-flex items-center justify-center h-9 min-w-[36px] px-3 rounded-md text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-slate-800 hover:bg-slate-900 text-white font-semibold'
                                    : !link.url
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}