import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    LayoutDashboard,
    Users,
    TrendingUp,
    GraduationCap,
    Calendar,
    FileSpreadsheet,
    Award,
    CreditCard,
    Receipt,
    Package,
    Settings,
    Sun,
    Moon,
    Printer,
    Command,
    X,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const commands = [
        // Navigation items
        { id: 'dashboard', name: 'Dashboard', group: 'Navigation', href: '/', icon: LayoutDashboard },
        { id: 'students', name: 'Students Directory', group: 'Navigation', href: '/students', icon: Users },
        { id: 'promotion', name: 'Student Promotion Wizard', group: 'Navigation', href: '/students/promotion', icon: TrendingUp },
        { id: 'classes', name: 'Class & Section Matrix', group: 'Navigation', href: '/classes', icon: GraduationCap },
        { id: 'staff', name: 'Teachers & Staff Directory', group: 'Navigation', href: '/staff', icon: Users },
        { id: 'timetable', name: 'Timetable Generator', group: 'Navigation', href: '/timetable', icon: Calendar },
        { id: 'question-bank', name: 'Question Bank', group: 'Navigation', href: '/question-bank', icon: FileSpreadsheet },
        { id: 'exams', name: 'Exam Class Papers', group: 'Navigation', href: '/exam-class-papers', icon: FileSpreadsheet },
        { id: 'marks', name: 'Marks & Results Entry', group: 'Navigation', href: '/marks/entry', icon: Award },
        { id: 'invoices', name: 'Fee Invoices', group: 'Navigation', href: '/fees/invoices', icon: CreditCard },
        { id: 'fees-structure', name: 'Fee Structure Defaults', group: 'Navigation', href: '/fees/structure', icon: CreditCard },
        { id: 'expenses', name: 'Expenses & PnL Ledger', group: 'Navigation', href: '/expenses', icon: Receipt },
        { id: 'inventory', name: 'Assets & Inventory', group: 'Navigation', href: '/inventory', icon: Package },
        { id: 'settings', name: 'System Settings', group: 'Navigation', href: '/settings', icon: Settings },

        // Actions
        {
            id: 'theme-dark',
            name: 'Toggle Dark Mode',
            group: 'Appearance & Actions',
            icon: Moon,
            action: () => {
                document.documentElement.classList.add('dark');
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (e) {}
                window.dispatchEvent(new CustomEvent('theme-changed', { detail: 'dark' }));
            },
        },
        {
            id: 'theme-light',
            name: 'Toggle Light Mode',
            group: 'Appearance & Actions',
            icon: Sun,
            action: () => {
                document.documentElement.classList.remove('dark');
                try {
                    localStorage.setItem('theme', 'light');
                } catch (e) {}
                window.dispatchEvent(new CustomEvent('theme-changed', { detail: 'light' }));
            },
        },
        {
            id: 'print-page',
            name: 'Print Current Page',
            group: 'Appearance & Actions',
            icon: Printer,
            action: () => {
                setTimeout(() => window.print(), 150);
            },
        },
    ];

    const filtered = commands.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Handle Keyboard navigation inside palette
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                executeItem(filtered[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    const executeItem = (item) => {
        onClose();
        if (item.href) {
            router.visit(item.href);
        } else if (item.action) {
            item.action();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150 no-print"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-popover text-popover-foreground rounded-sm border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar Header */}
                <div className="flex items-center px-4 border-b border-border bg-muted/30">
                    <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search command or jump to page... (ESC to close)"
                        className="w-full h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Results List */}
                <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/40">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No matching commands or pages found.
                        </div>
                    ) : (
                        filtered.map((item, index) => {
                            const Icon = item.icon;
                            const isSelected = index === selectedIndex;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => executeItem(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs transition-colors text-left',
                                        isSelected
                                            ? 'bg-accent text-accent-foreground font-semibold'
                                            : 'text-foreground hover:bg-muted/60'
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={cn(
                                                'w-7 h-7 rounded-xs flex items-center justify-center shrink-0 border border-border',
                                                isSelected ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{item.group}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 text-[11px]">
                                        {isSelected && (
                                            <>
                                                <span>Jump</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Hotkey Guide */}
                <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span>Navigate</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↑</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↓</kbd>
                        <span>Select</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">↵</kbd>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Close</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">ESC</kbd>
                    </div>
                </div>
            </div>
        </div>
    );
}
