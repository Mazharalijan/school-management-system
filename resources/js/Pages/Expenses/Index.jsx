import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Receipt,
    Plus,
    FolderPlus,
    Printer,
    FileSpreadsheet,
    TrendingUp,
    Layers,
    Calendar,
    Filter
} from 'lucide-react';

import PnlOverviewTab from './components/PnlOverviewTab';
import ExpenseLedgerTab from './components/ExpenseLedgerTab';
import ExpenseCategoriesTab from './components/ExpenseCategoriesTab';
import ExpenseFormModal from './components/ExpenseFormModal';
import CategoryFormModal from './components/CategoryFormModal';
import PrintPnlModal from './components/PrintPnlModal';

export default function Index({
    pnlSummary,
    expenses,
    ledgerSummary = {},
    categories = [],
    filters = {},
    paymentMethods = [],
}) {
    const [currentTab, setCurrentTab] = useState(filters.tab || 'pnl');

    // Modals
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isPrintPnlModalOpen, setIsPrintPnlModalOpen] = useState(false);

    // Date Range Presets
    const [activePreset, setActivePreset] = useState(filters.preset || 'this_month');
    const [customStart, setCustomStart] = useState(filters.start_date || '');
    const [customEnd, setCustomEnd] = useState(filters.end_date || '');

    // Synchronize tab and preset when incoming props change (e.g. navigation from Dashboard)
    useEffect(() => {
        if (filters.tab && filters.tab !== currentTab) {
            setCurrentTab(filters.tab);
        }
    }, [filters.tab]);

    useEffect(() => {
        if (filters.preset && filters.preset !== activePreset) {
            setActivePreset(filters.preset);
        }
        if (filters.start_date) setCustomStart(filters.start_date);
        if (filters.end_date) setCustomEnd(filters.end_date);
    }, [filters.preset, filters.start_date, filters.end_date]);

    const applyDateFilters = (newParams = {}) => {
        router.get(
            route('expenses.index'),
            {
                ...filters,
                ...newParams,
                tab: newParams.tab || currentTab,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        applyDateFilters({ tab });
    };

    const handlePresetChange = (preset) => {
        setActivePreset(preset);
        applyDateFilters({ preset, start_date: '', end_date: '' });
    };

    const handleCustomDateApply = (e) => {
        e.preventDefault();
        if (customStart && customEnd) {
            applyDateFilters({
                preset: 'custom',
                start_date: customStart,
                end_date: customEnd,
            });
        }
    };

    const handleOpenCreateExpense = () => {
        setEditingExpense(null);
        setIsExpenseModalOpen(true);
    };

    const handleOpenEditExpense = (expense) => {
        // Support both raw format and standard expense model format
        setEditingExpense(expense.raw || expense);
        setIsExpenseModalOpen(true);
    };

    const handleDeleteExpense = (id) => {
        if (confirm('Are you sure you want to delete this expense record?')) {
            router.delete(route('expenses.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const presets = [
        { id: 'this_month', label: 'This Month' },
        { id: 'last_month', label: 'Last Month' },
        { id: 'this_quarter', label: 'This Quarter' },
        { id: 'this_year', label: 'This Year' },
        { id: 'all_time', label: 'All Time' },
    ];

    return (
        <AppLayout title="Expenses & Financial Flow (P&L)">
            <Head title="Expenses & Ledger" />

            <div className="space-y-6">
                {/* 1. Standard Page Header */}
                <PageHeader
                    title="Expenses & Cash Flow Ledger"
                    subtitle="Track operational expenditures, staff payroll settlements, fee revenue inflows, and net operating margins in unified real-time."
                    icon={Receipt}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPrintPnlModalOpen(true)}
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-none"
                        >
                            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            Print Statement
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-none"
                        >
                            <FolderPlus className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                            + Category
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleOpenCreateExpense}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 shadow-xs rounded-none"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5 text-white" />
                            Record Expense
                        </Button>
                    </div>
                </PageHeader>

                {/* 2. Date Preset & Reporting Period Bar (Sharp Rectangular Design) */}
                <div className="bg-white p-3 sm:p-4 rounded-none border border-slate-200 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Period:</span>
                        {presets.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handlePresetChange(p.id)}
                                className={`px-3 py-1.5 rounded-none text-xs font-medium transition-all ${
                                    activePreset === p.id
                                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Range Picker */}
                    <form onSubmit={handleCustomDateApply} className="flex items-center gap-2 text-xs">
                        <Input
                            type="date"
                            value={customStart}
                            onChange={(e) => {
                                setCustomStart(e.target.value);
                                setActivePreset('custom');
                            }}
                            className="h-8 text-xs w-36 rounded-none"
                        />
                        <span className="text-slate-400">to</span>
                        <Input
                            type="date"
                            value={customEnd}
                            onChange={(e) => {
                                setCustomEnd(e.target.value);
                                setActivePreset('custom');
                            }}
                            className="h-8 text-xs w-36 rounded-none"
                        />
                        <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-2.5 rounded-none">
                            Apply
                        </Button>
                    </form>
                </div>

                {/* 3. Domain Tabs */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-none mb-6 flex flex-wrap h-auto">
                        <TabsTrigger value="pnl" className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-none">
                            <TrendingUp className="h-4 w-4 text-emerald-600" /> Profit &amp; Loss Statement &amp; Analytics
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-none">
                            <Receipt className="h-4 w-4 text-rose-600" /> Cash Flow &amp; Expenses Ledger ({expenses?.total ?? 0})
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-none">
                            <Layers className="h-4 w-4 text-indigo-600" /> Operating Categories ({categories.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: P&L Overview */}
                    <TabsContent value="pnl">
                        <PnlOverviewTab
                            summary={pnlSummary}
                            onOpenPrint={() => setIsPrintPnlModalOpen(true)}
                        />
                    </TabsContent>

                    {/* Tab 2: Expenses & Cash Flow Ledger */}
                    <TabsContent value="expenses">
                        <ExpenseLedgerTab
                            expenses={expenses}
                            ledgerSummary={ledgerSummary}
                            categories={categories}
                            paymentMethods={paymentMethods}
                            filters={filters}
                            onFilterChange={(key, val) => applyDateFilters({ [key]: val })}
                            onResetFilters={() => applyDateFilters({ search: '', category_id: '', payment_method: '', type: 'all' })}
                            onEditExpense={handleOpenEditExpense}
                            onDeleteExpense={handleDeleteExpense}
                        />
                    </TabsContent>

                    {/* Tab 3: Categories */}
                    <TabsContent value="categories">
                        <ExpenseCategoriesTab
                            categories={categories}
                            onOpenCreateCategory={() => setIsCategoryModalOpen(true)}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <ExpenseFormModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                expense={editingExpense}
                categories={categories}
                paymentMethods={paymentMethods}
            />

            <CategoryFormModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            />

            <PrintPnlModal
                isOpen={isPrintPnlModalOpen}
                onClose={() => setIsPrintPnlModalOpen(false)}
                summary={pnlSummary}
            />
        </AppLayout>
    );
}
