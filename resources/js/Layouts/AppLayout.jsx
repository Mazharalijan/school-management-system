import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function AppLayout({ title, children }) {
    return (
        <div className="min-h-screen flex bg-slate-50 font-sans antialiased">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between no-print">
                    <h1 className="text-xl font-bold text-slate-800">{title || 'Dashboard'}</h1>
                    <div className="flex items-center space-x-3">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.print()}
                            className="flex items-center space-x-2"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Print Page</span>
                        </Button>
                    </div>
                </header>

                {/* Main Content Workspace */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}