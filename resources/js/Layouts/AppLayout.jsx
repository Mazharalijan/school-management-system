import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminSidebar from '@/components/AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Printer, LogOut } from 'lucide-react';

export default function AppLayout({ title, children }) {
    const { props } = usePage();
    const user = props.auth?.user;

    return (
        <div className="h-screen h-[100dvh] w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden">
            {/* Sidebar (Permanently fixed on the left) */}
            <AdminSidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top Header (Permanently fixed at the top) */}
                <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between no-print z-10">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title || 'Dashboard'}</h1>
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.print()}
                            className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Print Page</span>
                        </Button>

                        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <div className="hidden sm:flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-semibold">
                                {user?.first_name?.[0] || user?.name?.[0] || 'U'}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                    {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Operator'}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                    {user?.email || 'admin@school.edu.pk'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Link>
                    </div>
                </header>

                {/* Main Content Workspace (Independent internal scroll) */}
                <main className="flex-1 p-6 overflow-y-auto min-h-0 focus:outline-none bg-slate-50 dark:bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}