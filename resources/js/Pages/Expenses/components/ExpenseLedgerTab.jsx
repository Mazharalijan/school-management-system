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
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] rounded-none font-medium">
                        Bank Transfer
                    </Badge>
                );
            case 'cheque':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] rounded-none font-medium">
                        Cheque
                    </Badge>
                );
            case 'online':
                return (
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] rounded-none font-medium">
                        Digital / Online
                    </Badge>
                );
            case 'cash':
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] rounded-none font-medium">
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-none">
                        Fee Receipt
                    </span>
                );
            case 'salary_settlement':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded-none">
                        Staff Payroll
                    </span>
                );
            case 'salary_advance':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-none">
                        Salary Advance
                    </span>
                );
            case 'expense':
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-none">
                        Operating Expense
                    </span>
                );
        }
    };

    const netBalance = ledgerSummary?.net_balance ?? 0;
    const isNetPositive = netBalance >= 0;

    return (
        <div className="space-y-4">
            {/* 1. Cash Flow Summary Strip (Sharp Rectangular Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Inflow (Fees Received) */}
                <div className="bg-white border border-slate-200 p-4 rounded-none relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Total Inflow (Fee Revenue)
                        </span>
                        <div className="w-7 h-7 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-none">
                            <ArrowDownLeft className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-emerald-700 font-mono tracking-tight">
                            +{formatCurrency(ledgerSummary?.total_inflow)}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {ledgerSummary?.inflow_count || 0} student fee collections
                    </span>
                </div>

                {/* Total Outflow (Disbursements) */}
                <div className="bg-white border border-slate-200 p-4 rounded-none relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Total Outflow (Expenses &amp; Pay)
                        </span>
                        <div className="w-7 h-7 bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center rounded-none">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                            -{formatCurrency(ledgerSummary?.total_outflow)}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {ledgerSummary?.outflow_count || 0} total disbursements
                    </span>
                </div>

                {/* Net Cash Flow Balance */}
                <div className="bg-white border border-slate-200 p-4 rounded-none relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isNetPositive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Net Cash Flow Balance
                        </span>
                        <div className={`w-7 h-7 border flex items-center justify-center rounded-none ${
                            isNetPositive 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : 'bg-rose-50 text-rose-600 border-rose-200'
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
                            isNetPositive ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                            {isNetPositive ? '+' : ''}{formatCurrency(netBalance)}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {isNetPositive ? 'Operating Cash Surplus' : 'Net Operating Deficit'}
                    </span>
                </div>

                {/* Total Transactions */}
                <div className="bg-white border border-slate-200 p-4 rounded-none relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800" />
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Ledger Entries
                        </span>
                        <div className="w-7 h-7 bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center rounded-none">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                            {ledgerSummary?.total_count || 0}
                        </span>
                        <span className="text-xs text-slate-500">records</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
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
                    className="flex-1 min-w-[240px] rounded-none"
                />

                {/* Transaction Flow Type Filter */}
                <select
                    value={filters.type || 'all'}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    className="w-52 shrink-0 h-10 px-3 py-2 text-xs rounded-none border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                    className="w-48 shrink-0 rounded-none text-xs"
                />

                {/* Payment Method Filter */}
                <select
                    value={filters.payment_method || ''}
                    onChange={(e) => onFilterChange('payment_method', e.target.value)}
                    className="w-44 shrink-0 h-10 px-3 py-2 text-xs rounded-none border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
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
            <Card className="rounded-none border border-slate-200 shadow-none bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3.5 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Flow &amp; Voucher #
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Type &amp; Description
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Classification
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Associated Entity / Payee
                                    </th>
                                    <th className="px-4 py-3.5 text-left font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-700 uppercase text-xs tracking-wider">
                                        Action / Source
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {expenses?.data?.length > 0 ? (
                                    expenses.data.map((item) => {
                                        const isInflow = item.direction === 'in';
                                        const voucherNo = item.voucher_no || item.expense_no;
                                        const itemDate = item.date || item.expense_date;
                                        const categoryName = item.category?.name || 'General';
                                        const partyName = item.party || item.paid_to || '—';

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                                                {/* Flow & Voucher # */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {isInflow ? (
                                                            <span className="w-5 h-5 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-none text-xs" title="Incoming Cash">
                                                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                                            </span>
                                                        ) : (
                                                            <span className="w-5 h-5 bg-rose-100 text-rose-700 flex items-center justify-center rounded-none text-xs" title="Outgoing Disbursement">
                                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-none border ${
                                                            isInflow
                                                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                                                : 'text-slate-800 bg-slate-100 border-slate-200'
                                                        }`}>
                                                            {voucherNo}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Type & Description */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        {getTypeBadge(item)}
                                                        <span className="font-semibold text-slate-900 truncate max-w-[280px] block" title={item.title}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>{itemDate}</span>
                                                        {item.reference_no && (
                                                            <>
                                                                <span className="text-slate-300">&bull;</span>
                                                                <span className="text-slate-500">Ref: {item.reference_no}</span>
                                                            </>
                                                        )}
                                                        {item.recorded_by && (
                                                            <>
                                                                <span className="text-slate-300">&bull;</span>
                                                                <span className="text-slate-400">By {item.recorded_by}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Classification / Category */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-xs rounded-none">
                                                        {categoryName}
                                                    </Badge>
                                                </td>

                                                {/* Associated Entity / Payee */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs font-semibold text-slate-800 block">
                                                        {partyName}
                                                    </span>
                                                    {item.party_subtitle && (
                                                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
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
                                                        isInflow ? 'text-emerald-700' : 'text-slate-900'
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
                                                        <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-none font-mono">
                                                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                                                            <span>System {isInflow ? 'Receipt' : 'Payroll'}</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-400 text-xs">
                                            No financial ledger transactions found matching the selected filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {expenses?.links && (
                        <div className="border-t border-slate-100 p-2">
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
