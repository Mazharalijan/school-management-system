import React, { useState, useEffect, useRef } from 'react';
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
    Award,
    TrendingUp,
    LogOut,
    School,
    Search,
    Loader2,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileAvatar from '@/components/ProfileAvatar';
import StudentDetailsModal from '@/Pages/Students/components/StudentDetailsModal';

const navGroups = [
    {
        label: 'Platform',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'System Settings', href: '/settings', icon: Settings },
        ],
    },
    {
        label: 'Academics',
        items: [
            { name: 'Class Matrix', href: '/classes', icon: GraduationCap },
            { name: 'Students', href: '/students', icon: Users },
            { name: 'Student Promotion', href: '/students/promotion', icon: TrendingUp },
            { name: 'Certificates', href: '/certificates', icon: Award },
            { name: 'Teachers & Staff', href: '/staff', icon: Users },
            { name: 'Timetable Generator', href: '/timetable', icon: Calendar },
        ],
    },
    {
        label: 'Examinations',
        items: [
            { name: 'Question Bank', href: '/question-bank', icon: FileSpreadsheet },
            { name: 'Exams & Papers', href: '/exam-class-papers', icon: FileSpreadsheet },
            { name: 'Marks & Results', href: '/marks/entry', icon: Award },
        ],
    },
    {
        label: 'Financials & Assets',
        items: [
            { name: 'Fee Invoices', href: '/fees/invoices', icon: CreditCard },
            { name: 'Expenses P&L', href: '/expenses', icon: Receipt },
            { name: 'Assets & Inventory', href: '/inventory', icon: Package },
        ],
    },
];

export default function AdminSidebar({ dashboardTheme }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const schoolName = props.system_settings?.school_name || 'SMS Portal';
    const serverTheme = props.system_settings?.dashboard_theme || 'shadcn';

    const [activeTheme, setActiveTheme] = useState(() => {
        if (dashboardTheme) return dashboardTheme;
        try {
            return localStorage.getItem('dashboard_theme') || serverTheme;
        } catch (e) {
            return serverTheme;
        }
    });

    useEffect(() => {
        if (dashboardTheme) {
            setActiveTheme(dashboardTheme);
        }
    }, [dashboardTheme]);

    useEffect(() => {
        const handleThemeChanged = (e) => {
            const next = e.detail || localStorage.getItem('dashboard_theme') || serverTheme;
            setActiveTheme(next);
        };

        window.addEventListener('dashboard-theme-changed', handleThemeChanged);
        return () => window.removeEventListener('dashboard-theme-changed', handleThemeChanged);
    }, [serverTheme]);

    // Sidebar Quick Student Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const searchContainerRef = useRef(null);

    // Dismiss suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search query fetching matching students
    useEffect(() => {
        const term = searchQuery.trim();
        if (!term) {
            setSearchResults([]);
            setIsSearching(false);
            setIsDropdownOpen(false);
            return;
        }

        setIsSearching(true);
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/students/search?q=${encodeURIComponent(term)}`, {
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                    setIsDropdownOpen(true);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Sidebar student search error:', err);
                }
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    const isAcademic = activeTheme === 'academic';
    const isCompact = activeTheme === 'compact';

    return (
        <aside
            className={cn(
                "flex flex-col h-full shrink-0 no-print overflow-hidden select-none transition-all duration-200",
                isCompact ? "w-60" : "w-64",
                isAcademic
                    ? "bg-slate-900 text-slate-100 border-r border-slate-800 shadow-sm"
                    : "bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "px-4 flex items-center space-x-3 shrink-0 border-b",
                    isCompact ? "h-14" : "h-16",
                    isAcademic ? "border-slate-800 bg-slate-950/60" : "border-sidebar-border"
                )}
            >
                <div
                    className={cn(
                        "flex aspect-square items-center justify-center font-bold",
                        isCompact ? "size-7 text-xs" : "size-9",
                        isAcademic
                            ? "rounded-none bg-blue-600 text-white shadow-xs"
                            : "rounded-lg bg-primary text-primary-foreground shadow-2xs"
                    )}
                >
                    {isAcademic ? <GraduationCap className="size-5" /> : <School className="size-5" />}
                </div>
                <div className="grid flex-1 text-left leading-tight min-w-0">
                    <span
                        className={cn(
                            "truncate font-bold tracking-tight",
                            isCompact ? "text-xs" : "text-sm",
                            isAcademic ? "text-white" : "text-sidebar-foreground"
                        )}
                    >
                        {schoolName}
                    </span>
                    <span
                        className={cn(
                            "truncate text-[10px] tracking-wider",
                            isAcademic
                                ? "text-blue-400 font-mono font-semibold uppercase"
                                : "text-sidebar-foreground/60"
                        )}
                    >
                        {isAcademic ? 'Academic Portal' : isCompact ? 'Executive Compact' : 'Administration Hub'}
                    </span>
                </div>
            </div>

            {/* Quick Student Search Bar (Placed directly above Platform section) */}
            <div
                ref={searchContainerRef}
                className={cn(
                    "relative px-3 py-2.5 shrink-0 border-b z-20",
                    isAcademic ? "border-slate-800 bg-slate-950/40" : "border-sidebar-border bg-sidebar/30"
                )}
            >
                <div className="relative">
                    <Search
                        className={cn(
                            "absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none",
                            isAcademic ? "text-slate-400" : "text-sidebar-foreground/50"
                        )}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsDropdownOpen(false);
                        }}
                        placeholder="Search student, CNIC..."
                        className={cn(
                            "w-full pl-8 pr-7 py-1.5 text-xs transition-colors outline-none",
                            isAcademic
                                ? "rounded-none bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                                : isCompact
                                ? "rounded-md bg-sidebar-accent/50 border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:border-primary"
                                : "rounded-lg bg-sidebar-accent/50 border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:border-primary"
                        )}
                    />
                    {isSearching ? (
                        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 animate-spin text-muted-foreground" />
                    ) : searchQuery ? (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                                setIsDropdownOpen(false);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                            title="Clear search"
                        >
                            <X className="size-3" />
                        </button>
                    ) : null}
                </div>

                {/* Dropdown Suggestions */}
                {isDropdownOpen && searchQuery.trim().length > 0 && (
                    <div
                        className={cn(
                            "absolute left-2 right-2 top-full mt-1.5 max-h-80 overflow-y-auto shadow-2xl z-50 border",
                            isAcademic
                                ? "bg-slate-900 border-slate-700 text-slate-100 divide-y divide-slate-800 rounded-none"
                                : "bg-popover border-border text-popover-foreground divide-y divide-border/60 rounded-lg"
                        )}
                    >
                        {isSearching && searchResults.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Searching students...</span>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="p-3.5 text-center text-xs text-muted-foreground">
                                No students found for "{searchQuery}"
                            </div>
                        ) : (
                            searchResults.map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudentForModal(st);
                                        setIsModalOpen(true);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left p-2.5 flex items-start gap-2.5 transition-colors cursor-pointer",
                                        isAcademic
                                            ? "hover:bg-slate-800/90 focus:bg-slate-800/90"
                                            : "hover:bg-muted/80 focus:bg-muted/80"
                                    )}
                                >
                                    <ProfileAvatar
                                        src={st.photo_url}
                                        name={st.full_name || `${st.first_name} ${st.last_name}`}
                                        className="size-8 shrink-0 border border-border"
                                        iconClassName="size-4"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="font-semibold text-xs truncate text-foreground">
                                                {st.first_name} {st.last_name}
                                            </span>
                                            <span className="text-[10px] font-mono shrink-0 text-muted-foreground">
                                                #{st.roll_number || st.admission_number || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                            <span className="font-medium text-foreground/80">
                                                {st.current_enrollment?.school_class?.name || 'Class N/A'}
                                                {st.current_enrollment?.section?.name ? ` (${st.current_enrollment.section.name})` : ''}
                                            </span>
                                            {st.guardian_name && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">S/D: {st.guardian_name}</span>
                                                </>
                                            )}
                                        </div>
                                        {(st.guardian_phone || st.father_cnic) && (
                                            <div className="text-[10px] text-muted-foreground/80 flex items-center gap-2 mt-0.5 font-mono">
                                                {st.guardian_phone && <span>📞 {st.guardian_phone}</span>}
                                                {st.father_cnic && <span>ID: {st.father_cnic}</span>}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Sections */}
            <nav className={cn("flex-1 overflow-y-auto min-h-0", isCompact ? "px-2 py-2 space-y-3" : "px-3 py-3 space-y-4")}>
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                        <div
                            className={cn(
                                "px-3 py-1 uppercase tracking-wider font-semibold",
                                isCompact ? "text-[9px]" : "text-[10px]",
                                isAcademic ? "text-slate-400 font-bold" : "text-sidebar-foreground/50"
                            )}
                        >
                            {group.label}
                        </div>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = url === item.href || (item.href !== '/' && url.startsWith(item.href));
                                const Icon = item.icon;

                                let linkClasses = "";
                                let iconClasses = "";

                                if (isAcademic) {
                                    linkClasses = isActive
                                        ? "bg-slate-800 text-white font-bold rounded-none border-l-4 border-blue-500 shadow-xs"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white rounded-none";
                                    iconClasses = isActive ? "text-blue-400" : "text-slate-400";
                                } else {
                                    linkClasses = isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold rounded-lg shadow-2xs"
                                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground rounded-lg";
                                    iconClasses = isActive ? "text-primary" : "text-sidebar-foreground/60";
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center space-x-3 text-xs font-medium transition-all",
                                            isCompact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2",
                                            linkClasses
                                        )}
                                    >
                                        <Icon className={cn("size-4 shrink-0 transition-colors", iconClasses)} />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer User Profile */}
            <div
                className={cn(
                    "p-3 border-t shrink-0",
                    isAcademic ? "border-slate-800 bg-slate-950" : "border-sidebar-border bg-sidebar/50"
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-between p-1.5 transition-colors",
                        isAcademic ? "rounded-none hover:bg-slate-800/60" : "rounded-lg hover:bg-sidebar-accent/50"
                    )}
                >
                    <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                            className={cn(
                                "size-8 flex items-center justify-center font-bold text-xs shrink-0",
                                isAcademic
                                    ? "rounded-none bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs"
                                    : "rounded-lg bg-primary/10 border border-sidebar-border text-primary"
                            )}
                        >
                            {user?.first_name?.[0] || user?.name?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p
                                className={cn(
                                    "text-xs font-semibold truncate leading-tight",
                                    isAcademic ? "text-slate-100 font-bold" : "text-sidebar-foreground"
                                )}
                            >
                                {user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Admin'}
                            </p>
                            <p
                                className={cn(
                                    "text-[10px] truncate leading-tight mt-0.5",
                                    isAcademic ? "text-slate-400 font-mono" : "text-sidebar-foreground/60"
                                )}
                            >
                                {user?.email || 'admin@school.edu.pk'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={cn(
                            "p-1.5 transition-colors shrink-0",
                            isAcademic
                                ? "rounded-none text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                : "rounded-md text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10"
                        )}
                        title="Sign Out"
                    >
                        <LogOut className="size-4" />
                    </Link>
                </div>
            </div>

            {/* Student Profile Modal (Triggered by clicking search suggestion) */}
            {selectedStudentForModal && (
                <StudentDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedStudentForModal(null);
                    }}
                    student={selectedStudentForModal}
                />
            )}
        </aside>
    );
}
