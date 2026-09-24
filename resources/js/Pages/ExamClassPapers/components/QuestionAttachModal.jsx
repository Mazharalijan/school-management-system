import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterSelect from '@/components/FilterSelect';

export default function QuestionAttachModal({ isOpen, onClose, section = null, questionBanks = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        exam_paper_section_id: '',
        question_bank_id: '',
        marks: 5,
        order: 1,
    });

    useEffect(() => {
        if (section) {
            setData((prev) => ({
                ...prev,
                exam_paper_section_id: section.id,
            }));
        }
    }, [section, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!section?.id) return;
        post(route('exam-paper-sections.questions.store', section.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Attach Question to Section ${section?.section_name || ''}`}
            maxWidth="sm:max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Select Question from Question Bank *</Label>
                    <FilterSelect
                        className="mt-1"
                        value={data.question_bank_id}
                        onChange={(val) => setData('question_bank_id', val)}
                        options={questionBanks}
                        placeholder="-- Choose Question --"
                        valueKey="id"
                        labelKey="question"
                    />
                    {errors.question_bank_id && <p className="text-xs text-rose-500 mt-1">{errors.question_bank_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="marks">Question Marks *</Label>
                        <Input
                            id="marks"
                            type="number"
                            step="0.5"
                            value={data.marks}
                            onChange={(e) => setData('marks', e.target.value)}
                            required
                            className="mt-1"
                        />
                        {errors.marks && <p className="text-xs text-rose-500 mt-1">{errors.marks}</p>}
                    </div>

                    <div>
                        <Label htmlFor="order">Display Order</Label>
                        <Input
                            id="order"
                            type="number"
                            value={data.order}
                            onChange={(e) => setData('order', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={processing} className="bg-slate-800 text-white hover:bg-slate-900">
                        Attach Question
                    </Button>
                </div>
            </form>
        </Modal>
    );
}