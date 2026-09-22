import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SalaryManagementModal from '@/Pages/Staff/components/SalaryManagementModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    UserPlus,
    Search,
    RotateCcw,
    Pencil,
    Eye,
    Trash2,
    Phone,
    Mail,
    Calendar,
    User,
    Briefcase,
    ShieldCheck,
    Award,
    MapPin,
    CreditCard,
    Receipt
} from 'lucide-react';

export default function StaffIndex({ staff = { data: [] }, filters = {} }) {
    // Dropdown Preset Options
    const DESIGNATIONS = [
        'Principal / Vice Principal',
        'Senior Teacher',
        'Junior Teacher',
        'Subject Specialist',
        'Accountant / Admin',
        'Support Staff'
    ];

    const QUALIFICATIONS = [
        'Matriculation / SSC',
        'Intermediate / HSSC',
        'Bachelor / BA / B.Sc / B.Com',
        'BS (4-Year Program)',
        'Master / MA / M.Sc / M.Com',
        'MS / M.Phil',
        'Ph.D.'
    ];

    const SKILL_OPTIONS = [
        'DIT (Diploma in Information Technology)',
        'Computer Diploma',
        'AIOU Teaching Diploma (B.Ed/M.Ed)',
        'Montessori Training Certificate',
        'Other Professional Certification'
    ];

    // Helper: Formats raw digit inputs into CNIC pattern (xxxxx-xxxxxxx-x) and restricts to 13 digits
    const formatCNIC = (value) => {
        const raw = value.replace(/\D/g, '').slice(0, 13);
        if (raw.length <= 5) return raw;
        if (raw.length <= 12) return `${raw.slice(0, 5)}-${raw.slice(5)}`;
        return `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12)}`;
    };

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

    // Search & Filter state initialized from props
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDesignationFilter, setSelectedDesignationFilter] = useState(filters.designation || '');

    // Ref to skip initial search trigger on mount
    const isFirstRender = useRef(true);

    // Form: Create Staff
    const staffForm = useForm({
        first_name: '',
        last_name: '',
        father_name: '',
        cnic: '',
        email: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        designation: '',
        qualification: '',
        skills: [],
        joining_date: new Date().toISOString().split('T')[0],
        salary: '',
        address: '',
    });

    // Form: Edit Staff
    const editForm = useForm({
        first_name: '',
        last_name: '',
        father_name: '',
        cnic: '',
        email: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        designation: '',
        qualification: '',
        skills: [],
        joining_date: '',
        salary: '',
        address: '',
        status: 'active',
    });

    // Toggle skills checkboxes
    const handleSkillToggle = (formInstance, skill) => {
        const currentSkills = formInstance.data.skills || [];
        if (currentSkills.includes(skill)) {
            formInstance.setData('skills', currentSkills.filter((s) => s !== skill));
        } else {
            formInstance.setData('skills', [...currentSkills, skill]);
        }
    };

    // Debounced Search logic (300ms)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('staff.index'),
                {
                    search: searchQuery,
                    designation: selectedDesignationFilter,
                },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Instant Designation Filter Handler
    const handleDesignationChange = (e) => {
        const designation = e.target.value;
        setSelectedDesignationFilter(designation);

        router.get(
            route('staff.index'),
            {
                search: searchQuery,
                designation: designation,
            },
            { preserveState: true, replace: true }
        );
    };

    // Reset Filters Handler
    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedDesignationFilter('');
        router.get(route('staff.index'), {}, { preserveState: true, replace: true });
    };

    // --- CRUD 1: CREATE ---
    const handleCreateStaff = (e) => {
        e.preventDefault();
        staffForm.post(route('staff.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                staffForm.reset();
            },
        });
    };

    // --- CRUD 2: OPEN EDIT MODAL & PRE-FILL ---
    const handleOpenEdit = (member) => {
        setSelectedStaff(member);

        let existingSkills = member.skills || [];
        if (typeof existingSkills === 'string') {
            try {
                existingSkills = JSON.parse(existingSkills);
            } catch (err) {
                existingSkills = [];
            }
        }

        editForm.setData({
            first_name: member.first_name || '',
            last_name: member.last_name || '',
            father_name: member.father_name || '',
            cnic: member.cnic ? formatCNIC(member.cnic) : '',
            email: member.email || '',
            phone: member.phone || '',
            gender: member.gender || 'male',
            date_of_birth: member.date_of_birth || '',
            designation: member.designation || '',
            qualification: member.qualification || '',
            skills: existingSkills,
            joining_date: member.joining_date || '',
            salary: member.salary || '',
            address: member.address || '',
            status: member.status || 'active',
        });
        setIsEditModalOpen(true);
    };

    // --- CRUD 3: UPDATE ---
    const handleUpdateStaff = (e) => {
        e.preventDefault();
        editForm.put(route('staff.update', selectedStaff.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedStaff(null);
            },
        });
    };

    // --- CRUD 4: DELETE ---
    const handleDeleteStaff = (staffId) => {
        if (confirm('Are you sure you want to delete this staff record? This action cannot be undone.')) {
            router.delete(route('staff.destroy', staffId));
        }
    };
    const handleOpenSalaryModal = (staffMember) => {
        setSelectedStaff(staffMember);
        setIsSalaryModalOpen(true);
    };
    return (
        <AppLayout title="Staff Directory">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Staff Directory</h2>
                    <p className="text-sm text-slate-500">Manage teachers, administrators, and school support staff profiles.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 hover:cursor-pointer text-white shadow-sm"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Staff Member</span>
                </Button>
            </div>

            {/* Single-Row Search & Filter Bar */}
            <Card className="mb-6 border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-row items-center gap-3 w-full">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 z-10">
                                <Search className="h-4 w-4" />
                            </div>

                            <Input
                                placeholder="Search by name, CNIC, employee code, email, or phone..."
                                className="pl-10 w-full bg-white h-10 border-slate-200 focus-visible:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="w-56 shrink-0">
                            <select
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDesignationFilter}
                                onChange={handleDesignationChange}
                            >
                                <option value="">All Designations</option>
                                {DESIGNATIONS.map((desig, idx) => (
                                    <option key={idx} value={desig}>
                                        {desig}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(searchQuery || selectedDesignationFilter) && (
                            <Button
                                type="button"
                                onClick={handleResetFilter}
                                variant="outline"
                                className="h-10 px-3 flex items-center space-x-1 text-slate-600 shrink-0 border-slate-200 hover:bg-slate-50"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Staff Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Emp Code</th>
                                    <th className="px-4 py-3">Staff Name</th>
                                    <th className="px-4 py-3">Designation & Qualification</th>
                                    <th className="px-4 py-3">Contact Info</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {staff.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-400">
                                            No staff records found.
                                        </td>
                                    </tr>
                                ) : (
                                    staff.data.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                                                {member.employee_code || `EMP-${member.id}`}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-800">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                {member.father_name && (
                                                    <div className="text-xs text-slate-500">
                                                        S/O, D/O: {member.father_name}
                                                    </div>
                                                )}
                                                <span className="text-xs text-slate-400 capitalize">
                                                    {member.gender} | Joined: {member.joining_date}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {member.designation || 'Staff'}
                                                </Badge>
                                                {member.qualification && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {member.qualification}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-slate-700 flex items-center space-x-1">
                                                    <Mail className="h-3 w-3 text-slate-400" />
                                                    <span>{member.email || 'N/A'}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{member.phone || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={
                                                    member.status === 'active'
                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0"
                                                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0"
                                                }>
                                                    {member.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View Details"
                                                        className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                                        onClick={() => {
                                                            setSelectedStaff(member);
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Salary Management"
                                                        className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                                        onClick={() => {
                                                            setSelectedStaff(member);
                                                            setIsSalaryModalOpen(true);
                                                        }}
                                                    >
                                                        <Receipt className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit Staff"
                                                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleOpenEdit(member)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete Staff"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteStaff(member.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* --- MODAL 1: NEW STAFF MEMBER (CREATE) --- */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Add Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateStaff} className="space-y-4 pt-2">
                        {/* Employment Information */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Details</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="designation">Designation *</Label>
                                    <select
                                        id="designation"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={staffForm.data.designation}
                                        onChange={(e) => staffForm.setData('designation', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Designation</option>
                                        {DESIGNATIONS.map((role, idx) => (
                                            <option key={idx} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    {staffForm.errors.designation && <span className="text-xs text-red-500">{staffForm.errors.designation}</span>}
                                </div>
                                <div>
                                    <Label htmlFor="joining_date">Joining Date *</Label>
                                    <Input
                                        id="joining_date"
                                        type="date"
                                        value={staffForm.data.joining_date}
                                        onChange={(e) => staffForm.setData('joining_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input
                                        id="salary"
                                        type="number"
                                        placeholder="e.g. 50000"
                                        value={staffForm.data.salary}
                                        onChange={(e) => staffForm.setData('salary', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Information</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={staffForm.data.first_name}
                                        onChange={(e) => staffForm.setData('first_name', e.target.value)}
                                        required
                                    />
                                    {staffForm.errors.first_name && <span className="text-xs text-red-500">{staffForm.errors.first_name}</span>}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={staffForm.data.last_name}
                                        onChange={(e) => staffForm.setData('last_name', e.target.value)}
                                        required
                                    />
                                    {staffForm.errors.last_name && <span className="text-xs text-red-500">{staffForm.errors.last_name}</span>}
                                </div>
                                <div>
                                    <Label htmlFor="father_name">Father / Husband Name *</Label>
                                    <Input
                                        id="father_name"
                                        placeholder="Full Name"
                                        value={staffForm.data.father_name}
                                        onChange={(e) => staffForm.setData('father_name', e.target.value)}
                                        required
                                    />
                                    {staffForm.errors.father_name && <span className="text-xs text-red-500">{staffForm.errors.father_name}</span>}
                                </div>
                                <div>
                                    <Label htmlFor="cnic">CNIC Number (13 Digits) *</Label>
                                    <Input
                                        id="cnic"
                                        placeholder="XXXXX-XXXXXXX-X"
                                        value={staffForm.data.cnic}
                                        onChange={(e) => staffForm.setData('cnic', formatCNIC(e.target.value))}
                                        required
                                    />
                                    {staffForm.errors.cnic && <span className="text-xs text-red-500">{staffForm.errors.cnic}</span>}
                                </div>
                                <div>
                                    <Label htmlFor="gender">Gender *</Label>
                                    <select
                                        id="gender"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={staffForm.data.gender}
                                        onChange={(e) => staffForm.setData('gender', e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={staffForm.data.date_of_birth}
                                        onChange={(e) => staffForm.setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Qualifications & Additional Diplomas */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic & Diplomas</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="qualification">Highest Academic Qualification *</Label>
                                    <select
                                        id="qualification"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={staffForm.data.qualification}
                                        onChange={(e) => staffForm.setData('qualification', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Qualification</option>
                                        {QUALIFICATIONS.map((qual, idx) => (
                                            <option key={idx} value={qual}>{qual}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={staffForm.data.email}
                                        onChange={(e) => staffForm.setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Skills / Diplomas Checkboxes */}
                            <div className="mt-3">
                                <Label className="block mb-1.5 text-xs font-semibold text-slate-700">Other Skills & Professional Diplomas</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-md border border-slate-200">
                                    {SKILL_OPTIONS.map((skill, idx) => (
                                        <label key={idx} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={staffForm.data.skills.includes(skill)}
                                                onChange={() => handleSkillToggle(staffForm, skill)}
                                            />
                                            <span>{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Address Information */}
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact & Residential Address</span>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+92 300 0000000"
                                        value={staffForm.data.phone}
                                        onChange={(e) => staffForm.setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Home Address</Label>
                                    <textarea
                                        id="address"
                                        rows="2"
                                        placeholder="Street, City, Sector / Area details..."
                                        className="w-full p-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={staffForm.data.address}
                                        onChange={(e) => staffForm.setData('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={staffForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">Save Staff Member</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL 2: EDIT STAFF (UPDATE) --- */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Edit Staff Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStaff} className="space-y-4 pt-2">
                        {/* Status & Designation */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Details</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="edit_status">Status *</Label>
                                    <select
                                        id="edit_status"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="edit_designation">Designation *</Label>
                                    <select
                                        id="edit_designation"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={editForm.data.designation}
                                        onChange={(e) => editForm.setData('designation', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Designation</option>
                                        {DESIGNATIONS.map((role, idx) => (
                                            <option key={idx} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="edit_joining_date">Joining Date *</Label>
                                    <Input
                                        id="edit_joining_date"
                                        type="date"
                                        value={editForm.data.joining_date}
                                        onChange={(e) => editForm.setData('joining_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Information</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="edit_first_name">First Name *</Label>
                                    <Input
                                        id="edit_first_name"
                                        value={editForm.data.first_name}
                                        onChange={(e) => editForm.setData('first_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit_last_name">Last Name *</Label>
                                    <Input
                                        id="edit_last_name"
                                        value={editForm.data.last_name}
                                        onChange={(e) => editForm.setData('last_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit_father_name">Father / Husband Name *</Label>
                                    <Input
                                        id="edit_father_name"
                                        value={editForm.data.father_name}
                                        onChange={(e) => editForm.setData('father_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit_cnic">CNIC Number (13 Digits) *</Label>
                                    <Input
                                        id="edit_cnic"
                                        placeholder="XXXXX-XXXXXXX-X"
                                        value={editForm.data.cnic}
                                        onChange={(e) => editForm.setData('cnic', formatCNIC(e.target.value))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit_gender">Gender *</Label>
                                    <select
                                        id="edit_gender"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={editForm.data.gender}
                                        onChange={(e) => editForm.setData('gender', e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="edit_date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="edit_date_of_birth"
                                        type="date"
                                        value={editForm.data.date_of_birth}
                                        onChange={(e) => editForm.setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Qualification & Skills */}
                        <div className="border-b pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic & Diplomas</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="edit_qualification">Highest Academic Qualification *</Label>
                                    <select
                                        id="edit_qualification"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                        value={editForm.data.qualification}
                                        onChange={(e) => editForm.setData('qualification', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Qualification</option>
                                        {QUALIFICATIONS.map((qual, idx) => (
                                            <option key={idx} value={qual}>{qual}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="edit_email">Email Address *</Label>
                                    <Input
                                        id="edit_email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <Label className="block mb-1.5 text-xs font-semibold text-slate-700">Other Skills & Professional Diplomas</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-md border border-slate-200">
                                    {SKILL_OPTIONS.map((skill, idx) => (
                                        <label key={idx} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                checked={editForm.data.skills.includes(skill)}
                                                onChange={() => handleSkillToggle(editForm, skill)}
                                            />
                                            <span>{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Address Information */}
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact & Residential Address</span>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                <div>
                                    <Label htmlFor="edit_phone">Phone Number *</Label>
                                    <Input
                                        id="edit_phone"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit_address">Home Address</Label>
                                    <textarea
                                        id="edit_address"
                                        rows="2"
                                        placeholder="Street, City, Sector / Area details..."
                                        className="w-full p-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editForm.data.address}
                                        onChange={(e) => editForm.setData('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">Update Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL: VIEW STAFF DETAILS --- */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[120vh] overflow-y-auto p-6">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center justify-between text-slate-800">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>Staff Member Profile</span>
                            </div>
                            {selectedStaff && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700 border-slate-200">
                                        {selectedStaff.employee_code || `EMP-${selectedStaff.id}`}
                                    </Badge>
                                    <Badge className={
                                        selectedStaff.status === 'active'
                                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 capitalize"
                                            : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 capitalize"
                                    }>
                                        {selectedStaff.status || 'Active'}
                                    </Badge>
                                </div>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStaff && (
                        <div className="flex flex-col md:flex-row gap-6 mt-2">
                            
                            {/* LEFT SIDEBAR: BASIC INFO */}
                            <aside className="w-full md:w-72 shrink-0 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                {/* Identity Header */}
                                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200">
                                    <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-500 flex items-center justify-center font-bold text-xl mb-2">
                                        {selectedStaff.first_name?.[0]}{selectedStaff.last_name?.[0]}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-base">
                                        {selectedStaff.first_name} {selectedStaff.last_name}
                                    </h3>
                                    {selectedStaff.father_name && (
                                        <p className="text-xs text-slate-500">Father/Husband: {selectedStaff.father_name}</p>
                                    )}
                                    <p className="text-xs text-slate-500 font-semibold mt-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {selectedStaff.designation || 'Staff Member'}
                                    </p>
                                </div>

                                {/* Contact & Personal Metadata */}
                                <div className="space-y-3 text-xs text-slate-600">
                                    <div className="flex items-start space-x-2.5">
                                        <CreditCard className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-slate-400 block text-[11px] font-medium">CNIC / Identity</span>
                                            <span className="font-mono font-semibold text-slate-800">
                                                {selectedStaff.cnic ? formatCNIC(selectedStaff.cnic) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2.5">
                                        <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-slate-400 block text-[11px] font-medium">Phone Number</span>
                                            <span className="font-medium text-slate-800">{selectedStaff.phone || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2.5">
                                        <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                                            <span className="font-medium text-slate-800 break-all">{selectedStaff.email || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2.5">
                                        <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-slate-400 block text-[11px] font-medium">Joining Date</span>
                                            <span className="font-medium text-slate-800">{selectedStaff.joining_date || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {selectedStaff.address && (
                                        <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200/60">
                                            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-slate-400 block text-[11px] font-medium">Residential Address</span>
                                                <span className="font-medium text-slate-800 leading-tight block">{selectedStaff.address}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </aside>

                            {/* RIGHT SIDE: TABS FOR EDUCATIONAL & SALARY DETAILS */}
                            <main className="flex-1 min-w-0">
                                <Tabs defaultValue="educational-details" className="w-full">
                                    <div className="border-b border-slate-200 mb-4">
                                        <TabsList className="bg-transparent p-0 h-auto space-x-6">
                                            <TabsTrigger 
                                                value="educational-details"
                                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none px-1 pb-2.5 pt-0 font-semibold text-xs text-slate-500 shadow-none"
                                            >
                                                <Award className="h-3.5 w-3.5 mr-1.5" />
                                                Educational Details
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="salary-details"
                                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 rounded-none px-1 pb-2.5 pt-0 font-semibold text-xs text-slate-500 shadow-none"
                                            >
                                                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                                Salary Details
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    {/* TAB 1: EDUCATIONAL DETAILS */}
                                    <TabsContent value="educational-details" className="mt-0 space-y-4">
                                        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                                            <div>
                                                <span className="text-xs text-slate-400 font-medium block">Highest Academic Qualification</span>
                                                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                                                    {selectedStaff.qualification || 'N/A'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100">
                                                <span className="text-xs text-slate-400 font-medium block mb-2">
                                                    Certifications & Skills
                                                </span>
                                                {selectedStaff.skills && (Array.isArray(selectedStaff.skills) ? selectedStaff.skills : JSON.parse(selectedStaff.skills || '[]')).length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(Array.isArray(selectedStaff.skills) ? selectedStaff.skills : JSON.parse(selectedStaff.skills || '[]')).map((sk, idx) => (
                                                            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 text-xs py-1 px-2.5 border-slate-200">
                                                                {sk}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">No additional certifications listed.</p>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* TAB 2: SALARY DETAILS */}
                                    <TabsContent value="salary-details" className="mt-0">
                                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                                            <table className="w-full text-xs text-left text-slate-600">
                                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Month</th>
                                                        <th className="px-3 py-2.5">Base Salary</th>
                                                        <th className="px-3 py-2.5">Net Paid</th>
                                                        <th className="px-3 py-2.5">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedStaff.salary_history && selectedStaff.salary_history.length > 0 ? (
                                                        selectedStaff.salary_history.map((sal) => (
                                                            <tr key={sal.id} className="hover:bg-slate-50">
                                                                <td className="px-3 py-2 font-medium text-slate-800">{sal.month}</td>
                                                                <td className="px-3 py-2">{sal.base_salary}</td>
                                                                <td className="px-3 py-2 font-semibold text-slate-800">{sal.net_salary}</td>
                                                                <td className="px-3 py-2">
                                                                    <Badge className={sal.status === 'paid' ? "bg-emerald-100 text-emerald-800 border-0" : "bg-amber-100 text-amber-800 border-0"}>
                                                                        {sal.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-6 text-slate-400">
                                                                No salary records found for this staff member.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>

                                </Tabs>
                            </main>
                        </div>
                    )}

                    <DialogFooter className="mt-4 pt-3 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* INTEGRATED SALARY & LEDGER MODAL */}
            {selectedStaff && (
                <SalaryManagementModal
                    isOpen={isSalaryModalOpen}
                    onClose={() => {
                        setIsSalaryModalOpen(false);
                        setSelectedStaff(null);
                    }}
                    staff={selectedStaff}
                />
            )}
        </AppLayout>
    );
}