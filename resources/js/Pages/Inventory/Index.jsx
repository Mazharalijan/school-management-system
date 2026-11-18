import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import SearchInput from '@/components/SearchInput';
import FilterSelect from '@/components/FilterSelect';
import Pagination from '@/components/Pagination';
import TableActionButton from '@/components/TableActionButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Package,
    Plus,
    UserPlus,
    AlertTriangle,
    Layers,
    Boxes,
} from 'lucide-react';

export default function InventoryIndex({ items, categories, staffMembers, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
    const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Form: Create Item
    const addItemForm = useForm({
        category_id: '',
        name: '',
        asset_code: '',
        type: 'fixed_asset',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Form: Allocate Asset
    const allocateForm = useForm({
        inventory_item_id: '',
        allocation_target: 'location',
        staff_id: '',
        assigned_location: '',
        quantity: 1,
        allocated_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Form: Report Breakage / Stock Loss
    const damageForm = useForm({
        inventory_item_id: '',
        quantity: 1,
        reason: '',
    });

    // Filter Handler
    const handleFilter = (newParams = {}) => {
        router.get(
            route('inventory.index'),
            {
                search: searchTerm,
                category_id: selectedCategory,
                type: selectedType,
                ...newParams,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedType('');
        router.get(route('inventory.index'), {}, { preserveState: true, replace: true });
    };

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        addItemForm.post(route('inventory.items.store'), {
            onSuccess: () => {
                addItemForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleAllocateSubmit = (e) => {
        e.preventDefault();
        allocateForm.post(route('inventory.allocate'), {
            onSuccess: () => {
                allocateForm.reset();
                setIsAllocateModalOpen(false);
            },
        });
    };

    const handleDamageSubmit = (e) => {
        e.preventDefault();
        damageForm.post(route('inventory.report-damaged'), {
            onSuccess: () => {
                damageForm.reset();
                setIsDamageModalOpen(false);
            },
        });
    };

    useEffect(() => {
        const qty = parseFloat(addItemForm.data.quantity) || 0;
        const price = parseFloat(addItemForm.data.unit_price) || 0;

        addItemForm.setData('total_price', (qty * price).toFixed(2));
    }, [addItemForm.data.quantity, addItemForm.data.unit_price]);

    const hasFilters = Boolean(searchTerm || selectedCategory || selectedType);

    return (
        <AppLayout title="Assets & Inventory">
            <Head title="Assets & Inventory" />

            <div className="space-y-6">
                {/* Unified Page Header */}
                <PageHeader
                    title="Assets & Inventory Management"
                    subtitle="Track institutional equipment, supplies, classroom allocations, and damage records."
                    icon={Package}
                    buttonText="Add Inventory Item"
                    onButtonClick={() => setIsAddModalOpen(true)}
                />

                {/* Search & Filter Bar */}
                <FilterBar showReset={hasFilters} onReset={handleResetFilters}>
                    <SearchInput
                        value={searchTerm}
                        onChange={(e) => {
                            const val = e?.target ? e.target.value : e;
                            setSearchTerm(val);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFilter({ search: searchTerm });
                        }}
                        placeholder="Search code or item name..."
                        className="flex-1 min-w-[240px]"
                    />

                    <FilterSelect
                        value={selectedCategory}
                        onChange={(val) => {
                            setSelectedCategory(val);
                            handleFilter({ category_id: val });
                        }}
                        options={categories}
                        valueKey="id"
                        labelKey="name"
                        placeholder="All Categories"
                        className="w-48 shrink-0 text-xs"
                    />

                    <select
                        value={selectedType}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedType(val);
                            handleFilter({ type: val });
                        }}
                        className="h-10 text-xs rounded-xs border border-input bg-background px-3 text-foreground focus:ring-1 focus:ring-ring w-44 shrink-0"
                    >
                        <option value="">All Types</option>
                        <option value="fixed_asset">Fixed Assets</option>
                        <option value="consumable">Consumables / Supplies</option>
                    </select>

                    <Button onClick={() => handleFilter()} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-xs px-3">
                        Filter
                    </Button>
                </FilterBar>

                {/* Items Table Container */}
                <Card className="rounded-sm border border-border shadow-xs overflow-hidden bg-card text-card-foreground">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-muted-foreground">
                                <thead className="bg-muted/60 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4">Asset Code</th>
                                        <th className="p-4">Item Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Stock (Available / Total)</th>
                                        <th className="p-4">Price (Unit / Total)</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {items.data && items.data.length > 0 ? (
                                        items.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="p-4 font-mono font-bold text-primary">
                                                    {item.asset_code}
                                                </td>
                                                <td className="p-4 font-semibold text-foreground">
                                                    {item.name}
                                                </td>
                                                <td className="p-4 text-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {item.category?.name || 'Unassigned'}
                                                    </div>
                                                </td>
                                                <td className="p-4 capitalize text-foreground">
                                                    {item.type ? item.type.replace('_', ' ') : '-'}
                                                </td>
                                                <td className="p-4 font-mono">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.available_quantity}</span>
                                                    <span className="text-muted-foreground"> / {item.quantity}</span>
                                                </td>
                                                <td className="p-4 font-mono">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {Number(item.unit_price || 0).toLocaleString()}</span>
                                                    <span className="text-muted-foreground"> / Rs. {Number(item.total_price || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        className={
                                                            item.available_quantity > 0
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                                        }
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {/* Allocate / Assign */}
                                                        <TableActionButton
                                                            title="Allocate / Assign"
                                                            icon={UserPlus}
                                                            variant="primary"
                                                            disabled={item.available_quantity <= 0}
                                                            onClick={() => {
                                                                setSelectedItem(item);
                                                                allocateForm.setData('inventory_item_id', item.id);
                                                                setIsAllocateModalOpen(true);
                                                            }}
                                                        />

                                                        {/* Report Damage / Loss */}
                                                        <TableActionButton
                                                            title="Report Damage / Loss"
                                                            icon={AlertTriangle}
                                                            variant="danger"
                                                            disabled={item.available_quantity <= 0}
                                                            onClick={() => {
                                                                setSelectedItem(item);
                                                                damageForm.setData('inventory_item_id', item.id);
                                                                setIsDamageModalOpen(true);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-muted-foreground">
                                                <Boxes className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                                                No inventory items found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {items?.links && (
                            <div className="p-2 border-t border-border">
                                <Pagination
                                    links={items.links}
                                    from={items.from}
                                    to={items.to}
                                    total={items.total}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ADD ITEM MODAL */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddItemSubmit} className="space-y-3 pt-2">
                        <div>
                            <Label className="text-xs font-semibold">Category *</Label>
                            <select
                                className="w-full h-9 px-3 text-xs rounded-xs border border-input bg-background text-foreground mt-1"
                                value={addItemForm.data.category_id}
                                onChange={(e) => addItemForm.setData('category_id', e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs font-semibold">Item Name *</Label>
                                <Input
                                    className="h-9 text-xs mt-1"
                                    placeholder="e.g. Whiteboard, Microscopes"
                                    value={addItemForm.data.name}
                                    onChange={(e) => addItemForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">Asset Code *</Label>
                                <Input
                                    className="h-9 text-xs mt-1 font-mono uppercase"
                                    placeholder="e.g. FUR-TBL-001"
                                    value={addItemForm.data.asset_code}
                                    onChange={(e) => addItemForm.setData('asset_code', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-xs font-semibold">Type *</Label>
                                <select
                                    className="w-full h-9 px-3 text-xs rounded-xs border border-input bg-background text-foreground mt-1"
                                    value={addItemForm.data.type}
                                    onChange={(e) => addItemForm.setData('type', e.target.value)}
                                >
                                    <option value="fixed_asset">Fixed Asset</option>
                                    <option value="consumable">Consumable / Supply</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">Total Quantity *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    className="h-9 text-xs mt-1"
                                    value={addItemForm.data.quantity}
                                    onChange={(e) => addItemForm.setData('quantity', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">Unit Price *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-9 text-xs mt-1 font-mono"
                                    value={addItemForm.data.unit_price}
                                    onChange={(e) => addItemForm.setData('unit_price', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-3 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addItemForm.processing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Save Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ALLOCATE / ASSIGN MODAL */}
            <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Assign / Allocate Item</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <form onSubmit={handleAllocateSubmit} className="space-y-3 pt-2">
                            <div className="bg-muted/40 p-2.5 rounded-xs border border-border text-xs">
                                <p className="font-bold text-foreground">
                                    {selectedItem.name} ({selectedItem.asset_code})
                                </p>
                                <p className="text-muted-foreground">Available Stock: {selectedItem.available_quantity}</p>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Allocation Target</Label>
                                <select
                                    className="w-full h-9 px-3 text-xs rounded-xs border border-input bg-background text-foreground mt-1"
                                    value={allocateForm.data.allocation_target}
                                    onChange={(e) => allocateForm.setData('allocation_target', e.target.value)}
                                >
                                    <option value="location">Room / Class / Location (e.g., Classroom 1A)</option>
                                    <option value="staff">Staff Member</option>
                                </select>
                            </div>

                            {allocateForm.data.allocation_target === 'staff' ? (
                                <div>
                                    <Label className="text-xs font-semibold">Select Staff Member *</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded-xs border border-input bg-background text-foreground mt-1"
                                        value={allocateForm.data.staff_id}
                                        onChange={(e) => allocateForm.setData('staff_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Staff</option>
                                        {staffMembers.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.first_name} {staff.last_name} ({staff.employee_code || `EMP-${staff.id}`})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <Label className="text-xs font-semibold">Assigned Location / Room *</Label>
                                    <Input
                                        className="h-9 text-xs mt-1"
                                        placeholder="e.g. Class 5B, Science Lab"
                                        value={allocateForm.data.assigned_location}
                                        onChange={(e) => allocateForm.setData('assigned_location', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs font-semibold">Quantity *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedItem.available_quantity}
                                        className="h-9 text-xs mt-1"
                                        value={allocateForm.data.quantity}
                                        onChange={(e) => allocateForm.setData('quantity', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-xs mt-1"
                                        value={allocateForm.data.allocated_date}
                                        onChange={(e) => allocateForm.setData('allocated_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-3 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsAllocateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={allocateForm.processing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Allocate
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* REPORT DAMAGE / LOSS MODAL */}
            <Dialog open={isDamageModalOpen} onOpenChange={setIsDamageModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive">Report Loss / Breakage</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <form onSubmit={handleDamageSubmit} className="space-y-3 pt-2">
                            <div className="bg-muted/40 p-2.5 rounded-xs border border-border text-xs">
                                <p className="font-bold text-foreground">
                                    {selectedItem.name} ({selectedItem.asset_code})
                                </p>
                                <p className="text-muted-foreground">Available Stock: {selectedItem.available_quantity}</p>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Quantity Damaged / Lost *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={selectedItem.available_quantity}
                                    className="h-9 text-xs mt-1"
                                    value={damageForm.data.quantity}
                                    onChange={(e) => damageForm.setData('quantity', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Reason / Explanation *</Label>
                                <Input
                                    className="h-9 text-xs mt-1"
                                    placeholder="e.g. Broken during lab experiment / Chair leg cracked"
                                    value={damageForm.data.reason}
                                    onChange={(e) => damageForm.setData('reason', e.target.value)}
                                    required
                                />
                            </div>

                            <DialogFooter className="pt-3 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsDamageModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={damageForm.processing} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Write Off Stock
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}