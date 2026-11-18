import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Printer, Award, X, History, ShieldCheck, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CertificatePrintModal({
    isOpen,
    onClose,
    student,
    certificate = null,
    onCertificateSaved = () => {},
}) {
    const { props } = usePage();
    const settings = props.system_settings || {};

    const [subType, setSubType] = useState(certificate?.sub_type || 'character');
    const [issueDate, setIssueDate] = useState(certificate?.issue_date || new Date().toISOString().split('T')[0]);
    const [conduct, setConduct] = useState(certificate?.metadata?.conduct || 'Exemplary');
    const [reason, setReason] = useState(certificate?.metadata?.reason || 'Completion of Academic Session');
    const [remarks, setRemarks] = useState(certificate?.metadata?.remarks || 'Has actively participated in co-curricular activities and bore good moral character.');
    const [achievement, setAchievement] = useState(certificate?.metadata?.achievement || '');
    const [isSaving, setIsSaving] = useState(false);
    const [localCert, setLocalCert] = useState(certificate);

    if (!isOpen || !student) return null;

    const studentName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const fatherName = student.guardian_name || 'N/A';
    const rollNo = student.roll_number || student.roll_no || 'N/A';
    const admNo = student.admission_number || 'N/A';
    const className = student.current_enrollment?.school_class?.name || 'Class';
    const sectionName = student.current_enrollment?.section?.name || '';
    const admDate = student.admission_date || '2026-01-01';

    const currentPrintCount = localCert ? (localCert.print_count || 1) : 1;
    const currentCopyLabel = localCert ? (localCert.copy_label || (currentPrintCount === 1 ? 'ORIGINAL' : `DUPLICATE (Copy #${currentPrintCount})`)) : 'ORIGINAL';

    const certificateTitles = {
        character: 'Character Certificate',
        leaving: 'School Leaving Certificate (SLC)',
        bonafide: 'Bonafide Student Certificate',
        merit: 'Certificate of Academic Merit',
    };

    const handlePrintAndRecord = async () => {
        setIsSaving(true);
        try {
            if (localCert?.id) {
                // Record print on existing certificate
                const res = await fetch(`/certificates/${localCert.id}/print`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        printer_type: 'standard',
                        notes: `Reprint copy #${currentPrintCount + 1}`,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setLocalCert((prev) => ({
                        ...prev,
                        print_count: data.print_count,
                        copy_label: data.copy_label,
                        last_printed_at: data.last_printed_at,
                    }));
                }
            } else {
                // Create new certificate first
                router.post(
                    route('certificates.store'),
                    {
                        student_id: student.id,
                        sub_type: subType,
                        issue_date: issueDate,
                        conduct,
                        reason,
                        remarks,
                        achievement,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: (page) => {
                            // Find the newly issued certificate
                            const latest = student.document_prints?.[0] || {
                                print_count: 1,
                                copy_label: 'ORIGINAL',
                                sub_type: subType,
                                issue_date: issueDate,
                            };
                            setLocalCert(latest);
                            onCertificateSaved(latest);
                        },
                    }
                );
            }

            // Trigger browser print
            setTimeout(() => {
                window.print();
            }, 300);
        } catch (err) {
            console.error('Print recording failed:', err);
            window.print();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card text-card-foreground border-border print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
                {/* Print Control Toolbar (Hidden on print) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border print:hidden">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            Official Certificate Generator & Printout
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-2">
                        {localCert && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "font-mono font-bold text-xs px-2.5 py-1",
                                    currentPrintCount === 1
                                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300"
                                )}
                            >
                                {currentCopyLabel} (Print #{currentPrintCount})
                            </Badge>
                        )}

                        <Button
                            onClick={handlePrintAndRecord}
                            disabled={isSaving}
                            className="h-8 px-3 text-xs font-bold gap-1.5 shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            {localCert ? 'Print Copy / Reprint' : 'Generate & Print'}
                        </Button>
                    </div>
                </div>

                {/* Customizer Panel (Hidden on print) */}
                {!localCert && (
                    <div className="p-3.5 bg-muted/40 border border-border rounded-xs space-y-3 text-xs print:hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase text-[10px] mb-1">Certificate Type</label>
                                <select
                                    value={subType}
                                    onChange={(e) => setSubType(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-input bg-background text-foreground"
                                >
                                    <option value="character">Character Certificate</option>
                                    <option value="leaving">School Leaving Certificate (SLC)</option>
                                    <option value="bonafide">Bonafide Student Certificate</option>
                                    <option value="merit">Certificate of Academic Merit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase text-[10px] mb-1">Issue Date</label>
                                <input
                                    type="date"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-input bg-background text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase text-[10px] mb-1">General Conduct</label>
                                <input
                                    type="text"
                                    value={conduct}
                                    onChange={(e) => setConduct(e.target.value)}
                                    placeholder="e.g. Exemplary, Very Good"
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-input bg-background text-foreground"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase text-[10px] mb-1">Reason / Purpose</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Higher studies, Personal reasons"
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-input bg-background text-foreground"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase text-[10px] mb-1">Special Remarks / Honors</label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Custom commendation or remarks"
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-input bg-background text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Printable Certificate Page */}
                <div className="mt-4 flex justify-center">
                    <div
                        id="printable-certificate"
                        className="w-full bg-white text-black p-8 sm:p-12 border-8 border-double border-amber-800/80 rounded-sm shadow-md relative overflow-hidden font-serif print:border-8 print:border-double print:border-black print:shadow-none print:m-0 print:p-8"
                    >
                        {/* Copy Stamp Badge (Original vs Duplicate) */}
                        <div className="absolute top-4 right-4 print:top-4 print:right-4 text-right">
                            <span className={cn(
                                "inline-block px-3 py-1 font-mono font-bold text-[10px] uppercase tracking-widest border-2",
                                currentPrintCount === 1
                                    ? "border-emerald-700 text-emerald-800 bg-emerald-50"
                                    : "border-amber-700 text-amber-800 bg-amber-50"
                            )}>
                                {currentCopyLabel}
                            </span>
                            <p className="text-[9px] font-mono text-gray-500 mt-0.5">
                                Cert No: {localCert?.document_number || 'PENDING'}
                            </p>
                        </div>

                        {/* Top Watermark / Crest */}
                        <div className="text-center space-y-1.5 pb-6 border-b-2 border-amber-900/40 print:border-black">
                            <div className="flex items-center justify-center gap-2 text-amber-900 print:text-black font-sans font-bold text-xs uppercase tracking-widest">
                                <Award className="w-6 h-6 text-amber-700 print:text-black" />
                                {settings.school_name || 'Academic Comprehensive School Portal'}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-amber-950 print:text-black font-serif">
                                {certificateTitles[subType] || 'Institutional Certificate'}
                            </h1>
                            <p className="text-xs font-sans text-gray-600 print:text-black italic">
                                {settings.address || 'Main Campus'} • Registered Institution #{settings.registration_number || 'REG-7861'}
                            </p>
                        </div>

                        {/* Certificate Body Text */}
                        <div className="py-8 space-y-6 text-sm leading-relaxed text-gray-800 print:text-black text-justify font-serif">
                            <p className="indent-8 text-base">
                                This is to certify that <strong className="font-sans font-black text-black underline underline-offset-4 uppercase">{studentName}</strong>,
                                son / daughter of <strong className="font-sans font-bold text-black">{fatherName}</strong>,
                                bearing Roll Number <strong className="font-mono font-bold text-black">{rollNo}</strong> and Admission Number <strong className="font-mono font-bold text-black">#{admNo}</strong>,
                                was a bonafide student of this institution in <strong className="font-sans font-bold text-black">{className}{sectionName ? ` (${sectionName})` : ''}</strong> during the academic session <strong className="font-sans font-bold text-black">{settings.current_session_year || '2026-2027'}</strong>.
                            </p>

                            <p className="indent-8">
                                According to the institutional registers, the date of admission was <strong className="font-mono font-bold text-black">{admDate}</strong>.
                                During their tenure at the institution, their conduct and behavior have been found to be <strong className="font-bold text-black uppercase underline underline-offset-2">{conduct}</strong>.
                                {reason && (
                                    <span> The certificate is issued upon formal request for the purpose of <strong>{reason}</strong>.</span>
                                )}
                            </p>

                            {remarks && (
                                <p className="indent-8 italic text-gray-700 print:text-black">
                                    "{remarks}"
                                </p>
                            )}

                            <p className="indent-8">
                                All institutional library assets, laboratory apparatus, and financial dues stand fully cleared as of this date.
                                We wish them grand success in all future educational pursuits and career endeavors.
                            </p>
                        </div>

                        {/* Signatures & Seal Box */}
                        <div className="pt-12 mt-6 border-t border-gray-300 print:border-black flex justify-between items-end text-xs font-sans">
                            <div className="space-y-1 text-left">
                                <p className="text-gray-600 font-mono text-[11px]">Date of Issue: <strong>{issueDate}</strong></p>
                                <p className="text-gray-500 font-mono text-[10px]">Total Prints Logged: {currentPrintCount} time(s)</p>
                            </div>

                            <div className="text-center">
                                <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-[10px] text-gray-400 mx-auto uppercase font-bold tracking-widest">
                                    Official Seal
                                </div>
                            </div>

                            <div className="flex gap-12 text-center">
                                <div className="space-y-1">
                                    <div className="w-28 border-b-2 border-black h-8" />
                                    <span className="font-semibold text-gray-700">Class Incharge</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-32 border-b-2 border-black h-8" />
                                    <span className="font-bold text-black">Principal / Head</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
