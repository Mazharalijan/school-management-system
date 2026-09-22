import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    DialogDescription
} from '@/components/ui/dialog';
import { 
    Plus, 
    GraduationCap, 
    Users, 
    DoorOpen, 
    Layers, 
    Pencil, 
    Info, 
    Trash2, 
    CheckCircle2, 
    XCircle 
} from 'lucide-react';

export default function ClassMatrixIndex({ matrix }) {
    // Modal States
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [isClassDetailsModalOpen, setIsClassDetailsModalOpen] = useState(false);

    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
    const [isSectionDetailsModalOpen, setIsSectionDetailsModalOpen] = useState(false);

    // Active Selection Objects
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    // Forms
    const classForm = useForm({
        name: '',
        numeric_value: '',
        code: '',
        description: '',
        default_section_name: 'A',
        capacity: 40,
        room_number: '',
    });

    const editClassForm = useForm({
        name: '',
        numeric_value: '',
        code: '',
        description: '',
    });

    const sectionForm = useForm({
        school_class_id: '',
        name: '',
        capacity: 40,
        room_number: '',
        is_active: true,
    });

    const editSectionForm = useForm({
        school_class_id: '',
        name: '',
        capacity: 40,
        room_number: '',
        is_active: true,
    });

    // --- CLASS HANDLERS ---
    const handleCreateClass = (e) => {
        e.preventDefault();
        classForm.post(route('classes.store'), {
            onSuccess: () => {
                setIsClassModalOpen(false);
                classForm.reset();
            },
        });
    };

    const handleOpenEditClass = (cls) => {
        setSelectedClass(cls);
        editClassForm.setData({
            name: cls.name,
            numeric_value: cls.numeric_value,
            code: cls.code,
            description: cls.description || '',
        });
        setIsEditClassModalOpen(true);
    };

    const handleUpdateClass = (e) => {
        e.preventDefault();
        editClassForm.put(route('classes.update', selectedClass.id), {
            onSuccess: () => {
                setIsEditClassModalOpen(false);
                setSelectedClass(null);
            },
        });
    };

    const handleOpenClassDetails = (cls) => {
        setSelectedClass(cls);
        setIsClassDetailsModalOpen(true);
    };

    const handleDeleteClass = (classId) => {
        if (confirm('Are you sure you want to delete this class and all its sections?')) {
            router.delete(route('classes.destroy', classId));
        }
    };

    // --- SECTION HANDLERS ---
    const handleOpenSectionModal = (classId) => {
        sectionForm.setData('school_class_id', classId);
        setIsSectionModalOpen(true);
    };

    const handleCreateSection = (e) => {
        e.preventDefault();
        sectionForm.post(route('sections.store'), {
            onSuccess: () => {
                setIsSectionModalOpen(false);
                sectionForm.reset();
            },
        });
    };

    const handleOpenEditSection = (sec) => {
        setSelectedSection(sec);
        editSectionForm.setData({
            school_class_id: sec.school_class_id,
            name: sec.name,
            capacity: sec.capacity,
            room_number: sec.room_number || '',
            is_active: sec.is_active,
        });
        setIsEditSectionModalOpen(true);
    };

    const handleUpdateSection = (e) => {
        e.preventDefault();
        editSectionForm.put(route('sections.update', selectedSection.id), {
            onSuccess: () => {
                setIsEditSectionModalOpen(false);
                setSelectedSection(null);
            },
        });
    };

    const handleOpenSectionDetails = (sec, cls) => {
        setSelectedSection({ ...sec, parentClass: cls });
        setIsSectionDetailsModalOpen(true);
    };

    const handleDeleteSection = (sectionId) => {
        if (confirm('Are you sure you want to delete this section?')) {
            router.delete(route('sections.destroy', sectionId));
        }
    };

    return (
        <AppLayout title="Class & Section Matrix">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Class & Section Structures</h2>
                    <p className="text-sm text-slate-500">Manage grade levels and section allocations.</p>
                </div>
                <Button onClick={() => setIsClassModalOpen(true)} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Class</span>
                </Button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matrix.map((item) => (
                    <Card key={item.id} className="border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                        <div>
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <CardTitle className="text-base font-bold text-slate-800">{item.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs bg-white text-slate-600 border-slate-300">
                                            Level {item.numeric_value}
                                        </Badge>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">Code: {item.code}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-slate-500 hover:text-slate-800"
                                        onClick={() => handleOpenClassDetails(item)}
                                        title="View Details"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-slate-500 hover:text-blue-600"
                                        onClick={() => handleOpenEditClass(item)}
                                        title="Edit Class"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                                        onClick={() => handleDeleteClass(item.id)}
                                        title="Delete Class"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4 space-y-3">
                                <div className="space-y-2">
                                    {item.sections.map((sec) => (
                                        <div key={sec.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100 group">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                                                    {sec.name}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-slate-700 flex items-center space-x-2">
                                                        <Users className="h-3 w-3 text-slate-400" />
                                                        <span>Cap: {sec.capacity}</span>
                                                    </div>
                                                    {sec.room_number && (
                                                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                                                            <DoorOpen className="h-3 w-3 text-slate-400" />
                                                            <span>Room {sec.room_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <Badge className={sec.is_active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]" : "bg-red-100 text-red-800 text-[10px]"}>
                                                    {sec.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                                
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-slate-400 hover:text-slate-700"
                                                        onClick={() => handleOpenSectionDetails(sec, item)}
                                                    >
                                                        <Info className="h-3 w-3" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                                                        onClick={() => handleOpenEditSection(sec)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </div>

                        <div className="p-4 pt-0">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-xs border border-dashed border-slate-300 hover:bg-slate-50 text-slate-600"
                                onClick={() => handleOpenSectionModal(item.id)}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Section to {item.name}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- MODAL: CREATE CLASS --- */}
            <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Grade Class</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateClass} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Class Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Grade 1" 
                                    value={classForm.data.name} 
                                    onChange={e => classForm.setData('name', e.target.value)}
                                    tabIndex={1}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="numeric_value">Numeric Grade</Label>
                                <Input 
                                    id="numeric_value" 
                                    type="number" 
                                    placeholder="1" 
                                    value={classForm.data.numeric_value} 
                                    onChange={e => classForm.setData('numeric_value', e.target.value)}
                                    tabIndex={2}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="code">Class Code</Label>
                            <Input 
                                id="code" 
                                placeholder="e.g. CLS-01" 
                                value={classForm.data.code} 
                                onChange={e => classForm.setData('code', e.target.value)}
                                tabIndex={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description / Notes</Label>
                            <Input 
                                id="description" 
                                placeholder="Optional description..." 
                                value={classForm.data.description} 
                                onChange={e => classForm.setData('description', e.target.value)}
                                tabIndex={4}
                            />
                        </div>

                        <div className="border-t pt-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase">Initial Section</span>
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="default_section_name">Section</Label>
                                    <Input 
                                        id="default_section_name" 
                                        value={classForm.data.default_section_name} 
                                        onChange={e => classForm.setData('default_section_name', e.target.value)}
                                        tabIndex={5}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input 
                                        id="capacity" 
                                        type="number" 
                                        value={classForm.data.capacity} 
                                        onChange={e => classForm.setData('capacity', e.target.value)}
                                        tabIndex={6}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="room_number">Room No.</Label>
                                    <Input 
                                        id="room_number" 
                                        placeholder="101" 
                                        value={classForm.data.room_number} 
                                        onChange={e => classForm.setData('room_number', e.target.value)}
                                        tabIndex={7}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={classForm.processing} tabIndex={8}>Save Class</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: EDIT CLASS --- */}
            <Dialog open={isEditClassModalOpen} onOpenChange={setIsEditClassModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateClass} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit_name">Class Name</Label>
                                <Input 
                                    id="edit_name" 
                                    value={editClassForm.data.name} 
                                    onChange={e => editClassForm.setData('name', e.target.value)}
                                    tabIndex={1}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit_numeric_value">Numeric Grade</Label>
                                <Input 
                                    id="edit_numeric_value" 
                                    type="number" 
                                    value={editClassForm.data.numeric_value} 
                                    onChange={e => editClassForm.setData('numeric_value', e.target.value)}
                                    tabIndex={2}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit_code">Class Code</Label>
                            <Input 
                                id="edit_code" 
                                value={editClassForm.data.code} 
                                onChange={e => editClassForm.setData('code', e.target.value)}
                                tabIndex={3}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit_description">Description</Label>
                            <Input 
                                id="edit_description" 
                                value={editClassForm.data.description} 
                                onChange={e => editClassForm.setData('description', e.target.value)}
                                tabIndex={4}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditClassModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={editClassForm.processing} tabIndex={5}>Update Class</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: CLASS DETAILS --- */}
            <Dialog open={isClassDetailsModalOpen} onOpenChange={setIsClassDetailsModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <span>{selectedClass?.name} Overview</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedClass && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Class Code</span>
                                    <span className="font-bold text-slate-800">{selectedClass.code}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Numeric Level</span>
                                    <span className="font-bold text-slate-800">Grade {selectedClass.numeric_value}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-md border text-sm">
                                <span className="text-xs text-slate-400 block">Description</span>
                                <p className="text-slate-700 mt-0.5">{selectedClass.description || 'No specific description provided.'}</p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Attached Sections ({selectedClass.sections?.length})</span>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                    {selectedClass.sections?.map(sec => (
                                        <div key={sec.id} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                                            <span className="font-semibold">Section {sec.name}</span>
                                            <span className="text-slate-500">Cap: {sec.capacity} | Room: {sec.room_number || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClassDetailsModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: CREATE SECTION --- */}
            <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Section</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSection} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="sec_name">Section Name (e.g. B, Blue)</Label>
                            <Input 
                                id="sec_name" 
                                value={sectionForm.data.name} 
                                onChange={e => sectionForm.setData('name', e.target.value)}
                                tabIndex={1}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="sec_capacity">Capacity</Label>
                                <Input 
                                    id="sec_capacity" 
                                    type="number" 
                                    value={sectionForm.data.capacity} 
                                    onChange={e => sectionForm.setData('capacity', e.target.value)}
                                    tabIndex={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="sec_room">Room No.</Label>
                                <Input 
                                    id="sec_room" 
                                    value={sectionForm.data.room_number} 
                                    onChange={e => sectionForm.setData('room_number', e.target.value)}
                                    tabIndex={3}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={sectionForm.processing} tabIndex={4}>Add Section</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: EDIT SECTION --- */}
            <Dialog open={isEditSectionModalOpen} onOpenChange={setIsEditSectionModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Section {selectedSection?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSection} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="edit_sec_name">Section Name</Label>
                            <Input 
                                id="edit_sec_name" 
                                value={editSectionForm.data.name} 
                                onChange={e => editSectionForm.setData('name', e.target.value)}
                                tabIndex={1}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit_sec_capacity">Capacity</Label>
                                <Input 
                                    id="edit_sec_capacity" 
                                    type="number" 
                                    value={editSectionForm.data.capacity} 
                                    onChange={e => editSectionForm.setData('capacity', e.target.value)}
                                    tabIndex={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit_sec_room">Room No.</Label>
                                <Input 
                                    id="edit_sec_room" 
                                    value={editSectionForm.data.room_number} 
                                    onChange={e => editSectionForm.setData('room_number', e.target.value)}
                                    tabIndex={3}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                checked={editSectionForm.data.is_active}
                                onChange={e => editSectionForm.setData('is_active', e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500"
                            />
                            <Label htmlFor="is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
                                Active Section Status
                            </Label>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditSectionModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={editSectionForm.processing} tabIndex={4}>Update Section</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: SECTION DETAILS --- */}
            <Dialog open={isSectionDetailsModalOpen} onOpenChange={setIsSectionDetailsModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Layers className="h-5 w-5 text-indigo-600" />
                            <span>Section Details</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedSection && (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="p-3 bg-slate-50 rounded-md border flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-slate-400 block">Parent Class</span>
                                    <span className="font-bold text-slate-800">{selectedSection.parentClass?.name}</span>
                                </div>
                                <Badge variant="outline">{selectedSection.parentClass?.code}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Section Name</span>
                                    <span className="font-bold text-slate-800">{selectedSection.name}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Status</span>
                                    <span className="font-semibold text-xs flex items-center space-x-1 mt-0.5">
                                        {selectedSection.is_active ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-700">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                <span className="text-red-700">Inactive</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Student Capacity</span>
                                    <span className="font-bold text-slate-800">{selectedSection.capacity} Max</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-md border">
                                    <span className="text-xs text-slate-400 block">Assigned Room</span>
                                    <span className="font-bold text-slate-800">{selectedSection.room_number || 'Unassigned'}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="w-full text-xs flex items-center justify-center space-x-1"
                                    onClick={() => {
                                        setIsSectionDetailsModalOpen(false);
                                        handleDeleteSection(selectedSection.id);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete This Section</span>
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSectionDetailsModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}