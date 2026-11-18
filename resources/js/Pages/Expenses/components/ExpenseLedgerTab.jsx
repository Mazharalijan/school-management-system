import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import {
    Pencil,
    Trash2,
    Calendar,
    FileText,
    CreditCard,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Lock,
    Receipt,
    Wallet
} from 'lucide-react';

export default function ExpenseLedgerTab({
    expenses,
    ledgerSummary = {},
    categories = [],
    paymentMethods = [],
    filters = {},
    onFilterChange,
    onResetFilters,
    onEditExpense,
    onDeleteExpense,
}) {
    const hasFilters = Boolean(
        filters.search || 
        filters.category_id || 
        filters.payment_method || 
        (filters.type && filters.type !== 'all')
    );

    const formatCurrency = (amount) => {
        return `Rs. ${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getPaymentBadge = (method) => {
        switch (method) {
            case 'bank_transfer':
                return (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-medium">
                        Bank Transfer
                    </Badge>
                );
            case 'cheque':
                return (
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] font-medium">
                        Cheque
                    </Badge>
                );
            case 'online':
                return (
                    <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-[10px] font-medium">
                        Digital / Online
                    </Badge>
                );
            case 'cash':
            default:
                return (
                    <Badge variant="outline" className="bg-muted text-foreground border-border text-[10px] font-medium">
                        Cash
                    </Badge>
                );
        }
    };

    const getTypeBadge = (item) => {
        const type = item.source_type || 'expense';
        switch (type) {
            case 'fee_payment':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Fee Receipt
                    </span>
                );
            case 'salary_settlement':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        Staff Payroll
                    </span>
                );
            case 'salary_advance':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Salary Advance
                    </span>
                );
            case 'expense':
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        Operating Expense
                    </span>
                );
        }
    };

    const netBalance = ledgerSummary?.net_balance ?? 0;
    const isNetPositive = netBalance >= 0;

    return (
        <div className="space-y-4">
            {/* 1. Cash Flow Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Inflow (Fees Received) */}
                <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Total Inflow (Fee Revenue)
                        </span>
                        <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center rounded-xs">
                            <ArrowDownLeft className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                            +{formatCurrency(ledgerSummary?.total_inflow)}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                        {ledgerSummary?.inflow_count || 0} student fee collections
                    </span>
                </div>

                {/* Total Outflow (Disbursements) */}
                <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Total Outflow (Expenses &amp; Pay)
                        </span>
                        <div className="w-7 h-7 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center rounded-xs">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-foreground font-mono tracking-tight">
                            -{formatCurrency(ledgerSummary?.total_outflow)}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                        {ledgerSummary?.outflow_count || 0} total disbursements
                    </span>
                </div>

                {/* Net Cash Flow Balance */}
                <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden text-card-foreground">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isNetPositive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Net Cash Flow Balance
                        </span>
                        <div className={`w-7 h-7 border flex items-center justify-center rounded-xs ${
                            isNetPositive 
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}>
                            {isNetPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-xl font-extrabold font-mono tracking-tight ${
                            isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            {isNetPositive ? '+' : ''}{formatCurrency(netBalance)}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                        {isNetPositive ? 'Operating Cash Surplus' : 'Net Operating Deficit'}
                    </span>
                </div>

                {/* Total Transactions */}
                <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden text-card-foreground">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Ledger Entries
                        </span>
                        <div className="w-7 h-7 bg-muted text-foreground border border-border flex items-center justify-center rounded-xs">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-foreground font-mono tracking-tight">
                            {ledgerSummary?.total_count || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">records</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                        Synchronized application-wide
                    </span>
                </div>
            </div>

            {/* 2. Filter Bar */}
            <FilterBar showReset={hasFilters} onReset={onResetFilters}>
                <SearchInput
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange('search', e?.target ? e.target.value : e)}
                    placeholder="Search voucher #, receipt #, payee, student, staff, or notes..."
                    className="flex-1 min-w-[240px]"
                />

                {/* Transaction Flow Type Filter */}
                <select
                    value={filters.type || 'all'}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    className="w-52 shrink-0 h-10 px-3 py-2 text-xs rounded-xs border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value="all">All Flow (Inflow &amp; Outflow)</option>
                    <option value="incoming">Incoming: Fee Receipts (+)</option>
                    <option value="outgoing">All Outgoing Expenses (-)</option>
                    <option value="operating">Operating Expenses Only (-)</option>
                    <option value="payroll">Staff Payroll &amp; Advances (-)</option>
                </select>

                {/* Category Filter (applies to operating expenses) */}
                <FilterSelect
                    value={filters.category_id || ''}
                    onChange={(val) => onFilterChange('category_id', val)}
                    options={categories}
                    valueKey="id"
                    labelKey="name"
                    placeholder="All Operating Categories"
                    className="w-48 shrink-0 text-xs"
                />

                {/* Payment Method Filter */}
                <select
                    value={filters.payment_method || ''}
                    onChange={(e) => onFilterChange('payment_method', e.target.value)}
                    className="w-44 shrink-0 h-10 px-3 py-2 text-xs rounded-xs border border-input bg-background text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value="">All Payment Methods</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                            {pm.label}
                        </option>
                    ))}
                </select>
            </FilterBar>

            {/* 3. Unified Financial Transactions Ledger Table */}
            <Card className="rounded-sm border border-border shadow-xs bg-card text-card-foreground">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/60">
                                <tr>
                                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Flow &amp; Voucher #
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Type &amp; Description
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Classification
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Associated Entity / Payee
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs tracking-wider">
                                        Action / Source
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {expenses?.data?.length > 0 ? (
                                    expenses.data.map((item) => {
                                        const isInflow = item.direction === 'in';
                                        const voucherNo = item.voucher_no || item.expense_no;
                                        const itemDate = item.date || item.expense_date;
                                        const categoryName = item.category?.name || 'General';
                                        const partyName = item.party || item.paid_to || '—';

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                                {/* Flow & Voucher # */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {isInflow ? (
                                                            <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center rounded-xs text-xs" title="Incoming Cash">
                                                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                                            </span>
                                                        ) : (
                                                            <span className="w-5 h-5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center rounded-xs text-xs" title="Outgoing Disbursement">
                                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-xs border ${
                                                            isInflow
                                                                ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                                                                : 'text-foreground bg-muted border-border'
                                                        }`}>
                                                            {voucherNo}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Type & Description */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        {getTypeBadge(item)}
                                                        <span className="font-semibold text-foreground truncate max-w-[280px] block" title={item.title}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-mono">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        <span>{itemDate}</span>
                                                        {item.reference_no && (
                                                            <>
                                                                <span className="text-muted-foreground">&bull;</span>
                                                                <span className="text-muted-foreground">Ref: {item.reference_no}</span>
                                                            </>
                                                        )}
                                                        {item.recorded_by && (
                                                            <>
                                                                <span className="text-muted-foreground">&bull;</span>
                                                                <span className="text-muted-foreground">By {item.recorded_by}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Classification / Category */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <Badge variant="outline" className="bg-muted text-foreground border-border font-medium text-xs">
                                                        {categoryName}
                                                    </Badge>
                                                </td>

                                                {/* Associated Entity / Payee */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs font-semibold text-foreground block">
                                                        {partyName}
                                                    </span>
                                                    {item.party_subtitle && (
                                                        <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                                                            {item.party_subtitle}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Method */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    {getPaymentBadge(item.payment_method)}
                                                </td>

                                                {/* Amount */}
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    <span className={`font-extrabold font-mono text-sm block ${
                                                        isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                                    }`}>
                                                        {isInflow ? '+' : '-'}{formatCurrency(item.amount)}
                                                    </span>
                                                </td>

                                                {/* Action / Source */}
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    {item.can_edit ? (
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <TableActionButton
                                                                title="Edit Expense"
                                                                icon={Pencil}
                                                                variant="primary"
                                                                onClick={() => onEditExpense(item)}
                                                            />
                                                            <TableActionButton
                                                                title="Delete Expense"
                                                                icon={Trash2}
                                                                variant="danger"
                                                                onClick={() => onDeleteExpense(item.source_id || item.id)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted border border-border px-2 py-1 rounded-xs font-mono">
                                                            <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                                                            <span>System {isInflow ? 'Receipt' : 'Payroll'}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-muted-foreground text-xs">
                                            No financial ledger transactions found matching the selected filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {expenses?.links && (
                        <div className="border-t border-border p-2">
                            <Pagination
                                links={expenses.links}
                                from={expenses.from}
                                to={expenses.to}
                                total={expenses.total}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
