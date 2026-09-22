import React, { useState } from 'react';
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
import { CreditCard, ShieldAlert } from 'lucide-react';

export default function SalaryManagementModal({ isOpen, onClose, staff }) {
    if (!staff) return null;

    const [activeTab, setActiveTab] = useState('monthly-settlement');
    const today = new Date().toISOString().split('T')[0];
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const advanceForm = useForm({
        staff_id: staff.id,
        amount: '',
        issued_date: today,
        reason: '',
    });

    const settlementForm = useForm({
        staff_id: staff.id,
        settlement_type: 'monthly',
        month_year: currentMonthYear,
        payment_date: today,
        unpaid_leaves: 0,
        apply_leave_cutoff: false,
        payment_method: 'cash',
        reference_no: '',
        notes: '',
    });

    const baseSalary = parseFloat(staff.salary || 0);
    const pendingAdvances = parseFloat(staff.pending_advances_sum || 0);

    const now = new Date(settlementForm.data.payment_date);
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const workedDays = settlementForm.data.settlement_type === 'resignation_prorated' ? now.getDate() : totalDaysInMonth;

    const dailyRate = totalDaysInMonth > 0 ? baseSalary / totalDaysInMonth : 0;
    let grossPayable = dailyRate * workedDays;

    const leaveCutoffAmount = settlementForm.data.apply_leave_cutoff 
        ? dailyRate * (parseFloat(settlementForm.data.unpaid_leaves) || 0)
        : 0;

    grossPayable -= leaveCutoffAmount;
    const netPayable = Math.max(0, grossPayable - pendingAdvances);

    const handleAdvanceSubmit = (e) => {
        e.preventDefault();
        advanceForm.post(route('staff.salary.advance'), {
            onSuccess: () => {
                advanceForm.reset();
                onClose();
            }
        });
    };

    const handleSettlementSubmit = (e) => {
        e.preventDefault();
        settlementForm.post(route('staff.salary.settlement'), {
            onSuccess: () => {
                settlementForm.reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto p-6">
                <DialogHeader className="border-b pb-3">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between text-slate-800">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <span>Salary & Ledger Management</span>
                        </div>
                        <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700">
                            {staff.employee_code || `EMP-${staff.id}`}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs mt-2">
                    <div>
                        <span className="font-bold text-slate-800 text-sm block">{staff.first_name} {staff.last_name}</span>
                        <span className="text-slate-500">{staff.designation || 'Staff Member'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 block">Base Salary: <strong className="text-slate-800">PKR {baseSalary.toLocaleString()}</strong></span>
                        <span className="text-amber-600 font-semibold block">Pending Advance: PKR {pendingAdvances.toLocaleString()}</span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
                    <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-lg">
                        <TabsTrigger value="monthly-settlement" className="text-xs font-bold">Salary Settlement</TabsTrigger>
                        <TabsTrigger value="issue-advance" className="text-xs font-bold">Issue Advance / Partial</TabsTrigger>
                        <TabsTrigger value="ledger-history" className="text-xs font-bold">Ledger History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly-settlement" className="mt-4">
                        <form onSubmit={handleSettlementSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Settlement Mode</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded border border-slate-200 bg-white"
                                        value={settlementForm.data.settlement_type}
                                        onChange={(e) => settlementForm.setData('settlement_type', e.target.value)}
                                    >
                                        <option value="monthly">Regular Month End</option>
                                        <option value="resignation_prorated">Resignation / Termination (Prorated)</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Payment Date</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={settlementForm.data.payment_date}
                                        onChange={(e) => settlementForm.setData('payment_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            {settlementForm.data.settlement_type === 'resignation_prorated' && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2.5 rounded flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>Prorating salary for <strong>{workedDays}</strong> out of <strong>{totalDaysInMonth}</strong> days up to selected date.</span>
                                </div>
                            )}

                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-slate-700">Unpaid Leaves Cutoff (Optional)</Label>
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
                                            <Label className="text-[11px] text-slate-500">Unpaid Leaves Count</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                className="h-8 text-xs bg-white"
                                                value={settlementForm.data.unpaid_leaves}
                                                onChange={(e) => settlementForm.setData('unpaid_leaves', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[11px] text-slate-500">Cutoff Deduction</Label>
                                            <div className="h-8 px-3 flex items-center bg-white border rounded text-red-600 font-bold font-mono">
                                                - PKR {leaveCutoffAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-xs">
                                <div>
                                    <span className="text-slate-500 block">Gross Payable</span>
                                    <span className="font-bold text-slate-800 font-mono">PKR {grossPayable.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Advance Adjusted</span>
                                    <span className="font-bold text-amber-600 font-mono">- PKR {pendingAdvances.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-blue-900 font-bold block">Net Payable</span>
                                    <span className="font-black text-blue-700 text-sm font-mono">PKR {netPayable.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Payment Method</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded border border-slate-200 bg-white"
                                        value={settlementForm.data.payment_method}
                                        onChange={(e) => settlementForm.setData('payment_method', e.target.value)}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Ref / Cheque #</Label>
                                    <Input
                                        className="h-9 text-xs"
                                        placeholder="Optional reference"
                                        value={settlementForm.data.reference_no}
                                        onChange={(e) => settlementForm.setData('reference_no', e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={settlementForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                Process Final Settlement Payment
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="issue-advance" className="mt-4">
                        <form onSubmit={handleAdvanceSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold">Advance Amount (PKR) *</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-xs"
                                        placeholder="e.g. 10000"
                                        value={advanceForm.data.amount}
                                        onChange={(e) => advanceForm.setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-bold">Issued Date *</Label>
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
                                <Label className="text-xs font-bold">Reason / Note</Label>
                                <Input
                                    className="h-9 text-xs"
                                    placeholder="e.g. Advance requested before month end"
                                    value={advanceForm.data.reason}
                                    onChange={(e) => advanceForm.setData('reason', e.target.value)}
                                />
                            </div>

                            <Button type="submit" disabled={advanceForm.processing} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                Issue Advance Payment
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="ledger-history" className="mt-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-xs text-left text-slate-600">
                                <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Description</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Amount</th>
                                        <th className="p-2">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {staff.ledgers && staff.ledgers.length > 0 ? (
                                        staff.ledgers.map((leg) => (
                                            <tr key={leg.id} className="hover:bg-slate-50">
                                                <td className="p-2 font-mono">{leg.transaction_date}</td>
                                                <td className="p-2 font-medium">{leg.description}</td>
                                                <td className="p-2">
                                                    <Badge className={leg.type === 'credit' ? 'bg-emerald-100 text-emerald-800 border-0' : 'bg-amber-100 text-amber-800 border-0'}>
                                                        {leg.type}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 font-bold font-mono">PKR {parseFloat(leg.amount).toLocaleString()}</td>
                                                <td className="p-2 font-bold font-mono text-slate-800">PKR {parseFloat(leg.balance).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-slate-400">No ledger transactions recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 pt-3 border-t">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}