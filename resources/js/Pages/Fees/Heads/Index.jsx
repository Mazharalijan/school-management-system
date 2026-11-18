import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import TableActionButton from '@/components/TableActionButton';
import Pagination from '@/components/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, Pencil, Trash2, X } from 'lucide-react';

export default function Index({ feeHeads = [] }) {
    const headList = Array.isArray(feeHeads) ? feeHeads : feeHeads?.data || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHead, setEditingHead] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        type: 'recurring',
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingHead(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (head) => {
        setEditingHead(head);
        setData({
            title: head.title,
            type: head.type,
            description: head.description || '',
            is_active: Boolean(head.is_active),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingHead) {
            put(route('fees.heads.update', editingHead.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('fees.heads.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this fee head?')) {
            router.delete(route('fees.heads.destroy', id));
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'recurring':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Recurring (Monthly)
                    </Badge>
                );
            case 'one_time':
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        One-Time
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Optional
                    </Badge>
                );
        }
    };

    return (
        <AppLayout title="Fee Heads">
            <Head title="Fee Heads" />

            <div className="space-y-6">
                <PageHeader
                    title="Fee Heads"
                    subtitle="Manage institutional fee categories, recurring rates, and billing structures."
                    icon={Tag}
                    buttonText="+ Add Fee Head"
                    onButtonClick={openCreateModal}
                />

                {/* Table Card */}
                <Card className="border-border bg-card text-card-foreground shadow-xs">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Title</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Type</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Description</th>
                                        <th className="px-6 py-3.5 text-left font-bold text-muted-foreground uppercase text-xs">Status</th>
                                        <th className="px-6 py-3.5 text-right font-bold text-muted-foreground uppercase text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {headList.map((head) => (
                                        <tr key={head.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-foreground">{head.title}</td>
                                            <td className="px-6 py-4">
                                                {getTypeBadge(head.type)}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs">{head.description || '—'}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    head.is_active
                                                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border-0"
                                                        : "bg-muted text-muted-foreground hover:bg-muted border-0"
                                                }>
                                                    {head.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <TableActionButton
                                                        title="Edit Fee Head"
                                                        icon={Pencil}
                                                        variant="primary"
                                                        onClick={() => openEditModal(head)}
                                                    />
                                                    <TableActionButton
                                                        title="Delete Fee Head"
                                                        icon={Trash2}
                                                        variant="danger"
                                                        onClick={() => handleDelete(head.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {headList.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                                                No fee heads configured yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={feeHeads} />
                    </CardContent>
                </Card>

                {/* Create / Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-card text-card-foreground rounded-sm shadow-xl max-w-md w-full p-6 space-y-4 border border-border">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h2 className="text-base font-bold text-foreground">
                                    {editingHead ? 'Edit Fee Head' : 'Add New Fee Head'}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeModal}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="head_title" className="text-xs font-bold text-muted-foreground uppercase">
                                        Title *
                                    </Label>
                                    <Input
                                        id="head_title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Tuition Fee"
                                        className="mt-1"
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="head_type" className="text-xs font-bold text-muted-foreground uppercase">
                                        Type *
                                    </Label>
                                    <select
                                        id="head_type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 w-full h-10 px-3 py-2 text-sm rounded-xs border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="recurring">Recurring (Monthly)</option>
                                        <option value="one_time">One-Time</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="head_desc" className="text-xs font-bold text-muted-foreground uppercase">
                                        Description
                                    </Label>
                                    <textarea
                                        id="head_desc"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 w-full p-2.5 text-sm rounded-xs border border-input bg-background text-foreground dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                        rows="3"
                                        placeholder="Optional description..."
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-input text-primary focus:ring-ring"
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
                                        Active
                                    </Label>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                                    <Button type="button" variant="outline" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} variant="default">
                                        {editingHead ? 'Update' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}