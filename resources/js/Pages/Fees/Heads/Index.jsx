import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ feeHeads }) {
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

    return (
        <AppLayout title="Fee Heads">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <Head title="Fee Heads" />

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Heads</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage fee categories and billing types</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
                    >
                        + Add Fee Head
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            {feeHeads.map((head) => (
                                <tr key={head.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{head.title}</td>
                                    <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            head.type === 'recurring' ? 'bg-blue-100 text-blue-800' :
                                            head.type === 'one_time' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {head.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{head.description || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            head.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {head.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => openEditModal(head)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                                        <button onClick={() => handleDelete(head.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {feeHeads.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No fee heads configured yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingHead ? 'Edit Fee Head' : 'Add New Fee Head'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="recurring">Recurring (Monthly)</option>
                                        <option value="one_time">One-Time</option>
                                        <option value="optional">Optional</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows="3"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
                                        {editingHead ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}