import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from '@/components/AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Printer, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import ToastContainer from '@/components/Toast';
import CommandPalette from '@/components/CommandPalette';

export default function AppLayout({ title, children }) {
    const { props } = usePage();
    const initialTheme = props.system_settings?.dashboard_theme || 'shadcn';

    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            return localStorage.getItem('dashboard_theme') || initialTheme;
        } catch (e) {
            return initialTheme;
        }
    });

    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleThemeChanged = (e) => {
            const next = e.detail || localStorage.getItem('dashboard_theme') || initialTheme;
            setCurrentTheme(next);
        };

        window.addEventListener('dashboard-theme-changed', handleThemeChanged);
        return () => window.removeEventListener('dashboard-theme-changed', handleThemeChanged);
    }, [initialTheme]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isAcademic = currentTheme === 'academic';
    const isCompact = currentTheme === 'compact';

    return (
        <div className="h-screen h-[100dvh] w-full flex bg-background text-foreground font-sans antialiased overflow-hidden selection:bg-primary selection:text-primary-foreground">
            {/* Sidebar (Adapts style to Academic Classic / Shadcn Modern / Compact) */}
            <AdminSidebar dashboardTheme={currentTheme} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top Header */}
                <header
                    className={cn(
                        "shrink-0 px-6 flex items-center justify-between no-print z-10 transition-colors border-b",
                        isCompact ? "h-14 px-4" : "h-16",
                        isAcademic
                            ? "bg-card border-border"
                            : "bg-background/95 backdrop-blur-xs border-border"
                    )}
                >
                    <h1
                        className={cn(
                            "font-bold tracking-tight text-foreground font-sans",
                            isCompact ? "text-lg" : "text-xl"
                        )}
                    >
                        {title || 'Dashboard'}
                    </h1>

                    <div className="flex items-center space-x-3">
                        {/* Quick Command Palette Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="hidden md:flex items-center gap-2 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border bg-background hover:bg-muted"
                            title="Quick Search / Command Palette (Ctrl+K)"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>Quick Search...</span>
                            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded-xs border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span>⌘</span>K
                            </kbd>
                        </Button>

                        <ThemeToggle
                            className={cn(
                                isAcademic
                                    ? "rounded-none border-border bg-muted text-foreground"
                                    : "rounded-xs"
                            )}
                        />

                        {/* Print Button (Adapts to theme) */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className={cn(
                                "flex items-center space-x-2 transition-all font-semibold",
                                isAcademic
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary rounded-none shadow-xs text-xs h-8 px-3.5"
                                    : "h-8 px-2.5 text-xs rounded-xs border-border bg-background hover:bg-muted text-foreground"
                            )}
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Print Page</span>
                        </Button>
                    </div>
                </header>

                {/* Main Content Workspace (Full-width scroll container) */}
                <main className="flex-1 p-5 md:p-6 overflow-y-auto min-h-0 focus:outline-none bg-muted/20 dark:bg-background transition-colors w-full">
                    {children}
                </main>
            </div>

            {/* Global Toast Notifications & Command Palette */}
            <ToastContainer />
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />
        </div>
    );
}
