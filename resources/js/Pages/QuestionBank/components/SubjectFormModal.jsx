import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import FilterSelect from '@/components/FilterSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {FilePen, PlusIcon, X} from "lucide-react";

export default function SubjectFormModal({ isOpen, onClose, subject = null, classes = [] }) {
    const isEdit = Boolean(subject?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        subject_name: '',
    });

    useEffect(() => {
        if (subject) {
            setData({
                subject_name: subject.subject_name || ''
            });
        } else {
            reset();
        }
    }, [subject, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('question-bank.subjects.update', subject.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('question-bank.subjects.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    const modalFooter = (
        <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
                Cancel
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className="bg-slate-800 hover:bg-slate-900 text-white"
            >
                {isEdit ? (<FilePen className="w-4 h-4" />) : (<PlusIcon className="w-4 h-4" />)}
                {isEdit ? 'Update Subject' : 'Save Subject'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Subject' : 'Add New Subject'}
            footer={modalFooter}
            maxWidth="sm:max-w-4xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="subject_name">Subject Name *</Label>
                        <Input
                            id="subject_name"
                            value={data.subject_name}
                            onChange={(e) => setData('subject_name', e.target.value)}
                            placeholder="e.g. Mathematics, Physics"
                            className="mt-1"
                            required
                        />
                        {errors.subject_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.subject_name}</p>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}