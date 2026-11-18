import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Loader2, CheckCircle2 } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import { cn } from '@/lib/utils';

export default function ImposeFineModal({ isOpen, onClose, classes = [], preselectedStudent = null }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(preselectedStudent);

    const form = useForm({
        student_id: preselectedStudent?.id || '',
        fine_type: 'leave',
        collection_mode: 'on_the_spot',
        amount: '',
        reason: '',
        fine_date: new Date().toISOString().split('T')[0],
        collect_now: false,
        payment_method: 'cash',
    });

    useEffect(() => {
        if (preselectedStudent) {
            setSelectedStudent(preselectedStudent);
            form.setData('student_id', preselectedStudent.id);
        }
    }, [preselectedStudent]);

    // Debounced student search
    useEffect(() => {
        const term = searchQuery.trim();
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/students/search?q=${encodeURIComponent(term)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        form.setData('student_id', student.id);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('fines.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setSelectedStudent(null);
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Impose Student Fine
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 my-2">
                    {/* Student Selection */}
                    <div>
                        <Label className="text-xs font-semibold">Target Student *</Label>
                        {selectedStudent ? (
                            <div className="flex items-center justify-between p-3 mt-1 rounded-xs border border-primary/30 bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <ProfileAvatar
                                        src={selectedStudent.photo_url || selectedStudent.photo_path}
                                        name={selectedStudent.full_name || `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`}
                                        className="w-10 h-10 rounded-full border border-primary/20"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-foreground">
                                            {selectedStudent.full_name || `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Roll: {selectedStudent.roll_number || 'N/A'} | Adm: {selectedStudent.admission_number || 'N/A'} | Class: {selectedStudent.current_enrollment?.school_class?.name || 'Assigned'}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        form.setData('student_id', '');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by student name, roll no, father CNIC..."
                                    className="pl-9 text-xs"
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                                )}

                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto rounded-sm border border-border bg-popover text-popover-foreground shadow-lg z-50 divide-y divide-border">
                                        {searchResults.map((st) => (
                                            <button
                                                key={st.id}
                                                type="button"
                                                onClick={() => handleSelectStudent(st)}
                                                className="w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-muted/80 transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <ProfileAvatar
                                                        src={st.photo_url || st.photo_path}
                                                        name={st.full_name || `${st.first_name} ${st.last_name}`}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                    <div>
                                                        <span className="font-semibold block text-foreground">
                                                            {st.full_name || `${st.first_name} ${st.last_name}`}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Roll: {st.roll_number || 'N/A'} | Class: {st.current_enrollment?.school_class?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">Select</Badge>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {form.errors.student_id && (
                            <p className="text-xs text-destructive mt-1">{form.errors.student_id}</p>
                        )}
                    </div>

                    {/* Fine Type & Collection Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="fine_type" className="text-xs font-semibold">Fine Type *</Label>
                            <select
                                id="fine_type"
                                value={form.data.fine_type}
                                onChange={(e) => form.setData('fine_type', e.target.value)}
                                className="w-full mt-1 p-2 text-xs rounded-xs border border-input bg-background text-foreground"
                            >
                                <option value="leave">Short Leave / Absentee Fine</option>
                                <option value="exam">Exam Penalty / Misconduct</option>
                                <option value="test">Class Test Penalty</option>
                                <option value="discipline">Discipline & Uniform Violation</option>
                                <option value="other">Other / Miscellaneous</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="collection_mode" className="text-xs font-semibold">Collection Mode *</Label>
                            <select
                                id="collection_mode"
                                value={form.data.collection_mode}
                                onChange={(e) => form.setData('collection_mode', e.target.value)}
                                className="w-full mt-1 p-2 text-xs rounded-xs border border-input bg-background text-foreground"
                            >
                                <option value="on_the_spot">Collect On The Spot</option>
                                <option value="monthly">Monthly Fee Invoice</option>
                                <option value="year_end">Year-End Settlement</option>
                            </select>
                        </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="amount" className="text-xs font-semibold">Fine Amount (Rs.) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                step="any"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                placeholder="e.g. 200"
                                required
                                className="text-xs"
                            />
                            {form.errors.amount && (
                                <p className="text-xs text-destructive mt-1">{form.errors.amount}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="fine_date" className="text-xs font-semibold">Date of Incident *</Label>
                            <Input
                                id="fine_date"
                                type="date"
                                value={form.data.fine_date}
                                onChange={(e) => form.setData('fine_date', e.target.value)}
                                required
                                className="text-xs"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <Label htmlFor="reason" className="text-xs font-semibold">Reason & Disciplinary Justification *</Label>
                        <Input
                            id="reason"
                            value={form.data.reason}
                            onChange={(e) => form.setData('reason', e.target.value)}
                            placeholder="e.g. Uninformed short leave during morning assembly"
                            required
                            className="text-xs"
                        />
                        {form.errors.reason && (
                            <p className="text-xs text-destructive mt-1">{form.errors.reason}</p>
                        )}
                    </div>

                    {/* Immediate Collection Checkbox */}
                    <div className="p-3 rounded-sm border border-border bg-muted/30 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <input
                                type="checkbox"
                                checked={form.data.collect_now}
                                onChange={(e) => form.setData('collect_now', e.target.checked)}
                                className="rounded-xs border-input text-primary focus:ring-ring w-4 h-4"
                            />
                            <span>Collect Fine Immediately (On The Spot)?</span>
                        </label>
                        {form.data.collect_now && (
                            <div className="pt-2">
                                <Label htmlFor="payment_method" className="text-[11px] font-medium text-muted-foreground">Payment Method</Label>
                                <select
                                    id="payment_method"
                                    value={form.data.payment_method}
                                    onChange={(e) => form.setData('payment_method', e.target.value)}
                                    className="w-full mt-1 p-2 text-xs rounded-xs border border-input bg-background text-foreground"
                                >
                                    <option value="cash">Cash in Hand</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="online">Online / EasyPaisa / JazzCash</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing || !selectedStudent} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {form.processing ? 'Imposing...' : 'Save & Impose Fine'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
