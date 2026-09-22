import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function Index({ classes, feeHeads, structures, filters }) {
    const [selectedClass, setSelectedClass] = useState(filters.school_class_id || '');
    const [sessionYear, setSessionYear] = useState(filters.session_year || '2026-2027');

    const { data, setData, post, processing, errors } = useForm({
        school_class_id: filters.school_class_id || '',
        session_year: filters.session_year || '2026-2027',
        fees: [],
    });

    // Populate initial fees array based on selected class and available fee heads
    useEffect(() => {
        if (selectedClass) {
            const initialFees = feeHeads.map((head) => ({
                fee_head_id: head.id,
                amount: structures[head.id] ? structures[head.id].amount : 0,
            }));

            setData({
                school_class_id: selectedClass,
                session_year: sessionYear,
                fees: initialFees,
            });
        }
    }, [selectedClass, structures, feeHeads]);

    const handleClassChange = (classId) => {
        setSelectedClass(classId);
        router.get(route('fees.structure.index'), {
            school_class_id: classId,
            session_year: sessionYear,
        }, { preserveState: true });
    };

    const handleAmountChange = (index, amount) => {
        const updatedFees = [...data.fees];
        updatedFees[index].amount = amount;
        setData('fees', updatedFees);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('fees.structure.store'));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Head title="Class Fee Structure" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Fee Structure</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure default fee amounts for classes by academic year</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">-- Choose Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Session</label>
                        <input
                            type="text"
                            value={sessionYear}
                            onChange={(e) => setSessionYear(e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                {selectedClass ? (
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {feeHeads.map((head, index) => {
                                const feeItem = data.fees.find((f) => f.fee_head_id === head.id) || { amount: 0 };
                                return (
                                    <div key={head.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{head.title}</p>
                                            <span className="text-xs text-gray-500 capitalize">{head.type}</span>
                                        </div>
                                        <div className="w-48">
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={feeItem.amount}
                                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                                    className="w-full pl-7 pr-3 py-1.5 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-right dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total Monthly Allocation: <span className="text-indigo-600 dark:text-indigo-400 font-bold">${data.fees.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition"
                            >
                                Save Structure
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center py-8 text-gray-500">Please select a class above to configure fee allocations.</p>
                )}
            </div>
        </div>
    );
}