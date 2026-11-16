import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GraduationCap, User, Phone, Mail, MapPin, CreditCard, UserRoundX, ShieldCheck, Award, Printer, Plus, FileText, AlertCircle, Receipt } from 'lucide-react';
import ManageFeeModal from './ManageFeeModal';
import ProfileAvatar from '@/components/ProfileAvatar';
import Pagination from '@/components/Pagination';
import CertificatePrintModal from '@/Pages/Certificates/components/CertificatePrintModal';
import ImposeFineModal from '@/Pages/Fines/components/ImposeFineModal';
import CollectFineModal from '@/Pages/Fines/components/CollectFineModal';
import FineReceiptModal from '@/Pages/Fines/components/FineReceiptModal';
import { cn } from '@/lib/utils';

export default function StudentDetailsModal({ isOpen, onClose, student, currentSessionYear = "2026-2027", }) {
    // All hooks MUST be declared unconditionally at top of component
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
    const [selectedCertForModal, setSelectedCertForModal] = useState(null);
    const [isImposeFineOpen, setIsImposeFineOpen] = useState(false);
    const [collectFine, setCollectFine] = useState(null);
    const [receiptFine, setReceiptFine] = useState(null);

    // Modal table pagination states
    const [invoicePage, setInvoicePage] = useState(1);
    const [resultPage, setResultPage] = useState(1);
    const [certPage, setCertPage] = useState(1);
    const [finePage, setFinePage] = useState(1);
    const modalPageSize = 5;

    if (!student) return null;

    // --- Dynamic Fee Calculations ---
    const feeItems = student.fee_profile?.items || [];

    // Find explicit admission fee item if present in profile items
    const admissionItem = feeItems.find((item) =>
        item.fee_head?.name?.toLowerCase().includes('admission')
    );

    // Check invoice history to derive admission fee payment status
    const invoicesList = student.invoices || student.fee_invoices || [];
    const certificatesList = student.document_prints || student.documentPrints || [];
    const examResultsList = student.exam_results || student.examResults || [];
    const finesList = student.fines || [];

    const paginatedInvoices = invoicesList.slice((invoicePage - 1) * modalPageSize, invoicePage * modalPageSize);
    const paginatedResults = examResultsList.slice((resultPage - 1) * modalPageSize, resultPage * modalPageSize);
    const paginatedCerts = certificatesList.slice((certPage - 1) * modalPageSize, certPage * modalPageSize);
    const paginatedFines = finesList.slice((finePage - 1) * modalPageSize, finePage * modalPageSize);
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
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border-border">
                <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between text-foreground">
                        <span>Student Profile</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono bg-muted text-muted-foreground border-border">
                                #{student.admission_number || 'N/A'}
                            </Badge>
                            <Badge
                                className={
                                    student.status === 'active'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border-0 capitalize'
                                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border-0 capitalize'
                                }
                            >
                                {student.status || 'Active'}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6 mt-2">
                    {/* LEFT SIDEBAR: BASIC INFO */}
                    <aside className="w-full md:w-72 shrink-0 space-y-4 bg-muted/40 p-4 rounded-xl border border-border">
                        <div className="flex flex-col items-center text-center pb-4 border-b border-border">
                            <ProfileAvatar
                                src={student.photo_url}
                                name={`${student.first_name} ${student.last_name}`}
                                className="h-20 w-20 border-2 border-blue-500 mb-2 shadow-sm"
                                iconClassName="h-10 w-10"
                            />
                            <h3 className="font-bold text-foreground text-base">
                                {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {student.gender || 'N/A'} • DOB: {student.date_of_birth || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-3 text-xs text-muted-foreground">
                            <div className="flex items-start space-x-2.5">
                                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-muted-foreground block text-[11px] font-medium">Class & Section</span>
                                    <span className="font-semibold text-foreground">
                                        {student.current_enrollment?.school_class?.name || 'Unassigned'}
                                        {student.current_enrollment?.section?.name
                                            ? ` (${student.current_enrollment.section.name})`
                                            : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2.5 pt-2 border-t border-border">
                                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-muted-foreground block text-[11px] font-medium">Guardian</span>
                                    <span className="font-medium text-foreground">{student.guardian_name || 'N/A'}</span>
                                    {student.guardian_relation && (
                                        <span className="text-muted-foreground text-[11px]"> ({student.guardian_relation})</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start space-x-2.5">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-muted-foreground block text-[11px] font-medium">Contact Phone</span>
                                    <span className="font-medium text-foreground">{student.guardian_phone || 'N/A'}</span>
                                </div>
                            </div>

                            {student.father_cnic && (
                                <div className="flex items-start space-x-2.5">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-muted-foreground block text-[11px] font-medium">Father / Guardian CNIC</span>
                                        <span className="font-medium font-mono text-foreground">{student.father_cnic}</span>
                                    </div>
                                </div>
                            )}

                            {student.guardian_email && (
                                <div className="flex items-start space-x-2.5">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-muted-foreground block text-[11px] font-medium">Email Address</span>
                                        <span className="font-medium text-foreground break-all">{student.guardian_email}</span>
                                    </div>
                                </div>
                            )}

                            {student.address && (
                                <div className="flex items-start space-x-2.5 pt-2 border-t border-border">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-muted-foreground block text-[11px] font-medium">Address</span>
                                        <span className="font-medium text-foreground leading-tight block">{student.address}</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Document & Printout Actions */}
                            <div className="pt-3 border-t border-border space-y-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                    Official Documents & Actions
                                </span>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCertForModal(null);
                                            setIsCertificateModalOpen(true);
                                        }}
                                        className="w-full justify-start text-xs font-semibold gap-2 h-8 whitespace-nowrap"
                                        title="Issue Certificate"
                                    >
                                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span>Issue Certificate</span>
                                    </Button>

                                    {student.exam_results?.[0] ? (
                                        <Link
                                            href={route('marks.dmc', student.exam_results[0].id)}
                                            className="w-full inline-flex items-center justify-start gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors h-8 whitespace-nowrap"
                                            title="Print DMC"
                                        >
                                            <Printer className="w-4 h-4 text-primary shrink-0" />
                                            <span>Print Latest DMC</span>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="w-full justify-start text-xs font-semibold gap-2 opacity-50 h-8 whitespace-nowrap"
                                            title="No examination results on record"
                                        >
                                            <Printer className="w-4 h-4 shrink-0" />
                                            <span>Print Latest DMC</span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsImposeFineOpen(true)}
                                        className="w-full justify-start text-xs font-semibold gap-2 h-8 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 whitespace-nowrap"
                                        title="Impose Fine"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Impose Fine</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT SIDE: TABS FOR FEE HISTORY & RESULT HISTORY */}
                    <main className="flex-1 min-w-0">
                        <Tabs defaultValue="fee-history" className="w-full space-y-4">
                            <TabsList className="bg-muted p-1 rounded-lg inline-flex flex-wrap gap-1 mb-4">
                                <TabsTrigger value="fee-history" className="flex items-center gap-1.5">
                                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                                    <span>Fee History</span>
                                </TabsTrigger>
                                <TabsTrigger value="result-history" className="flex items-center gap-1.5">
                                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                    <span>Results & DMCs</span>
                                </TabsTrigger>
                                <TabsTrigger value="certificates" className="flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5 shrink-0" />
                                    <span>Certificates</span>
                                </TabsTrigger>
                                <TabsTrigger value="fines" className="flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>Fines ({finesList.length})</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="fee-history" className="mt-0 space-y-4">
                                {/* DYNAMIC FEE SUMMARY TABLE */}
                                <div className="rounded-lg border border-border overflow-hidden bg-card">
                                    <table className="w-full text-xs text-left text-muted-foreground">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Admission Fee (Status)</th>
                                                <th className="px-3 py-2.5">Monthly Fee</th>
                                                <th className="px-3 py-2.5">Concession / Remarks</th>
                                                <th className="px-3 py-2.5">Manage Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            <tr className="hover:bg-muted/50">
                                                <td className="px-3 py-2 font-mono font-bold text-foreground">
                                                    Rs. {admissionAmount}{' '}
                                                    <Badge
                                                        className={
                                                            admissionStatus === 'paid'
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-0 capitalize ml-1'
                                                                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-0 capitalize ml-1'
                                                        }
                                                    >
                                                        {admissionStatus}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2 font-semibold text-foreground">
                                                    Rs. {totalMonthlyFee.toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-muted-foreground">
                                                    {student.fee_profile?.discount_reason ? (
                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                            {student.fee_profile.discount_reason}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Standard Rate</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        variant="outline"
                                                        size="xs"
                                                        className="h-7 px-2.5 text-xs font-semibold border-border hover:bg-muted inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                                        onClick={() => setIsFeeModalOpen(true)}
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Manage Fee</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* INVOICE HISTORY TABLE */}
                                <div className="rounded-lg border border-border overflow-hidden bg-card">
                                    <table className="w-full text-xs text-left text-muted-foreground">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Invoice #</th>
                                                <th className="px-3 py-2.5">Title / Month</th>
                                                <th className="px-3 py-2.5">Amount</th>
                                                <th className="px-3 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedInvoices && paginatedInvoices.length > 0 ? (
                                                paginatedInvoices.map((inv) => (
                                                    <tr key={inv.id} className="hover:bg-muted/50">
                                                        <td className="px-3 py-2 font-mono font-bold text-foreground">
                                                            {inv.invoice_number || inv.invoice_no || `INV-${inv.id}`}
                                                        </td>
                                                        <td className="px-3 py-2 text-foreground">
                                                            {inv.title || inv.month_name || 'Monthly Fee'}
                                                        </td>
                                                        <td className="px-3 py-2 font-semibold text-foreground">
                                                            Rs. {(inv.amount || inv.total_amount)?.toLocaleString()}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Badge
                                                                className={
                                                                    inv.status === 'paid'
                                                                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-0 capitalize'
                                                                        : inv.status === 'partially_paid'
                                                                            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-0 capitalize'
                                                                            : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-0 capitalize'
                                                                }
                                                            >
                                                                {inv.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-6 text-muted-foreground">
                                                        No fee invoices available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        currentPage={invoicePage}
                                        totalPages={Math.ceil(invoicesList.length / modalPageSize)}
                                        total={invoicesList.length}
                                        from={invoicesList.length > 0 ? (invoicePage - 1) * modalPageSize + 1 : 0}
                                        to={Math.min(invoicePage * modalPageSize, invoicesList.length)}
                                        onPageChange={setInvoicePage}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="result-history" className="mt-0">
                                <div className="rounded-lg border border-border overflow-hidden bg-card">
                                    <table className="w-full text-xs text-left text-muted-foreground">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Exam Term</th>
                                                <th className="px-3 py-2.5">Total</th>
                                                <th className="px-3 py-2.5">Obtained</th>
                                                <th className="px-3 py-2.5">Grade</th>
                                                <th className="px-3 py-2.5 text-right">DMC Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedResults && paginatedResults.length > 0 ? (
                                                paginatedResults.map((res) => (
                                                    <tr key={res.id} className="hover:bg-muted/50">
                                                        <td className="px-3 py-2 font-medium text-foreground">
                                                            {res.examSession?.title || res.exam_name || 'Term Exam'}
                                                        </td>
                                                        <td className="px-3 py-2 text-foreground">{res.total_marks || res.total_max_marks}</td>
                                                        <td className="px-3 py-2 font-semibold text-foreground">
                                                            {res.obtained_marks || res.total_obtained_marks}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                            >
                                                                {res.grade}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                                            <Link
                                                                href={route('marks.dmc', res.id)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors whitespace-nowrap shrink-0"
                                                                title="View / Print DMC with Multi-Print Tracking"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Print DMC</span>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-6 text-muted-foreground">
                                                        No result records available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        currentPage={resultPage}
                                        totalPages={Math.ceil(examResultsList.length / modalPageSize)}
                                        total={examResultsList.length}
                                        from={examResultsList.length > 0 ? (resultPage - 1) * modalPageSize + 1 : 0}
                                        to={Math.min(resultPage * modalPageSize, examResultsList.length)}
                                        onPageChange={setResultPage}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="certificates" className="mt-0 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Issued Official Certificates & DMCs
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCertForModal(null);
                                            setIsCertificateModalOpen(true);
                                        }}
                                        className="h-7 text-xs font-semibold gap-1.5 whitespace-nowrap shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5 shrink-0" />
                                        <span>Issue Certificate</span>
                                    </Button>
                                </div>

                                <div className="rounded-lg border border-border overflow-hidden bg-card">
                                    <table className="w-full text-xs text-left text-muted-foreground">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Cert #</th>
                                                <th className="px-3 py-2.5">Title / Type</th>
                                                <th className="px-3 py-2.5">Issue Date</th>
                                                <th className="px-3 py-2.5">Print Status</th>
                                                <th className="px-3 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedCerts && paginatedCerts.length > 0 ? (
                                                paginatedCerts.map((cert) => (
                                                    <tr key={cert.id} className="hover:bg-muted/50">
                                                        <td className="px-3 py-2 font-mono font-bold text-foreground">
                                                             {cert.document_number}
                                                        </td>
                                                        <td className="px-3 py-2 font-medium text-foreground">
                                                            {cert.title}
                                                        </td>
                                                        <td className="px-3 py-2 font-mono">
                                                            {cert.issue_date}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "font-mono font-bold text-[10px]",
                                                                    cert.print_count === 1
                                                                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                                                                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300"
                                                                )}
                                                            >
                                                                {cert.copy_label} ({cert.print_count}x)
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                                            <Button
                                                                variant="outline"
                                                                size="xs"
                                                                onClick={() => {
                                                                    setSelectedCertForModal(cert);
                                                                    setIsCertificateModalOpen(true);
                                                                }}
                                                                className="h-6 px-2 text-[11px] font-semibold gap-1.5 whitespace-nowrap shrink-0 inline-flex items-center"
                                                            >
                                                                <Printer className="w-3 h-3 shrink-0" />
                                                                <span>Print Copy</span>
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-6 text-muted-foreground">
                                                        No certificates issued yet. Click "+ Issue Certificate" above to generate one.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        currentPage={certPage}
                                        totalPages={Math.ceil(certificatesList.length / modalPageSize)}
                                        total={certificatesList.length}
                                        from={certificatesList.length > 0 ? (certPage - 1) * modalPageSize + 1 : 0}
                                        to={Math.min(certPage * modalPageSize, certificatesList.length)}
                                        onPageChange={setCertPage}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="fines" className="mt-0 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Disciplinary Fines &amp; Penalties Log
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsImposeFineOpen(true)}
                                        className="h-7 text-xs font-semibold gap-1.5 whitespace-nowrap shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5 shrink-0" />
                                        <span>Impose Fine</span>
                                    </Button>
                                </div>

                                <div className="rounded-lg border border-border overflow-hidden bg-card">
                                    <table className="w-full text-xs text-left text-muted-foreground">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border uppercase">
                                            <tr>
                                                <th className="px-3 py-2.5">Date</th>
                                                <th className="px-3 py-2.5">Category</th>
                                                <th className="px-3 py-2.5">Reason</th>
                                                <th className="px-3 py-2.5 text-right">Amount</th>
                                                <th className="px-3 py-2.5 text-center">Status</th>
                                                <th className="px-3 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedFines.length > 0 ? (
                                                paginatedFines.map((fn) => (
                                                    <tr key={fn.id} className="hover:bg-muted/50">
                                                        <td className="px-3 py-2 font-mono">
                                                            {fn.fine_date}
                                                        </td>
                                                        <td className="px-3 py-2 capitalize font-semibold text-foreground">
                                                            {fn.fine_type} Fine
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground max-w-[180px] truncate" title={fn.reason}>
                                                            {fn.reason}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                                                            Rs. {Number(fn.amount).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-[10px] capitalize",
                                                                    fn.status === 'paid'
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                                                        : fn.status === 'waived'
                                                                        ? "bg-purple-50 text-purple-700 border-purple-300"
                                                                        : "bg-amber-50 text-amber-700 border-amber-300"
                                                                )}
                                                            >
                                                                {fn.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                                            {fn.status === 'unpaid' && (
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    onClick={() => setCollectFine(fn)}
                                                                    className="h-6 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 border-border hover:bg-muted whitespace-nowrap shrink-0"
                                                                >
                                                                    Collect
                                                                </Button>
                                                            )}
                                                            {fn.status === 'paid' && (
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    onClick={() => setReceiptFine(fn)}
                                                                    className="h-6 px-2 text-[11px] border-border hover:bg-muted inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                                                                >
                                                                    <Printer className="w-3 h-3 shrink-0" />
                                                                    <span>Receipt</span>
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-6 text-muted-foreground">
                                                        No fines or disciplinary penalties recorded for this student.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        currentPage={finePage}
                                        totalPages={Math.ceil(finesList.length / modalPageSize)}
                                        total={finesList.length}
                                        from={finesList.length > 0 ? (finePage - 1) * modalPageSize + 1 : 0}
                                        to={Math.min(finePage * modalPageSize, finesList.length)}
                                        onPageChange={setFinePage}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>

                <DialogFooter className="mt-4 pt-3 border-t border-border">
                    <Button variant="secondary" onClick={onClose} className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
                        <UserRoundX className="h-4 w-4 shrink-0" />
                        <span>Close Profile</span>
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

            <CertificatePrintModal
                isOpen={isCertificateModalOpen}
                onClose={() => setIsCertificateModalOpen(false)}
                student={student}
                certificate={selectedCertForModal}
                onCertificateSaved={(newCert) => {
                    setIsCertificateModalOpen(false);
                }}
            />

            {isImposeFineOpen && (
                <ImposeFineModal
                    isOpen={isImposeFineOpen}
                    onClose={() => setIsImposeFineOpen(false)}
                    preselectedStudent={student}
                />
            )}

            {collectFine && (
                <CollectFineModal
                    isOpen={Boolean(collectFine)}
                    onClose={() => setCollectFine(null)}
                    fine={collectFine}
                />
            )}

            {receiptFine && (
                <FineReceiptModal
                    isOpen={Boolean(receiptFine)}
                    onClose={() => setReceiptFine(null)}
                    fine={receiptFine}
                />
            )}
        </Dialog>
    );
}