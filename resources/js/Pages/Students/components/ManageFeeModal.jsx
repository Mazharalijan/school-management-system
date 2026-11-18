import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Lock, Percent, AlertCircle } from 'lucide-react';

export default function ManageFeeModal({
    isOpen,
    onClose,
    student,
    currentSessionYear = "2026-2027",
    onSuccess,
}) {
    if (!student) return null;

    const baseFee = student.current_enrollment?.school_class?.base_monthly_fee || 
                    student.fee_profile?.base_monthly_fee || 1500;
    const classId = student.current_enrollment?.school_class_id || student.fee_profile?.school_class_id;

    const [errorMessage, setErrorMessage] = useState('');

    // Check if any invoice in this session has payments recorded
    const hasPaidInvoice = (student.invoices || student.fee_invoices || []).some(
        (inv) => inv.status === 'paid' || inv.status === 'partially_paid'
    );

    // Initialize Inertia form hook
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        student_id: student.id,
        school_class_id: classId,
        session_year: currentSessionYear,
        base_monthly_fee: baseFee,
        monthly_discount: 0,
        waive_admission_fee: false,
        discount_reason: '',
    });

    // Sync form values when the student prop or modal open state changes
    useEffect(() => {
        if (student) {
            setData({
                student_id: student.id,
                school_class_id: classId,
                session_year: currentSessionYear,
                base_monthly_fee: baseFee,
                monthly_discount: student.fee_profile?.monthly_discount || 0,
                waive_admission_fee: Boolean(student.fee_profile?.waive_admission_fee),
                discount_reason: student.fee_profile?.discount_reason || '',
            });
        } else {
            reset();
        }
        clearErrors();
        setErrorMessage('');
    }, [student, isOpen]);

    // Calculate real-time net monthly fee
    const calculatedNetFee = Math.max(0, baseFee - parseFloat(data.monthly_discount || 0));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hasPaidInvoice) return;

        setErrorMessage('');

        post(route('fees.student-profile.store'), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
                onClose();
            },
            onError: (err) => {
                const message = err.message || Object.values(err)[0] || 'Failed to update fee profile.';
                setErrorMessage(message);
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center justify-between w-full pr-6">
                    <span className="text-foreground">Manage Fee Discount</span>
                    <Badge variant="outline" className="font-mono bg-muted text-muted-foreground border-border">
                        Session: {currentSessionYear}
                    </Badge>
                </div>
            }
            maxWidth="sm:max-w-lg"
            footer={
                <div className="flex items-center justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="manage-fee-form"
                        disabled={hasPaidInvoice || processing}
                        variant="default"
                    >
                        {processing ? 'Saving...' : 'Save Fee Profile'}
                    </Button>
                </div>
            }
        >
            <form id="manage-fee-form" onSubmit={handleSubmit} className="space-y-4">
                {/* PAID LOCKOUT NOTICE */}
                {hasPaidInvoice && (
                    <Alert className="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <AlertDescription className="text-xs font-medium ml-2">
                            Fee profile is locked because an invoice has already been paid for this student in session {currentSessionYear}.
                        </AlertDescription>
                    </Alert>
                )}

                {/* API OR INERTIA ERROR DISPLAY */}
                {(errorMessage || Object.keys(errors).length > 0) && (
                    <Alert className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <AlertDescription className="text-xs font-medium ml-2">
                            {errorMessage || Object.values(errors)[0]}
                        </AlertDescription>
                    </Alert>
                )}

                {/* STUDENT INFORMATION HEADER */}
                <div className="bg-muted/40 p-3 rounded-xs border border-border flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                        <ProfileAvatar
                            src={student.photo_url}
                            name={`${student.first_name} ${student.last_name}`}
                            className="w-9 h-9"
                            iconClassName="w-4 h-4"
                        />
                        <div>
                            <span className="text-muted-foreground block">Student Name</span>
                            <span className="font-bold text-foreground">
                                {student.first_name} {student.last_name}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-muted-foreground block">Class & Section</span>
                        <span className="font-semibold text-foreground">
                            {student.current_enrollment?.school_class?.name || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* BASE VS NET FEE READOUT */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-sm">
                        <Label className="text-muted-foreground text-[11px] uppercase font-semibold">
                            Standard Monthly Fee
                        </Label>
                        <p className="text-lg font-bold text-foreground mt-0.5">
                            Rs. {baseFee.toLocaleString()}
                        </p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-sm">
                        <Label className="text-emerald-700 dark:text-emerald-400 text-[11px] uppercase font-semibold">
                            Net Monthly Payable
                        </Label>
                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                            Rs. {calculatedNetFee.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* DISCOUNT INPUT */}
                <div className="space-y-1.5">
                    <Label htmlFor="monthly_discount" className="text-xs font-semibold text-foreground">
                        Monthly Discount / Concession (Rs.)
                    </Label>
                    <div className="relative">
                        <Input
                            id="monthly_discount"
                            type="number"
                            min="0"
                            max={baseFee}
                            disabled={hasPaidInvoice || processing}
                            value={data.monthly_discount}
                            onChange={(e) => setData('monthly_discount', e.target.value)}
                            className="pl-8 text-sm font-semibold"
                            placeholder="0"
                        />
                        <Percent className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                    </div>
                    {errors.monthly_discount && (
                        <p className="text-xs text-red-500">{errors.monthly_discount}</p>
                    )}
                </div>

                {/* ADMISSION FEE WAIVER */}
                <div className="flex items-start space-x-3 pt-2 border-t border-border">
                    <Checkbox
                        id="waive_admission_fee"
                        disabled={hasPaidInvoice || processing}
                        checked={data.waive_admission_fee}
                        onCheckedChange={(checked) => setData('waive_admission_fee', Boolean(checked))}
                        className="mt-0.5"
                    />
                    <div className="grid gap-1 leading-none">
                        <label htmlFor="waive_admission_fee" className="text-xs font-semibold text-foreground cursor-pointer">
                            Waive Admission Fee Entirely
                        </label>
                        <p className="text-[11px] text-muted-foreground">
                            Exempt this student from paying initial admission/enrollment fees.
                        </p>
                    </div>
                </div>

                {/* CONCESSION REASON */}
                <div className="space-y-1.5 pt-1">
                    <Label htmlFor="discount_reason" className="text-xs font-semibold text-foreground">
                        Concession Reason / Category
                    </Label>
                    <Input
                        id="discount_reason"
                        type="text"
                        disabled={hasPaidInvoice || processing}
                        value={data.discount_reason}
                        onChange={(e) => setData('discount_reason', e.target.value)}
                        placeholder="e.g., Principal Concession / Kinship Discount"
                        className="text-xs"
                    />
                    {errors.discount_reason && (
                        <p className="text-xs text-red-500">{errors.discount_reason}</p>
                    )}
                </div>
            </form>
        </Modal>
    );
}