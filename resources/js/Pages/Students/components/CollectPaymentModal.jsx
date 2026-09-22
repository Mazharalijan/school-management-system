import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserRoundX } from 'lucide-react';

export default function CollectPaymentModal({ isOpen, onClose, student, unpaidInvoices: rawUnpaidInvoices }) {
  const [amountPaidInput, setAmountPaidInput] = useState('');

  // Extract all invoices across student record
  const allInvoices = useMemo(() => student?.invoices || student?.fee_invoices || [], [student]);

  // Extract only pending (unpaid/partially paid/overdue) invoices for allocation
  const unpaidInvoices = useMemo(() => {
    if (rawUnpaidInvoices && rawUnpaidInvoices.length > 0) {
      return rawUnpaidInvoices;
    }
    return allInvoices.filter((inv) =>
      ['unpaid', 'partially_paid', 'overdue'].includes(inv.status)
    );
  }, [rawUnpaidInvoices, allInvoices]);

  // --- Dynamic Fee Calculations ---
  const totalMonthlyFee = useMemo(() => {
    const feeItems = student?.fee_profile?.items || [];

    if (feeItems.length > 0) {
      return feeItems
        .filter((item) => !item.fee_head?.name?.toLowerCase().includes('admission'))
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }

    // Fallbacks if fee_profile items are not yet populated
    if (student?.fee_profile?.base_monthly_fee) {
      return parseFloat(student.fee_profile.base_monthly_fee);
    }

    return 1500; // Default fallback
  }, [student]);

  const { data, setData, post, processing, errors, reset } = useForm({
    student_id: student?.id || '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    transaction_reference: '',
    note: '',
  });

  // Keep form student_id synced with prop
  useEffect(() => {
    if (student?.id) {
      setData('student_id', student.id);
    }
  }, [student]);

  // Latest Invoice (or current active cycle month)
  const latestInvoice = allInvoices[allInvoices.length - 1] || null;

  // Total Balance Payable across remaining unpaid invoices
  const totalBalanceDue = useMemo(() => {
    return unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.due_amount || 0), 0);
  }, [unpaidInvoices]);

  // Arrears calculations (unpaid total excluding current month invoice)
  const totalDues = Math.max(0, totalBalanceDue - (latestInvoice?.due_amount || 0));

  // Real-time FIFO Allocation Computation
  const fifoAllocations = useMemo(() => {
    const cash = parseFloat(amountPaidInput) || 0;
    let remainingCash = cash;

    return unpaidInvoices.map((invoice) => {
      const due = parseFloat(invoice.due_amount || 0);
      let allocated = 0;

      if (remainingCash > 0) {
        allocated = Math.min(remainingCash, due);
        remainingCash -= allocated;
      }

      const newDue = due - allocated;
      let newStatus = 'unpaid';
      if (newDue <= 0) newStatus = 'paid';
      else if (allocated > 0) newStatus = 'partially_paid';

      return {
        ...invoice,
        allocated,
        newDue,
        newStatus,
      };
    });
  }, [unpaidInvoices, amountPaidInput]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmountPaidInput(val);
    setData('amount_paid', val);
  };

  const handleQuickFill = (amount) => {
    const val = amount.toString();
    setAmountPaidInput(val);
    setData('amount_paid', val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('fees.payments.collect'), {
      onSuccess: () => {
        reset();
        setAmountPaidInput('');
        onClose();
      },
    });
  };

  if (!student) return null;
  const classInfo = student.current_enrollment?.school_class;
  const sectionInfo = student.current_enrollment?.section;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex justify-between items-center w-full pr-6">
          <span className="text-xl font-bold">Collect Fee Payment</span>
          <span className="text-sm font-normal text-slate-500">
            Admission / Roll: <span className="font-semibold text-slate-800">{student.admission_number || student.roll_number}</span>
          </span>
        </div>
      }
      maxWidth="sm:max-w-4xl"
      footer={
        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>
            <UserRoundX className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            form="collect-payment-form"
            disabled={processing || !amountPaidInput || parseFloat(amountPaidInput) <= 0}
            className="bg-slate-800 hover:bg-slate-900 text-white gap-2"
          >
            <UserCheck className="h-4 w-4" />
            {processing ? 'Processing Payment...' : 'Collect Payment'}
          </Button>
        </div>
      }
    >
      {/* Student Brief Header */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
        <div>
          <p className="text-slate-500 uppercase font-medium">Student Name</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{student.first_name} {student.last_name}</p>
          <p className="text-[11px] text-slate-500">
            {classInfo?.name || 'Class N/A'} ({sectionInfo?.name || 'Sec N/A'})
          </p>
        </div>

        <div>
          <p className="text-slate-500 uppercase font-medium">Monthly Tuition Fee</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">
            Rs. {totalMonthlyFee.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">
            {student?.fee_profile?.items?.length > 0 ? `${student.fee_profile.items.length} Fee Items` : 'Standard Profile'}
          </p>
        </div>

        <div>
          <p className="text-slate-500 uppercase font-medium">Previous Dues / Arrears</p>
          <p className="font-bold text-amber-700 text-sm mt-0.5">
            Rs. {totalDues.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-600 font-medium">
            {unpaidInvoices.length > 1 ? `${unpaidInvoices.length - 1} Overdue Voucher(s)` : 'No prior arrears'}
          </p>
        </div>

        <div>
          <p className="text-slate-500 uppercase font-medium">Total Balance Payable</p>
          <p className={`font-bold text-base mt-0.5 ${totalBalanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            Rs. {totalBalanceDue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {totalBalanceDue > 0 ? 'Cumulative Total Due' : 'All Clear / Fully Paid'}
          </p>
        </div>
      </div>

      <form id="collect-payment-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount_paid">Amount Received (Rs.) *</Label>
            <Input
              id="amount_paid"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amountPaidInput}
              onChange={handleAmountChange}
              className="mt-1 font-semibold"
              required
            />
            {errors.amount_paid && <p className="text-xs text-red-500 mt-1">{errors.amount_paid}</p>}

            {/* Quick Preset Buttons */}
            {totalBalanceDue > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill(totalBalanceDue)}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Clear Total Balance (Rs. {totalBalanceDue})
                </Button>
                {unpaidInvoices.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFill(unpaidInvoices[0].due_amount)}
                    className="text-xs"
                  >
                    Oldest Voucher (Rs. {unpaidInvoices[0].due_amount})
                  </Button>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              value={data.payment_date}
              onChange={(e) => setData('payment_date', e.target.value)}
              className="mt-1"
              required
            />
            {errors.payment_date && <p className="text-xs text-red-500 mt-1">{errors.payment_date}</p>}
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={data.payment_method}
              onValueChange={(val) => setData('payment_method', val)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transaction_reference">Ref / Cheque No. (Optional)</Label>
            <Input
              id="transaction_reference"
              type="text"
              placeholder="e.g. TXN-98123"
              value={data.transaction_reference}
              onChange={(e) => setData('transaction_reference', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="note">Remarks / Note</Label>
          <Input
            id="note"
            type="text"
            placeholder="e.g. Received partial cash payment"
            value={data.note}
            onChange={(e) => setData('note', e.target.value)}
            className="mt-1 text-xs"
          />
        </div>

        {/* Real-time FIFO Allocation Preview Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live FIFO Allocation Preview (Chronological Settlement)
            </h4>
            <span className="text-xs text-slate-500">Oldest voucher settled first</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Invoice / Month</th>
                <th className="p-2.5 text-right">Original Due</th>
                <th className="p-2.5 text-right">Allocated Payment</th>
                <th className="p-2.5 text-right">Remaining Due</th>
                <th className="p-2.5 text-center">New Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fifoAllocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-emerald-600 font-medium bg-emerald-50/20">
                    No outstanding invoices found. Student is fully up to date.
                  </td>
                </tr>
              ) : (
                fifoAllocations.map((inv) => (
                  <tr
                    key={inv.id}
                    className={
                      inv.allocated > 0 ? 'bg-emerald-50/40 transition-colors' : 'hover:bg-slate-50'
                    }
                  >
                    <td className="p-2.5 font-medium text-slate-800">
                      {inv.month} {inv.session_year}
                      <span className="block text-[10px] text-slate-400">{inv.invoice_no}</span>
                    </td>
                    <td className="p-2.5 text-right text-slate-600">
                      Rs. {parseFloat(inv.due_amount).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      {inv.allocated > 0 ? `+Rs. ${inv.allocated.toLocaleString()}` : 'Rs. 0'}
                    </td>
                    <td className="p-2.5 text-right font-semibold text-slate-700">
                      Rs. {inv.newDue.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center">
                      {inv.newStatus === 'paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                          Fully Paid
                        </span>
                      )}
                      {inv.newStatus === 'partially_paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium text-[10px]">
                          Partially Paid
                        </span>
                      )}
                      {inv.newStatus === 'unpaid' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </form>
    </Modal>
  );
}