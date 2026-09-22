import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GraduationCap, User, Phone, Mail, MapPin, CreditCard, UserRoundX } from 'lucide-react';
import ManageFeeModal from './ManageFeeModal';

export default function StudentDetailsModal({ isOpen, onClose, student, currentSessionYear = "2026-2027", }) {

    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    if (!student) return null;

    // --- Dynamic Fee Calculations ---
    const feeItems = student.fee_profile?.items || [];

    // Find explicit admission fee item if present in profile items
    const admissionItem = feeItems.find((item) =>
        item.fee_head?.name?.toLowerCase().includes('admission')
    );

    // Check invoice history to derive admission fee payment status
    const invoicesList = student.invoices || student.fee_invoices || [];
    const admissionInvoice = invoicesList.find((inv) =>
        inv.title?.toLowerCase().includes('admission')
    );

    const admissionAmount = admissionItem ? admissionItem.amount : 1000;
    const admissionStatus = admissionInvoice ? admissionInvoice.status : 'paid';

    // Calculate sum of monthly fee heads (tuition + other recurring items)
    const totalMonthlyFee = feeItems.length > 0
        ? feeItems
            .filter((item) => !item.fee_head?.name?.toLowerCase().includes('admission'))
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
        : 1500; // Fallback default if profile items haven't been assigned yet

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between text-slate-800">
                        <span>Student Profile</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700 border-slate-200">
                                #{student.admission_number || 'N/A'}
                            </Badge>
                            <Badge
                                className={
                                    student.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 capitalize'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 capitalize'
                                }
                            >
                                {student.status || 'Active'}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6 mt-2">
                    {/* LEFT SIDEBAR: BASIC INFO */}
                    <aside className="w-full md:w-72 shrink-0 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200">
                            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-500 flex items-center justify-center font-bold text-xl mb-2">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                            <h3 className="font-bold text-slate-800 text-base">
                                {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">
                                {student.gender || 'N/A'} • DOB: {student.date_of_birth || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600">
                            <div className="flex items-start space-x-2.5">
                                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-400 block text-[11px] font-medium">Class & Section</span>
                                    <span className="font-semibold text-slate-800">
                                        {student.current_enrollment?.school_class?.name || 'Unassigned'}
                                        {student.current_enrollment?.section?.name
                                            ? ` (${student.current_enrollment.section.name})`
                                            : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200/60">
                                <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-400 block text-[11px] font-medium">Guardian</span>
                                    <span className="font-medium text-slate-800">{student.guardian_name || 'N/A'}</span>
                                    {student.guardian_relation && (
                                        <span className="text-slate-500 text-[11px]"> ({student.guardian_relation})</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-2.5">
                                <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-400 block text-[11px] font-medium">Contact Phone</span>
                                    <span className="font-medium text-slate-800">{student.guardian_phone || 'N/A'}</span>
                                </div>
                            </div>

                            {student.guardian_email && (
                                <div className="flex items-start space-x-2.5">
                                    <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                                        <span className="font-medium text-slate-800 break-all">{student.guardian_email}</span>
                                    </div>
                                </div>
                            )}

                            {student.address && (
                                <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200/60">
                                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-slate-400 block text-[11px] font-medium">Address</span>
                                        <span className="font-medium text-slate-800 leading-tight block">{student.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* RIGHT SIDE: TABS FOR FEE HISTORY & RESULT HISTORY */}
                    <main className="flex-1 min-w-0">
                        <Tabs defaultValue="fee-history" className="w-full">
                            <div className="border-b border-slate-200 mb-4">
                                <TabsList className="bg-transparent p-0 h-auto space-x-6">
                                    <TabsTrigger
                                        value="fee-history"
                                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none px-1 pb-2.5 pt-0 font-semibold text-xs text-slate-500 shadow-none"
                                    >
                                        <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                        Fee History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="result-history"
                                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none px-1 pb-2.5 pt-0 font-semibold text-xs text-slate-500 shadow-none"
                                    >
                                        <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                                        Result History
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="fee-history" className="mt-0 space-y-4">
                                {/* DYNAMIC FEE SUMMARY TABLE */}
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-xs text-left text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Admission Fee (Status)</th>
                                                <th className="px-3 py-2.5">Monthly Fee</th>
                                                <th className="px-3 py-2.5">Concession / Remarks</th>
                                                <th className="px-3 py-2.5">Manage Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-mono font-bold text-slate-700">
                                                    Rs. {admissionAmount}{' '}
                                                    <Badge
                                                        className={
                                                            admissionStatus === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-800 border-0 capitalize ml-1'
                                                                : 'bg-amber-100 text-amber-800 border-0 capitalize ml-1'
                                                        }
                                                    >
                                                        {admissionStatus}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2 font-semibold text-slate-800">
                                                    Rs. {totalMonthlyFee.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-slate-600">
                                                    {student.fee_profile?.discount_reason ? (
                                                        <span className="text-amber-700 font-medium">
                                                            {student.fee_profile.discount_reason}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">Standard Rate</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        variant="outline"
                                                        size="xs"
                                                        className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                                                        onClick={() => setIsFeeModalOpen(true)}
                                                    >
                                                        Manage Fee
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* INVOICE HISTORY TABLE */}
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-xs text-left text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Invoice #</th>
                                                <th className="px-3 py-2.5">Title / Month</th>
                                                <th className="px-3 py-2.5">Amount</th>
                                                <th className="px-3 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {invoicesList && invoicesList.length > 0 ? (
                                                invoicesList.map((inv) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2 font-mono font-bold text-slate-700">
                                                            {inv.invoice_number || inv.invoice_no || `INV-${inv.id}`}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-800">
                                                            {inv.title || inv.month_name || 'Monthly Fee'}
                                                        </td>
                                                        <td className="px-3 py-2 font-semibold text-slate-800">
                                                            Rs. {(inv.amount || inv.total_amount)?.toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Badge
                                                                className={
                                                                    inv.status === 'paid'
                                                                        ? 'bg-emerald-100 text-emerald-800 border-0 capitalize'
                                                                        : inv.status === 'partially_paid'
                                                                            ? 'bg-blue-100 text-blue-800 border-0 capitalize'
                                                                            : 'bg-amber-100 text-amber-800 border-0 capitalize'
                                                                }
                                                            >
                                                                {inv.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-6 text-slate-400">
                                                        No fee invoices available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="result-history" className="mt-0">
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-xs text-left text-slate-600">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Exam Term</th>
                                                <th className="px-3 py-2.5">Total</th>
                                                <th className="px-3 py-2.5">Obtained</th>
                                                <th className="px-3 py-2.5">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {student.exam_results && student.exam_results.length > 0 ? (
                                                student.exam_results.map((res) => (
                                                    <tr key={res.id} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2 font-medium text-slate-800">
                                                            {res.exam_name}
                                                        </td>
                                                        <td className="px-3 py-2">{res.total_marks || res.total_max_marks}</td>
                                                        <td className="px-3 py-2 font-semibold text-slate-800">
                                                            {res.obtained_marks || res.total_obtained_marks}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                                            >
                                                                {res.grade}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-6 text-slate-400">
                                                        No result records available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>

                <DialogFooter className="mt-4 pt-3 border-t">
                    <Button variant="outline" onClick={onClose}>
                        <UserRoundX className="h-4 w-4" />
                        Close Profile
                    </Button>
                </DialogFooter>
            </DialogContent>
            <ManageFeeModal
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                student={student}
                currentSessionYear={currentSessionYear}
                onSuccess={() => {
                    setIsFeeModalOpen(false);
                }}
            />
        </Dialog>
    );
}