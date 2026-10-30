import React, { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    CreditCard,
    ShieldAlert,
    Banknote,
    Receipt,
    History,
    FileText,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    UserCheck
} from 'lucide-react';

export default function SalaryManagementModal({ isOpen, onClose, staff }) {
    if (!staff) return null;

    const [activeTab, setActiveTab] = useState('monthly-settlement');
    const today = new Date().toISOString().split('T')[0];
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    // Form: Issue Advance
    const advanceForm = useForm({
        staff_id: staff.id,
        amount: '',
        issued_date: today,
        reason: '',
    });

    // Form: Salary Settlement
    const settlementForm = useForm({
        staff_id: staff.id,
        settlement_type: 'monthly',
        month_year: currentMonthYear,
        payment_date: today,
        unpaid_leaves: 0,
        apply_leave_cutoff: false,
        advance_adjusted: 0,
        payment_method: 'cash',
        reference_no: '',
        notes: '',
    });

    // Deduction Mode: 'full' (all remaining advance), 'custom' (multi-salary installments), 'none' (0 deduction)
    const [deductionMode, setDeductionMode] = useState('full');
    const [customDeduction, setCustomDeduction] = useState('');

    const baseSalary = parseFloat(staff.salary || 0);
    const pendingAdvances = parseFloat(staff.pending_advances_sum || 0);

    const settlements = useMemo(() => {
        return staff.salary_settlements || staff.salarySettlements || [];
    }, [staff]);

    const advances = useMemo(() => {
        return staff.salary_advances || staff.salaryAdvances || [];
    }, [staff]);

    const ledgers = useMemo(() => {
        return staff.ledgers || [];
    }, [staff]);

    // Proration & Daily Rate Calculations
    const now = new Date(settlementForm.data.payment_date || today);
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const workedDays = settlementForm.data.settlement_type === 'resignation_prorated' 
        ? Math.min(now.getDate(), totalDaysInMonth) 
        : totalDaysInMonth;

    const dailyRate = totalDaysInMonth > 0 ? baseSalary / totalDaysInMonth : 0;
    let grossPayable = dailyRate * workedDays;

    const leaveCutoffAmount = settlementForm.data.apply_leave_cutoff 
        ? dailyRate * (parseFloat(settlementForm.data.unpaid_leaves) || 0)
        : 0;

    grossPayable = Math.max(0, grossPayable - leaveCutoffAmount);

    // Max allowable deduction in this salary is limited by both pending advances debt and gross salary
    const maxAllowableDeduction = Math.min(pendingAdvances, grossPayable);

    // Compute advance to adjust based on selected mode
    let advanceAdjusted = 0;
    if (pendingAdvances > 0) {
        if (deductionMode === 'full') {
            advanceAdjusted = maxAllowableDeduction;
        } else if (deductionMode === 'custom') {
            const entered = parseFloat(customDeduction) || 0;
            advanceAdjusted = Math.max(0, Math.min(entered, maxAllowableDeduction));
        } else {
            advanceAdjusted = 0;
        }
    }

    const netPayable = Math.max(0, grossPayable - advanceAdjusted);
    const remainingAdvanceAfter = Math.max(0, pendingAdvances - advanceAdjusted);

    const handleAdvanceSubmit = (e) => {
        e.preventDefault();
        advanceForm.post(route('staff.salary.advance'), {
            preserveScroll: true,
            onSuccess: () => {
                advanceForm.reset();
                setActiveTab('advances-history');
            }
        });
    };

    const handleSettlementSubmit = (e) => {
        e.preventDefault();
        settlementForm
            .transform((data) => ({
                ...data,
                advance_adjusted: advanceAdjusted,
            }))
            .post(route('staff.salary.settlement'), {
                preserveScroll: true,
                onSuccess: () => {
                    settlementForm.reset();
                    setActiveTab('settlements-history');
                }
            });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="border-b pb-3">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between text-slate-800">
                        <div className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-emerald-600" />
                            <span>Staff Salary & Advances Management</span>
                        </div>
                        <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700">
                            {staff.employee_id || `EMP-${staff.id}`}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {/* Staff Quick Profile Summary */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mt-2">
                    <div>
                        <span className="font-bold text-slate-800 text-sm block">
                            {staff.first_name} {staff.last_name}
                        </span>
                        <span className="text-slate-500">{staff.designation || 'Staff Member'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block font-medium">Base Monthly Salary</span>
                        <span className="font-bold text-slate-800 text-sm font-mono">
                            PKR {baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block font-medium">Outstanding Advance Debt</span>
                        <span className={`font-bold text-sm font-mono ${pendingAdvances > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                            PKR {pendingAdvances.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block font-medium">Employment Status</span>
                        <Badge className={staff.status === 'active' ? "bg-emerald-100 text-emerald-800 border-0 capitalize" : "bg-slate-100 text-slate-700 border-0 capitalize"}>
                            {staff.status || 'Active'}
                        </Badge>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
                    <TabsList className="grid grid-cols-5 bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="monthly-settlement" className="text-xs font-semibold">
                            <Banknote className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                            Pay Salary
                        </TabsTrigger>
                        <TabsTrigger value="issue-advance" className="text-xs font-semibold">
                            <CreditCard className="h-3.5 w-3.5 mr-1 text-amber-600" />
                            Give Advance
                        </TabsTrigger>
                        <TabsTrigger value="settlements-history" className="text-xs font-semibold">
                            <Receipt className="h-3.5 w-3.5 mr-1 text-blue-600" />
                            Salary Slips ({settlements.length})
                        </TabsTrigger>
                        <TabsTrigger value="advances-history" className="text-xs font-semibold">
                            <Clock className="h-3.5 w-3.5 mr-1 text-purple-600" />
                            Advances ({advances.length})
                        </TabsTrigger>
                        <TabsTrigger value="ledger-history" className="text-xs font-semibold">
                            <History className="h-3.5 w-3.5 mr-1 text-slate-600" />
                            Ledger Log
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: SALARY SETTLEMENT */}
                    <TabsContent value="monthly-settlement" className="mt-4">
                        <form onSubmit={handleSettlementSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Settlement Type *</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded border border-slate-200 bg-white focus:ring-1 focus:ring-blue-500"
                                        value={settlementForm.data.settlement_type}
                                        onChange={(e) => settlementForm.setData('settlement_type', e.target.value)}
                                    >
                                        <option value="monthly">Regular Month End Settlement</option>
                                        <option value="resignation_prorated">Resignation / Prorated Exit Settlement</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Salary Month / Period *</Label>
                                    <Input
                                        type="month"
                                        className="h-9 text-xs"
                                        value={settlementForm.data.month_year}
                                        onChange={(e) => settlementForm.setData('month_year', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Disbursement Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={settlementForm.data.payment_date}
                                        onChange={(e) => settlementForm.setData('payment_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {settlementForm.data.settlement_type === 'resignation_prorated' && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>
                                        Prorating salary for <strong>{workedDays}</strong> out of <strong>{totalDaysInMonth}</strong> days up to selected date. Staff status will automatically become <strong>Resigned</strong> upon settlement.
                                    </span>
                                </div>
                            )}

                            {/* Unpaid Leaves Cutoff */}
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700">Unpaid Leaves Cutoff (Optional)</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settlementForm.data.apply_leave_cutoff}
                                            onChange={(e) => settlementForm.setData('apply_leave_cutoff', e.target.checked)}
                                            className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        />
                                        <span className="font-semibold text-slate-600">Deduct Unpaid Leaves</span>
                                    </label>
                                </div>

                                {settlementForm.data.apply_leave_cutoff && (
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                        <div>
                                            <Label className="text-[11px] text-slate-500">Unpaid Leaves Count (Days)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={workedDays}
                                                className="h-8 text-xs bg-white"
                                                value={settlementForm.data.unpaid_leaves}
                                                onChange={(e) => settlementForm.setData('unpaid_leaves', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[11px] text-slate-500">Cutoff Amount Deducted</Label>
                                            <div className="h-8 px-3 flex items-center bg-white border rounded text-red-600 font-bold font-mono">
                                                - PKR {leaveCutoffAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Advance Deduction & Installment Section */}
                            <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-lg text-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-amber-900 block text-xs">
                                            Salary Advance Adjustment & Installments
                                        </span>
                                        <span className="text-amber-700 text-[11px]">
                                            Outstanding Advance: <strong>PKR {pendingAdvances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                                        </span>
                                    </div>
                                    {pendingAdvances > 0 ? (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                                            Advance Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500 bg-white">
                                            No Advance Debt
                                        </Badge>
                                    )}
                                </div>

                                {pendingAdvances > 0 ? (
                                    <div className="space-y-3 pt-2 border-t border-amber-200/60">
                                        <Label className="text-[11px] font-bold text-slate-700 block">
                                            How would you like to adjust the advance in this salary?
                                        </Label>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <label
                                                className={`flex items-start p-2.5 rounded-md border cursor-pointer transition-all ${
                                                    deductionMode === 'full'
                                                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deduction_mode"
                                                    value="full"
                                                    checked={deductionMode === 'full'}
                                                    onChange={() => setDeductionMode('full')}
                                                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                                />
                                                <div className="ml-2">
                                                    <span className="font-bold block text-xs">Deduct in One Salary (Full)</span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Deduct entire PKR {maxAllowableDeduction.toFixed(2)} now
                                                    </span>
                                                </div>
                                            </label>

                                            <label
                                                className={`flex items-start p-2.5 rounded-md border cursor-pointer transition-all ${
                                                    deductionMode === 'custom'
                                                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deduction_mode"
                                                    value="custom"
                                                    checked={deductionMode === 'custom'}
                                                    onChange={() => setDeductionMode('custom')}
                                                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                                />
                                                <div className="ml-2">
                                                    <span className="font-bold block text-xs">Deduct in Multiple Salaries (Installment)</span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        Specify custom partial deduction amount
                                                    </span>
                                                </div>
                                            </label>

                                            <label
                                                className={`flex items-start p-2.5 rounded-md border cursor-pointer transition-all ${
                                                    deductionMode === 'none'
                                                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deduction_mode"
                                                    value="none"
                                                    checked={deductionMode === 'none'}
                                                    onChange={() => setDeductionMode('none')}
                                                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                                />
                                                <div className="ml-2">
                                                    <span className="font-bold block text-xs">Do Not Deduct This Month</span>
                                                    <span className="text-[10px] text-slate-500 block">
                                                        PKR 0.00 deduction for this month
                                                    </span>
                                                </div>
                                            </label>
                                        </div>

                                        {deductionMode === 'custom' && (
                                            <div className="bg-white p-3 rounded border border-amber-300 space-y-2 mt-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-bold text-slate-800">
                                                        Installment Amount to Deduct (PKR) *
                                                    </Label>
                                                    <span className="text-[11px] text-slate-500">
                                                        Max deduction allowed: <strong>PKR {maxAllowableDeduction.toFixed(2)}</strong>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={maxAllowableDeduction}
                                                        placeholder={`e.g. ${Math.min(5000, maxAllowableDeduction)}`}
                                                        className="h-9 text-xs"
                                                        value={customDeduction}
                                                        onChange={(e) => setCustomDeduction(e.target.value)}
                                                        required={deductionMode === 'custom'}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCustomDeduction((maxAllowableDeduction / 2).toFixed(0))}
                                                        className="h-9 text-xs shrink-0"
                                                    >
                                                        50% (PKR {(maxAllowableDeduction / 2).toFixed(0)})
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCustomDeduction(maxAllowableDeduction.toFixed(0))}
                                                        className="h-9 text-xs shrink-0"
                                                    >
                                                        Max (100%)
                                                    </Button>
                                                </div>
                                                {parseFloat(customDeduction) > maxAllowableDeduction && (
                                                    <p className="text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Cannot deduct more than outstanding advance or gross payable.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-xs italic">
                                        This staff member does not currently have any pending advance payments.
                                    </p>
                                )}
                            </div>

                            {/* Real-time Calculation Matrix */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-3.5 rounded-lg text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Gross Payable</span>
                                    <span className="font-bold text-slate-100 font-mono text-sm">
                                        PKR {grossPayable.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-amber-400 block text-[11px]">Advance Deducted</span>
                                    <span className="font-bold text-amber-300 font-mono text-sm">
                                        - PKR {advanceAdjusted.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-emerald-400 font-bold block text-[11px]">Net Salary Disbursed</span>
                                    <span className="font-black text-emerald-300 font-mono text-base">
                                        PKR {netPayable.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Remaining Advance Debt</span>
                                    <span className="font-bold text-slate-300 font-mono text-sm">
                                        PKR {remainingAdvanceAfter.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Payment Method *</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded border border-slate-200 bg-white"
                                        value={settlementForm.data.payment_method}
                                        onChange={(e) => settlementForm.setData('payment_method', e.target.value)}
                                    >
                                        <option value="cash">Cash in Hand</option>
                                        <option value="bank_transfer">Direct Bank Transfer</option>
                                        <option value="cheque">Bank Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Cheque / Reference #</Label>
                                    <Input
                                        className="h-9 text-xs"
                                        placeholder="e.g. CHQ-98124 or TRX-771"
                                        value={settlementForm.data.reference_no}
                                        onChange={(e) => settlementForm.setData('reference_no', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Remarks / Notes</Label>
                                    <Input
                                        className="h-9 text-xs"
                                        placeholder="Optional payment notes"
                                        value={settlementForm.data.notes}
                                        onChange={(e) => settlementForm.setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={settlementForm.processing} 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 shadow-sm"
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {settlementForm.processing ? 'Processing Settlement...' : `Confirm & Disburse Net Salary (PKR ${netPayable.toFixed(2)})`}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* TAB 2: ISSUE ADVANCE */}
                    <TabsContent value="issue-advance" className="mt-4">
                        <form onSubmit={handleAdvanceSubmit} className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs">
                                <span className="font-bold block mb-1">Advance Disbursement Guidelines</span>
                                <p>
                                    Issuing an advance against salary immediately records a debit entry in the staff ledger. 
                                    You can subsequently deduct this advance in a single salary payment or spread it across multiple monthly salaries using installments.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Advance Amount (PKR) *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        className="h-9 text-xs"
                                        placeholder="e.g. 10000"
                                        value={advanceForm.data.amount}
                                        onChange={(e) => advanceForm.setData('amount', e.target.value)}
                                        required
                                    />
                                    {advanceForm.errors.amount && (
                                        <span className="text-xs text-red-500">{advanceForm.errors.amount}</span>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-slate-700">Disbursement Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={advanceForm.data.issued_date}
                                        onChange={(e) => advanceForm.setData('issued_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-slate-700">Reason / Description</Label>
                                <Input
                                    className="h-9 text-xs"
                                    placeholder="e.g. Emergency medical advance, Eid festival advance"
                                    value={advanceForm.data.reason}
                                    onChange={(e) => advanceForm.setData('reason', e.target.value)}
                                />
                            </div>

                            {advanceForm.data.amount > 0 && (
                                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
                                    <span className="text-slate-500 block">
                                        Current Pending Advance: <strong>PKR {pendingAdvances.toLocaleString()}</strong>
                                    </span>
                                    <span className="text-amber-700 font-bold block">
                                        Total Advance Debt After This Issue: PKR {(pendingAdvances + (parseFloat(advanceForm.data.amount) || 0)).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                disabled={advanceForm.processing} 
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 shadow-sm"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                {advanceForm.processing ? 'Issuing Advance...' : 'Issue Advance Payment to Staff'}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* TAB 3: SALARY SETTLEMENTS HISTORY */}
                    <TabsContent value="settlements-history" className="mt-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase sticky top-0">
                                        <tr>
                                            <th className="p-2.5">Voucher #</th>
                                            <th className="p-2.5">Period / Month</th>
                                            <th className="p-2.5">Payment Date</th>
                                            <th className="p-2.5">Gross Payable</th>
                                            <th className="p-2.5">Advance Deducted</th>
                                            <th className="p-2.5">Net Paid</th>
                                            <th className="p-2.5">Method</th>
                                            <th className="p-2.5">Processed By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {settlements.length > 0 ? (
                                            settlements.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-2.5 font-mono font-bold text-slate-800">
                                                        {item.voucher_no}
                                                    </td>
                                                    <td className="p-2.5 font-semibold text-slate-700">
                                                        {item.month_year || 'N/A'}
                                                    </td>
                                                    <td className="p-2.5">{item.payment_date}</td>
                                                    <td className="p-2.5 font-mono">
                                                        PKR {parseFloat(item.gross_payable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-2.5 font-mono text-amber-700 font-semibold">
                                                        {parseFloat(item.advance_adjusted || 0) > 0 ? (
                                                            `- PKR ${parseFloat(item.advance_adjusted).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                        ) : (
                                                            'PKR 0.00'
                                                        )}
                                                    </td>
                                                    <td className="p-2.5 font-mono font-bold text-emerald-700">
                                                        PKR {parseFloat(item.net_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-2.5 capitalize">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {item.payment_method?.replace('_', ' ') || 'Cash'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2.5 text-slate-500">
                                                        {item.processor?.name || 'Administrator'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-8 text-slate-400">
                                                    No salary settlements recorded yet for this staff member.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 4: ADVANCES HISTORY */}
                    <TabsContent value="advances-history" className="mt-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase sticky top-0">
                                        <tr>
                                            <th className="p-2.5">Issued Date</th>
                                            <th className="p-2.5">Total Advance</th>
                                            <th className="p-2.5">Adjusted So Far</th>
                                            <th className="p-2.5">Remaining Balance</th>
                                            <th className="p-2.5">Status</th>
                                            <th className="p-2.5">Reason / Notes</th>
                                            <th className="p-2.5">Issued By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {advances.length > 0 ? (
                                            advances.map((adv) => {
                                                const total = parseFloat(adv.amount || 0);
                                                const adjusted = parseFloat(adv.adjusted_amount || 0);
                                                const remaining = Math.max(0, total - adjusted);

                                                return (
                                                    <tr key={adv.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-2.5 font-mono">{adv.issued_date}</td>
                                                        <td className="p-2.5 font-mono font-bold text-slate-800">
                                                            PKR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2.5 font-mono text-emerald-700 font-semibold">
                                                            PKR {adjusted.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2.5 font-mono font-bold text-amber-700">
                                                            PKR {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2.5">
                                                            {adv.status === 'adjusted' ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                                                                    Fully Adjusted
                                                                </Badge>
                                                            ) : adv.status === 'partially_adjusted' ? (
                                                                <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px]">
                                                                    Partially Adjusted
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-blue-100 text-blue-800 border-0 text-[10px]">
                                                                    Pending Adjustment
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 text-slate-600">{adv.reason || 'Salary advance'}</td>
                                                        <td className="p-2.5 text-slate-500">{adv.issuer?.name || 'Administrator'}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-8 text-slate-400">
                                                    No salary advances found for this staff member.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB 5: LEDGER HISTORY */}
                    <TabsContent value="ledger-history" className="mt-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-xs text-left text-slate-600">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase sticky top-0">
                                        <tr>
                                            <th className="p-2.5">Date</th>
                                            <th className="p-2.5">Description</th>
                                            <th className="p-2.5">Entry Type</th>
                                            <th className="p-2.5 text-right">Amount</th>
                                            <th className="p-2.5 text-right">Running Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {ledgers.length > 0 ? (
                                            ledgers.map((leg) => (
                                                <tr key={leg.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-2.5 font-mono text-slate-700">{leg.transaction_date}</td>
                                                    <td className="p-2.5 font-medium text-slate-800">{leg.description}</td>
                                                    <td className="p-2.5">
                                                        <Badge className={leg.type === 'credit' ? 'bg-emerald-100 text-emerald-800 border-0 text-[10px]' : 'bg-amber-100 text-amber-800 border-0 text-[10px]'}>
                                                            {leg.type === 'credit' ? 'Credit (Earned)' : 'Debit (Disbursed)'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-2.5 text-right font-mono font-bold">
                                                        PKR {parseFloat(leg.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                                                        PKR {parseFloat(leg.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8 text-slate-400">
                                                    No ledger transactions recorded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 pt-3 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}