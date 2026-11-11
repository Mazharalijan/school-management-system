import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    ArrowRight, 
    DollarSign, 
    CheckCircle2, 
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

export default function BulkPromotionModal({
    isOpen,
    onClose,
    selectedStudents = [],
    classes = [],
    sourceClass,
    targetClassId,
    targetSectionId,
    targetSessionYear,
    feeStructures = [],
    admissionHead,
    onSuccess,
}) {
    if (!isOpen || selectedStudents.length === 0) return null;

    const targetClass = classes.find((c) => c.id === parseInt(targetClassId, 10));
    const targetSection = targetClass?.sections?.find((s) => s.id === parseInt(targetSectionId, 10));

    // Resolve target class default tuition fee
    const defaultStructure = feeStructures.find(
        (fs) => fs.school_class_id === targetClass?.id && fs.fee_head?.type === 'recurring'
    );
    const defaultTuitionAmount = defaultStructure?.amount || 0;

    const defaultAdmissionStructure = feeStructures.find(
        (fs) => fs.school_class_id === targetClass?.id && fs.fee_head?.type === 'one_time' && fs.fee_head?.title?.toLowerCase().includes('admission')
    );
    const defaultAdmissionAmount = defaultAdmissionStructure?.amount || 0;

    const { data, setData, post, processing, errors } = useForm({
        source_class_id: sourceClass?.id || '',
        target_class_id: targetClassId || '',
        target_section_id: targetSectionId || '',
        target_session_year: targetSessionYear || '',
        student_ids: selectedStudents.map((s) => s.id),
        fee_strategy: 'class_default', // 'class_default' | 'custom'
        base_monthly_fee: defaultTuitionAmount,
        admission_fee: defaultAdmissionAmount,
        waive_admission_fee: false,
        discount_strategy: 'keep_existing', // 'keep_existing' | 'reset_zero' | 'custom'
        custom_discount: 0,
        custom_discount_reason: '',
    });

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            source_class_id: sourceClass?.id || '',
            target_class_id: targetClassId || '',
            target_section_id: targetSectionId || '',
            target_session_year: targetSessionYear || '',
            student_ids: selectedStudents.map((s) => s.id),
            base_monthly_fee: defaultTuitionAmount,
            admission_fee: defaultAdmissionAmount,
        }));
    }, [selectedStudents, targetClassId, targetSectionId, targetSessionYear]);

    // Check if skipping classes
    const isSkipping = sourceClass && targetClass && targetClass.numeric_value > (sourceClass.numeric_value + 1);
    const isRetaining = sourceClass && targetClass && targetClass.numeric_value <= sourceClass.numeric_value;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('students.promotion.store'), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center space-x-2 text-slate-800">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>Confirm Bulk Student Promotion</span>
                </div>
            }
            maxWidth="sm:max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Promotion Header Banner */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
                                Bulk Promotion Summary
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-base font-bold text-slate-900">
                                <span>{sourceClass?.name}</span>
                                <ArrowRight className="w-4 h-4 text-indigo-600" />
                                <span className="text-indigo-700 font-extrabold">{targetClass?.name}</span>
                                <span className="text-xs font-normal text-slate-500">
                                    (Sec {targetSection?.name || 'A'})
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <Badge className="bg-indigo-600 text-white text-xs px-2.5 py-1 font-bold">
                                {selectedStudents.length} Students Selected
                            </Badge>
                            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
                                Session: {targetSessionYear}
                            </span>
                        </div>
                    </div>

                    {isSkipping && (
                        <div className="mt-2.5 pt-2 border-t border-indigo-200/60 flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                                Notice: Target class skips {targetClass.numeric_value - sourceClass.numeric_value - 1} intermediate grade(s).
                            </span>
                        </div>
                    )}

                    {isRetaining && (
                        <div className="mt-2.5 pt-2 border-t border-indigo-200/60 flex items-center gap-1.5 text-xs text-rose-800 font-medium">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                                Notice: Students will remain / repeat in the same or lower class for the new session.
                            </span>
                        </div>
                    )}
                </div>

                {/* Selected Student Chips Preview */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Students to be Promoted ({selectedStudents.length})
                    </label>
                    <div className="max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap gap-1.5">
                        {selectedStudents.map((s) => (
                            <span
                                key={s.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border border-slate-200 text-slate-700"
                            >
                                {s.full_name} <span className="text-slate-400 ml-1">({s.roll_number || s.admission_number})</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Fee Decision Options */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span>Target Session Fee & Concession Strategy</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Class: {targetClass?.name}</span>
                    </div>

                    {/* Monthly Fee Strategy Radio Group */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">Monthly Tuition Fee</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <label
                                className={`p-3 rounded-lg border flex items-start space-x-2.5 cursor-pointer transition ${
                                    data.fee_strategy === 'class_default'
                                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="fee_strategy"
                                    value="class_default"
                                    checked={data.fee_strategy === 'class_default'}
                                    onChange={() => setData('fee_strategy', 'class_default')}
                                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">Class Standard Fee</span>
                                    <span className="text-[11px] text-slate-500">
                                        Use {targetClass?.name} default fee (${Number(defaultTuitionAmount).toFixed(2)}/mo)
                                    </span>
                                </div>
                            </label>

                            <label
                                className={`p-3 rounded-lg border flex items-start space-x-2.5 cursor-pointer transition ${
                                    data.fee_strategy === 'custom'
                                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="fee_strategy"
                                    value="custom"
                                    checked={data.fee_strategy === 'custom'}
                                    onChange={() => setData('fee_strategy', 'custom')}
                                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="text-xs font-bold text-slate-800 block">Custom Fee for this Batch</span>
                                    <span className="text-[11px] text-slate-500">Specify custom base tuition fee</span>
                                </div>
                            </label>
                        </div>

                        {data.fee_strategy === 'custom' && (
                            <div className="pt-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Custom Base Monthly Fee ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.base_monthly_fee}
                                    onChange={(e) => setData('base_monthly_fee', e.target.value)}
                                    className="w-full text-sm rounded-md border-slate-300 font-mono"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Annual One-Time Admission Fee */}
                    <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Annual Admission / Re-Admission Fee ($)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.admission_fee}
                                onChange={(e) => setData('admission_fee', e.target.value)}
                                disabled={data.waive_admission_fee}
                                placeholder="0.00"
                                className={`w-full text-sm rounded-md border-slate-300 font-mono ${
                                    data.waive_admission_fee ? 'bg-slate-100 text-slate-400' : ''
                                }`}
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="bulk_waive_admission"
                                    checked={data.waive_admission_fee}
                                    onChange={(e) => setData('waive_admission_fee', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mr-2"
                                />
                                <label htmlFor="bulk_waive_admission" className="text-xs text-slate-600 font-medium cursor-pointer">
                                    Waive admission fee for all selected students
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Discount & Concession Policy */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">Discount & Concession Policy</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <label
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                    data.discount_strategy === 'keep_existing'
                                        ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                                        : 'border-slate-200 text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="discount_strategy"
                                    value="keep_existing"
                                    checked={data.discount_strategy === 'keep_existing'}
                                    onChange={() => setData('discount_strategy', 'keep_existing')}
                                    className="mr-1.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                Keep Existing Discounts
                            </label>

                            <label
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                    data.discount_strategy === 'reset_zero'
                                        ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                                        : 'border-slate-200 text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="discount_strategy"
                                    value="reset_zero"
                                    checked={data.discount_strategy === 'reset_zero'}
                                    onChange={() => setData('discount_strategy', 'reset_zero')}
                                    className="mr-1.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                Reset Discounts to $0
                            </label>

                            <label
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                    data.discount_strategy === 'custom'
                                        ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                                        : 'border-slate-200 text-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="discount_strategy"
                                    value="custom"
                                    checked={data.discount_strategy === 'custom'}
                                    onChange={() => setData('discount_strategy', 'custom')}
                                    className="mr-1.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                Set Fixed Concession
                            </label>
                        </div>

                        {data.discount_strategy === 'custom' && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Fixed Discount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.custom_discount}
                                        onChange={(e) => setData('custom_discount', e.target.value)}
                                        className="w-full text-sm rounded-md border-slate-300 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                                    <input
                                        type="text"
                                        value={data.custom_discount_reason}
                                        onChange={(e) => setData('custom_discount_reason', e.target.value)}
                                        placeholder="e.g. Annual Promo Concession"
                                        className="w-full text-sm rounded-md border-slate-300"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{processing ? 'Promoting...' : `Promote ${selectedStudents.length} Students`}</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
