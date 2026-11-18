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
        <div className="p-6 w-full space-y-6">
            <Head title="Class Fee Structure" />

            <div>
                <h1 className="text-2xl font-bold text-foreground">Class Fee Structure</h1>
                <p className="text-sm text-muted-foreground">Configure default fee amounts for classes by academic year</p>
            </div>

            <div className="bg-card text-card-foreground p-6 rounded-sm shadow-xs space-y-6 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="mt-1 w-full rounded-xs border border-input shadow-xs focus:ring-ring focus:border-ring bg-background text-foreground dark:bg-card"
                        >
                            <option value="">-- Choose Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground">Academic Session</label>
                        <input
                            type="text"
                            value={sessionYear}
                            onChange={(e) => setSessionYear(e.target.value)}
                            className="mt-1 w-full rounded-xs border border-input shadow-xs focus:ring-ring focus:border-ring bg-background text-foreground dark:bg-card"
                        />
                    </div>
                </div>

                {selectedClass ? (
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-border">
                        <div className="divide-y divide-border">
                            {feeHeads.map((head, index) => {
                                const feeItem = data.fees.find((f) => f.fee_head_id === head.id) || { amount: 0 };
                                return (
                                    <div key={head.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">{head.title}</p>
                                            <span className="text-xs text-muted-foreground capitalize">{head.type}</span>
                                        </div>
                                        <div className="w-48">
                                            <div className="relative rounded-xs shadow-xs">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-muted-foreground sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={feeItem.amount}
                                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                                    className="w-full pl-7 pr-3 py-1.5 rounded-xs border border-input focus:ring-ring focus:border-ring text-right bg-background text-foreground dark:bg-card"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <div className="text-sm font-medium text-foreground">
                                Total Monthly Allocation: <span className="text-indigo-600 dark:text-indigo-400 font-bold">${data.fees.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xs shadow-xs transition"
                            >
                                Save Structure
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-center py-8 text-muted-foreground">Please select a class above to configure fee allocations.</p>
                )}
            </div>
        </div>
    );
}