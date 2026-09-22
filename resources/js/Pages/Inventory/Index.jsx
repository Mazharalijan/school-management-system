import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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
    Search,
    Filter,
    UserPlus,
    AlertTriangle,
    Layers,
    Boxes,
    Pencil,
    Eye,
    Trash2
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
    const handleFilter = () => {
        router.get(
            route('inventory.index'),
            {
                search: searchTerm,
                category_id: selectedCategory,
                type: selectedType,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleFilter();
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

    return (
        <AppLayout title="Assets & Inventory">
            <Head title="Assets & Inventory" />

            {/* Container aligned with Students page layout */}
            <div className="py-6 w-full space-y-6">
                {/* Header Banner matching Students Index */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Assets & Inventory Management</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Track equipment, supplies, room allocations, and damage records
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-900 text-white gap-2 text-xs font-semibold px-4 py-2"
                    >
                        <Plus className="w-4 h-4" /> Add Inventory Item
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search code or item name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-9 text-xs rounded-md border border-slate-200 bg-slate-50/50 px-3 text-slate-700 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="h-9 text-xs rounded-md border border-slate-200 bg-slate-50/50 px-3 text-slate-700 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="fixed_asset">Fixed Assets</option>
                            <option value="consumable">Consumables / Supplies</option>
                        </select>

                        <Button onClick={handleFilter} className="bg-slate-800 hover:bg-slate-900 text-white h-9 text-xs gap-1.5 px-3">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Items Table Container */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
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
                            <tbody className="divide-y divide-slate-100">
                                {items.data && items.data.length > 0 ? (
                                    items.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 font-mono font-bold text-blue-600">
                                                {item.asset_code}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-900">
                                                {item.name}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.category?.name || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="p-4 capitalize text-slate-600">
                                                {item.type ? item.type.replace('_', ' ') : '-'}
                                            </td>
                                            <td className="p-4 font-mono">
                                                <span className="font-bold text-emerald-600">{item.available_quantity}</span>
                                                <span className="text-slate-400"> / {item.quantity}</span>
                                            </td>
                                            <td className="p-4 font-mono">
                                                <span className="font-bold text-emerald-600">{item.unit_price}</span>
                                                <span className="text-slate-400"> / {item.total_price}</span>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    className={
                                                        item.available_quantity > 0
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center space-x-1">
                                                    {/* View Details */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View Details"
                                                        className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {/* Allocate / Assign */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Allocate / Assign"
                                                        disabled={item.available_quantity <= 0}
                                                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            allocateForm.setData('inventory_item_id', item.id);
                                                            setIsAllocateModalOpen(true);
                                                        }}
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>

                                                    {/* Edit Item */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit Item"
                                                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleOpenEdit(item)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    {/* Report Damage / Loss */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Report Damage / Loss"
                                                        disabled={item.available_quantity <= 0}
                                                        className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            damageForm.setData('inventory_item_id', item.id);
                                                            setIsDamageModalOpen(true);
                                                        }}
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                    </Button>

                                                    {/* Delete Item */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete Item"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteStudent(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-slate-400">
                                            <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            No inventory items found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination matching Students page styling */}
                    {items.links && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Showing <span className="font-semibold text-slate-700">{items.from || 0}</span> to{' '}
                                <span className="font-semibold text-slate-700">{items.to || 0}</span> of{' '}
                                <span className="font-semibold text-slate-700">{items.total}</span> entries
                            </div>
                            <div className="flex gap-1">
                                {items.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url)}
                                        className={`h-8 px-3 text-xs ${link.active
                                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD ITEM MODAL */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddItemSubmit} className="space-y-3 pt-2">
                        <div>
                            <Label className="text-xs">Category *</Label>
                            <select
                                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white"
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
                                <Label className="text-xs">Item Name *</Label>
                                <Input
                                    className="h-9 text-xs"
                                    placeholder="e.g. Whiteboard, Glasses"
                                    value={addItemForm.data.name}
                                    onChange={(e) => addItemForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Asset Code *</Label>
                                <Input
                                    className="h-9 text-xs"
                                    placeholder="e.g. FUR-TBL-001"
                                    value={addItemForm.data.asset_code}
                                    onChange={(e) => addItemForm.setData('asset_code', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-xs">Type *</Label>
                                <select
                                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white"
                                    value={addItemForm.data.type}
                                    onChange={(e) => addItemForm.setData('type', e.target.value)}
                                >
                                    <option value="fixed_asset">Fixed Asset (Tables, Chairs)</option>
                                    <option value="consumable">Consumable / Supply (Dusters, Cups)</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs">Total Quantity *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    className="h-9 text-xs"
                                    value={addItemForm.data.quantity}
                                    onChange={(e) => addItemForm.setData('quantity', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Unit Price *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-9 text-xs"
                                    value={addItemForm.data.unit_price}
                                    onChange={(e) => addItemForm.setData('unit_price', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addItemForm.processing} className="bg-slate-800 hover:bg-slate-900 text-white">
                                Save Item
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ALLOCATE / ASSIGN MODAL */}
            <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">Assign / Allocate Item</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <form onSubmit={handleAllocateSubmit} className="space-y-3 pt-2">
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                                <p className="font-bold text-slate-800">
                                    {selectedItem.name} ({selectedItem.asset_code})
                                </p>
                                <p className="text-slate-500">Available Stock: {selectedItem.available_quantity}</p>
                            </div>

                            <div>
                                <Label className="text-xs">Allocation Target</Label>
                                <select
                                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white"
                                    value={allocateForm.data.allocation_target}
                                    onChange={(e) => allocateForm.setData('allocation_target', e.target.value)}
                                >
                                    <option value="location">Room / Class / Location (e.g., Classroom 1A)</option>
                                    <option value="staff">Staff Member</option>
                                </select>
                            </div>

                            {allocateForm.data.allocation_target === 'staff' ? (
                                <div>
                                    <Label className="text-xs">Select Staff Member *</Label>
                                    <select
                                        className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white"
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
                                    <Label className="text-xs">Assigned Location / Room *</Label>
                                    <Input
                                        className="h-9 text-xs"
                                        placeholder="e.g. Class 5B, Principal Office"
                                        value={allocateForm.data.assigned_location}
                                        onChange={(e) => allocateForm.setData('assigned_location', e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Quantity *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedItem.available_quantity}
                                        className="h-9 text-xs"
                                        value={allocateForm.data.quantity}
                                        onChange={(e) => allocateForm.setData('quantity', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Date *</Label>
                                    <Input
                                        type="date"
                                        className="h-9 text-xs"
                                        value={allocateForm.data.allocated_date}
                                        onChange={(e) => allocateForm.setData('allocated_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsAllocateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={allocateForm.processing} className="bg-slate-800 hover:bg-slate-900 text-white">
                                    Allocate
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* REPORT DAMAGE / LOSS MODAL */}
            <Dialog open={isDamageModalOpen} onOpenChange={setIsDamageModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-red-600">Report Loss / Breakage</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <form onSubmit={handleDamageSubmit} className="space-y-3 pt-2">
                            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                                <p className="font-bold text-slate-800">
                                    {selectedItem.name} ({selectedItem.asset_code})
                                </p>
                                <p className="text-slate-500">Available Stock: {selectedItem.available_quantity}</p>
                            </div>

                            <div>
                                <Label className="text-xs">Quantity Damaged / Lost *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={selectedItem.available_quantity}
                                    className="h-9 text-xs"
                                    value={damageForm.data.quantity}
                                    onChange={(e) => damageForm.setData('quantity', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Reason / Explanation *</Label>
                                <Input
                                    className="h-9 text-xs"
                                    placeholder="e.g. Broken during cleaning / Desk leg cracked"
                                    value={damageForm.data.reason}
                                    onChange={(e) => damageForm.setData('reason', e.target.value)}
                                    required
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsDamageModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={damageForm.processing} className="bg-red-600 hover:bg-red-700 text-white">
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