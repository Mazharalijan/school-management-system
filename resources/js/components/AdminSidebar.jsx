import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Settings, 
    GraduationCap, 
    Users, 
    Calendar, 
    FileSpreadsheet, 
    CreditCard, 
    Receipt, 
    Package, 
    Bus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'System Settings', href: '/settings', icon: Settings },
    { name: 'Class Matrix', href: '/classes', icon: GraduationCap },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers & Staff', href: '/staff', icon: Users },
    { name: 'Timetable Generator', href: '/timetable', icon: Calendar },
    { name: 'Question Bank', href: '/question-bank', icon: FileSpreadsheet },
    { name: 'Exams', href: '/exam-class-papers', icon: FileSpreadsheet },
    { name: 'Expenses P&L', href: '/expenses', icon: Receipt },
    { name: 'Assets & Inventory', href: '/inventory', icon: Package },
    { name: 'Transport', href: '/transport', icon: Bus },
];

export default function AdminSidebar() {
    const { url } = usePage();

    return (
        <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 no-print">
            <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="font-semibold text-lg tracking-wide">SMS Admin</span>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive 
                                    ? "bg-slate-800 text-white font-semibold" 
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                Single-Operator Workspace
            </div>
        </aside>
    );
}