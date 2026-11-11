import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, 
    ArrowRight, 
    Sparkles, 
    RotateCcw, 
    FastForward, 
    DollarSign,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function SinglePromotionModal({
    isOpen,
    onClose,
    student,
    classes = [],
    sessionYears = [],
    targetSessionYear = '',
    feeStructures = [],
    onSuccess,
}) {
    if (!student) return null;

    const currentClass = classes.find((c) => c.id === student.current_class_id);
    const currentNumeric = currentClass?.numeric_value ?? 0;

    // Potential quick promotion paths
    const nextClass = classes.find((c) => c.numeric_value === currentNumeric + 1);
    const skip1Class = classes.find((c) => c.numeric_value === currentNumeric + 2);
    const skip2Class = classes.find((c) => c.numeric_value === currentNumeric + 3);
    const sameClass = currentClass;

    const initialTargetClassId = nextClass?.id || currentClass?.id || classes[0]?.id || '';

    const { data, setData, post, processing, errors, reset } = useForm({
        source_class_id: student.current_class_id,
        target_class_id: initialTargetClassId,
        target_section_id: '',
        target_session_year: targetSessionYear || student.current_session_year || '',
        base_monthly_fee: student.current_base_fee || 0,
        admission_fee: 0,
        waive_admission_fee: Boolean(student.current_waive_admission),
        monthly_discount: student.current_discount || 0,
        discount_reason: student.current_discount_reason || '',
        promotion_type: 'promote',
    });

    const [selectedTargetClass, setSelectedTargetClass] = useState(null);

    // Update form when student changes
    useEffect(() => {
        if (student && isOpen) {
            const defaultTarget = nextClass?.id || currentClass?.id || classes[0]?.id;
            
            // Find default fee structure for target class
            const defaultStructure = feeStructures.find(
                (fs) => fs.school_class_id === defaultTarget && fs.fee_head?.type === 'recurring'
            );
            const defaultAdmissionStructure = feeStructures.find(
                (fs) => fs.school_class_id === defaultTarget && fs.fee_head?.type === 'one_time' && fs.fee_head?.title?.toLowerCase().includes('admission')
            );

            setData({
                source_class_id: student.current_class_id,
                target_class_id: defaultTarget,
                target_section_id: '',
                target_session_year: targetSessionYear || '',
                base_monthly_fee: defaultStructure?.amount || student.current_base_fee || 0,
                admission_fee: defaultAdmissionStructure?.amount || 0,
                waive_admission_fee: Boolean(student.current_waive_admission),
                monthly_discount: student.current_discount || 0,
                discount_reason: student.current_discount_reason || '',
                promotion_type: 'promote',
            });
        }
    }, [student, isOpen, targetSessionYear]);

    // Update target class sections and default fee whenever target_class_id changes
    useEffect(() => {
        const cls = classes.find((c) => c.id === parseInt(data.target_class_id, 10));
        setSelectedTargetClass(cls);

        if (cls && cls.sections && cls.sections.length > 0 && !data.target_section_id) {
            setData((prev) => ({
                ...prev,
                target_section_id: cls.sections[0].id,
            }));
        }

        // Auto-fetch default tuition fee if target changed
        if (cls) {
            const struct = feeStructures.find(
                (fs) => fs.school_class_id === cls.id && fs.fee_head?.type === 'recurring'
            );
            if (struct && parseFloat(struct.amount) > 0) {
                setData((prev) => ({
                    ...prev,
                    base_monthly_fee: struct.amount,
                }));
            }
        }
    }, [data.target_class_id]);

    const handleQuickClassSelect = (clsId, promoType) => {
        if (!clsId) return;
        setData((prev) => ({
            ...prev,
            target_class_id: clsId,
            promotion_type: promoType,
        }));
    };

    const netMonthlyFee = Math.max(0, (parseFloat(data.base_monthly_fee) || 0) - (parseFloat(data.monthly_discount) || 0));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('students.promotion.single', student.id), {
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
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>Individual Student Promotion</span>
                </div>
            }
            maxWidth="sm:max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Profile Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ProfileAvatar
                            src={student.photo_url}
                            name={student.full_name}
                            className="w-12 h-12"
                            iconClassName="w-6 h-6"
                        />
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">{student.full_name}</h4>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                                Roll: {student.roll_number || 'N/A'} | Adm: {student.admission_number}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Badge variant="outline" className="bg-slate-200/70 text-slate-700 text-[11px] font-semibold">
                                    Current: {student.current_class_name} ({student.current_section_name || 'A'})
                                </Badge>
                                <span className="text-[11px] text-slate-400 font-medium">Session: {student.current_session_year}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block">Current Net Fee</span>
                        <span className="text-base font-bold text-emerald-700 font-mono">
                            ${Number(student.current_net_fee || 0).toFixed(2)}/mo
                        </span>
                    </div>
                </div>

                {/* Promotion Path Shortcuts */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Choose Promotion Scenario
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Normal Next Class */}
                        {nextClass && (
                            <button
                                type="button"
                                onClick={() => handleQuickClassSelect(nextClass.id, 'promote')}
                                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                    parseInt(data.target_class_id, 10) === nextClass.id && data.promotion_type === 'promote'
                                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span>Next Grade</span>
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <div className="text-sm font-semibold mt-1 truncate">{nextClass.name}</div>
                                <span className="text-[10px] text-slate-400">Regular Promotion</span>
                            </button>
                        )}

                        {/* Skip 1 Class */}
                        {skip1Class && (
                            <button
                                type="button"
                                onClick={() => handleQuickClassSelect(skip1Class.id, 'skip')}
                                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                    parseInt(data.target_class_id, 10) === skip1Class.id && data.promotion_type === 'skip'
                                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                                    <span>Skip 1 Class</span>
                                    <FastForward className="w-3.5 h-3.5 text-amber-600" />
                                </div>
                                <div className="text-sm font-semibold mt-1 truncate">{skip1Class.name}</div>
                                <span className="text-[10px] text-slate-400">Double Grade</span>
                            </button>
                        )}

                        {/* Skip 2 Classes */}
                        {skip2Class && (
                            <button
                                type="button"
                                onClick={() => handleQuickClassSelect(skip2Class.id, 'skip')}
                                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                    parseInt(data.target_class_id, 10) === skip2Class.id
                                        ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-500/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                                    <span>Skip 2 Classes</span>
                                    <FastForward className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <div className="text-sm font-semibold mt-1 truncate">{skip2Class.name}</div>
                                <span className="text-[10px] text-slate-400">Accelerated</span>
                            </button>
                        )}

                        {/* Retain in Same Class */}
                        {sameClass && (
                            <button
                                type="button"
                                onClick={() => handleQuickClassSelect(sameClass.id, 'retain')}
                                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                    parseInt(data.target_class_id, 10) === sameClass.id && data.promotion_type === 'retain'
                                        ? 'border-rose-600 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                                    <span>Repeat Class</span>
                                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                                </div>
                                <div className="text-sm font-semibold mt-1 truncate">{sameClass.name}</div>
                                <span className="text-[10px] text-slate-400">Retain for Session</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Target Class, Section & Session Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class *</label>
                        <select
                            value={data.target_class_id}
                            onChange={(e) => setData('target_class_id', e.target.value)}
                            className="w-full text-sm rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            required
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} {cls.id === student.current_class_id ? '(Same Class)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.target_class_id && <p className="text-xs text-rose-600 mt-1">{errors.target_class_id}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section *</label>
                        <select
                            value={data.target_section_id}
                            onChange={(e) => setData('target_section_id', e.target.value)}
                            className="w-full text-sm rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            required
                        >
                            {(selectedTargetClass?.sections || []).map((sec) => (
                                <option key={sec.id} value={sec.id}>
                                    Section {sec.name} (Capacity: {sec.capacity || 40})
                                </option>
                            ))}
                        </select>
                        {errors.target_section_id && <p className="text-xs text-rose-600 mt-1">{errors.target_section_id}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Academic Session *</label>
                        <input
                            type="text"
                            value={data.target_session_year}
                            onChange={(e) => setData('target_session_year', e.target.value)}
                            placeholder="e.g. 2026-2027"
                            className="w-full text-sm rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            required
                        />
                        {errors.target_session_year && <p className="text-xs text-rose-600 mt-1">{errors.target_session_year}</p>}
                    </div>
                </div>

                {/* Fee Settings for the New Class & Session */}
                <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span>New Academic Session Fee Structure</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Session: {data.target_session_year}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Base Monthly Fee */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Base Monthly Tuition Fee ($)
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
                            {errors.base_monthly_fee && <p className="text-xs text-rose-600 mt-1">{errors.base_monthly_fee}</p>}
                        </div>

                        {/* One-Time Admission Fee */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Annual Admission / Re-Admission Fee ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.admission_fee}
                                onChange={(e) => setData('admission_fee', e.target.value)}
                                disabled={data.waive_admission_fee}
                                className={`w-full text-sm rounded-md border-slate-300 font-mono ${
                                    data.waive_admission_fee ? 'bg-slate-100 text-slate-400' : ''
                                }`}
                            />
                            <div className="mt-1.5 flex items-center">
                                <input
                                    type="checkbox"
                                    id="single_waive_admission"
                                    checked={data.waive_admission_fee}
                                    onChange={(e) => setData('waive_admission_fee', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 mr-2"
                                />
                                <label htmlFor="single_waive_admission" className="text-xs text-slate-600 font-medium cursor-pointer">
                                    Waive annual admission fee for this student
                                </label>
                            </div>
                        </div>

                        {/* Monthly Discount */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Monthly Concession / Discount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.monthly_discount}
                                onChange={(e) => setData('monthly_discount', e.target.value)}
                                className="w-full text-sm rounded-md border-slate-300 font-mono"
                            />
                        </div>

                        {/* Discount Reason */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Concession / Discount Reason
                            </label>
                            <input
                                type="text"
                                value={data.discount_reason}
                                onChange={(e) => setData('discount_reason', e.target.value)}
                                placeholder="e.g. Sibling Concession, Merit"
                                className="w-full text-sm rounded-md border-slate-300"
                            />
                        </div>
                    </div>

                    {/* Net Fee Calculation Callout */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center justify-between">
                        <div className="text-xs text-emerald-800">
                            <strong>Net Monthly Payable:</strong> Base (${Number(data.base_monthly_fee || 0).toFixed(2)}) - Discount (${Number(data.monthly_discount || 0).toFixed(2)})
                        </div>
                        <div className="text-base font-bold text-emerald-900 font-mono">
                            ${Number(netMonthlyFee).toFixed(2)} / month
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{processing ? 'Promoting Student...' : 'Confirm & Promote Student'}</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
