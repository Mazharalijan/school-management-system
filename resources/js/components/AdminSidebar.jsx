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
    Bus,
    Award,
    LogOut
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
    { name: 'Marks & Results', href: '/marks/entry', icon: Award },
    { name: 'Expenses P&L', href: '/expenses', icon: Receipt },
    { name: 'Assets & Inventory', href: '/inventory', icon: Package },
    { name: 'Transport', href: '/transport', icon: Bus },
];

export default function AdminSidebar() {
    const { url, props } = usePage();
    const user = props.auth?.user;

    return (
        <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full shrink-0 border-r border-slate-800 no-print overflow-hidden select-none">
            <div className="p-4 border-b border-slate-800 flex items-center space-x-2 shrink-0">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="font-semibold text-lg tracking-wide">SMS Admin</span>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
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

            <div className="p-3 border-t border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow">
                        {user?.first_name?.[0] || user?.name?.[0] || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">
                            {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Admin'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                            {user?.email || 'admin@school.edu.pk'}
                        </p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        </aside>
    );
}