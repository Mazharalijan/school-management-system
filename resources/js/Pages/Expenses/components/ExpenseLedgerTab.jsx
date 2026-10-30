import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Pencil, Trash2, Calendar, FileText, CreditCard } from 'lucide-react';

export default function ExpenseLedgerTab({
    expenses,
    categories = [],
    paymentMethods = [],
    filters = {},
    onFilterChange,
    onResetFilters,
    onEditExpense,
    onDeleteExpense,
}) {
    const hasFilters = Boolean(filters.search || filters.category_id || filters.payment_method);

    const getPaymentBadge = (method) => {
        switch (method) {
            case 'bank_transfer':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                        Bank Transfer
                    </Badge>
                );
            case 'cheque':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                        Cheque
                    </Badge>
                );
            case 'online':
                return (
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">
                        Digital / Card
                    </Badge>
                );
            case 'cash':
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                        Cash
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <FilterBar showReset={hasFilters} onReset={onResetFilters}>
                <SearchInput
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange('search', e?.target ? e.target.value : e)}
                    placeholder="Search expense title, voucher #, payee, or reference..."
                    className="flex-1 min-w-[240px]"
                />

                <FilterSelect
                    value={filters.category_id || ''}
                    onChange={(val) => onFilterChange('category_id', val)}
                    options={categories}
                    valueKey="id"
                    labelKey="name"
                    placeholder="All Categories"
                    className="w-56 shrink-0"
                />

                <select
                    value={filters.payment_method || ''}
                    onChange={(e) => onFilterChange('payment_method', e.target.value)}
                    className="w-44 shrink-0 h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                    <option value="">All Payment Methods</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.value} value={pm.value}>
                            {pm.label}
                        </option>
                    ))}
                </select>
            </FilterBar>

            {/* Expenses Table Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Voucher #</th>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Expense Details</th>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Category</th>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Paid To / Payee</th>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Method</th>
                                    <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase text-xs">Amount</th>
                                    <th className="px-5 py-3.5 text-right font-bold text-slate-600 uppercase text-xs">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {expenses?.data?.length > 0 ? (
                                    expenses.data.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Voucher # */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                    {exp.expense_no}
                                                </span>
                                            </td>

                                            {/* Details & Date */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-semibold text-slate-900 block">
                                                    {exp.title}
                                                </span>
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {exp.expense_date}
                                                    {exp.reference_no && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="font-mono text-slate-500">Ref: {exp.reference_no}</span>
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-5 py-3.5">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-xs">
                                                    {exp.category?.name || 'General'}
                                                </Badge>
                                            </td>

                                            {/* Payee */}
                                            <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                                                {exp.paid_to || '—'}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="px-5 py-3.5">
                                                {getPaymentBadge(exp.payment_method)}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-black text-slate-900 font-mono text-sm block">
                                                    Rs. {Number(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <TableActionButton
                                                        title="Edit Expense"
                                                        icon={Pencil}
                                                        variant="primary"
                                                        onClick={() => onEditExpense(exp)}
                                                    />
                                                    <TableActionButton
                                                        title="Delete Expense"
                                                        icon={Trash2}
                                                        variant="danger"
                                                        onClick={() => onDeleteExpense(exp.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-400">
                                            No expense records found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {expenses?.links && (
                        <Pagination
                            links={expenses.links}
                            from={expenses.from}
                            to={expenses.to}
                            total={expenses.total}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
