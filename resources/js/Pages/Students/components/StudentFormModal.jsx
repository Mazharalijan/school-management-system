import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/ProfileAvatar';
import ImageCropModal from '@/components/ImageCropModal';
import { UserPen, UserPlus, UserX, Crop, Palette, Trash2, AlertCircle, Upload } from 'lucide-react';

export default function StudentFormModal({
    isOpen,
    onClose,
    student = null,
    classes = [],
    sections = [],
}) {
    const isEditMode = Boolean(student);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    const form = useForm({
        school_class_id: '',
        section_id: '',
        roll_number: '',
        first_name: '',
        last_name: '',
        gender: 'male',
        date_of_birth: '',
        status: 'active',
        admission_date: '',
        guardian_name: '',
        guardian_relation: '',
        guardian_phone: '',
        photo: null,
        background_color: 'original',
    });

    // Populate or reset form fields whenever modal opens or student target changes
    useEffect(() => {
        if (student) {
            form.setData({
                school_class_id: student.current_enrollment?.school_class_id || '',
                section_id: student.current_enrollment?.section_id || '',
                roll_number: student.roll_number || student.current_enrollment?.roll_number || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                gender: student.gender || 'male',
                date_of_birth: student.date_of_birth || '',
                status: student.status || 'active',
                admission_date: student.admission_date || '',
                guardian_name: student.guardian_name || '',
                guardian_relation: student.guardian_relation || '',
                guardian_phone: student.guardian_phone || '',
                photo: null,
                background_color: 'original',
            });
            setPhotoPreview(student.photo_url || null);
        } else {
            form.reset();
            setPhotoPreview(null);
        }
        form.clearErrors();
    }, [student, isOpen]);

    const getSectionsForClass = (classId) => {
        if (!classId) return [];
        return sections.filter(
            (sec) => String(sec.school_class_id) === String(classId)
        );
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setRawImageForCrop(tempUrl);
            setIsCropModalOpen(true);
            e.target.value = ''; // Reset file input so user can pick same file again if desired
        }
    };

    const handleCropApply = ({ file, previewUrl, backgroundColor }) => {
        form.setData((prev) => ({
            ...prev,
            photo: file,
            background_color: backgroundColor,
        }));
        setPhotoPreview(previewUrl);
    };

    const handleRemovePhoto = () => {
        form.setData((prev) => ({
            ...prev,
            photo: null,
            background_color: 'original',
        }));
        setPhotoPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));
            form.post(route('students.update', student.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setPhotoPreview(null);
                    onClose();
                },
            });
        } else {
            form.post(route('students.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setPhotoPreview(null);
                    onClose();
                },
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Student Profile' : 'New Student Admission'}
            maxWidth="sm:max-w-5xl"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <UserX />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="student-form"
                        disabled={form.processing}
                        className="bg-slate-800 hover:bg-slate-900 text-white"
                    >
                        {form.processing ? (
                            isEditMode ? 'Updating...' : 'Admitting...'
                        ) : isEditMode ? (
                            <>
                                <UserPen /> Update Student
                            </>
                        ) : (
                            <>
                                <UserPlus /> Save & Admit Student
                            </>
                        )}

                    </Button>
                </>
            }
        >
            <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Global Error Banner */}
                {Object.keys(form.errors).length > 0 && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-bold">Please correct the following errors:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                {Object.entries(form.errors).map(([field, msg]) => (
                                    <li key={field}>
                                        <strong className="capitalize">{field.replace('_', ' ')}:</strong> {msg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Academic Placement */}
                <div className="border-b pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Academic Placement
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                            <Label htmlFor="school_class_id">Class *</Label>
                            <select
                                id="school_class_id"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                value={form.data.school_class_id}
                                onChange={(e) => {
                                    form.setData({
                                        ...form.data,
                                        school_class_id: e.target.value,
                                        section_id: '',
                                    });
                                }}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors?.school_class_id && (
                                <span className="text-xs text-red-500">
                                    {form.errors.school_class_id}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="section_id">Section *</Label>
                            <select
                                id="section_id"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white disabled:bg-slate-100"
                                value={form.data.section_id}
                                onChange={(e) =>
                                    form.setData('section_id', e.target.value)
                                }
                                disabled={!form.data.school_class_id}
                                required
                            >
                                <option value="">Select Section</option>
                                {getSectionsForClass(
                                    form.data.school_class_id
                                ).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors?.section_id && (
                                <span className="text-xs text-red-500">
                                    {form.errors.section_id}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="roll_number">Roll Number</Label>
                            <Input
                                id="roll_number"
                                placeholder="e.g. 101"
                                value={form.data.roll_number}
                                onChange={(e) =>
                                    form.setData('roll_number', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="border-b pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Personal Information
                    </span>

                    {/* Profile Photo Upload with Crop & Background Adjustments */}
                    <div className="mt-2 mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="relative group shrink-0">
                                <ProfileAvatar
                                    src={photoPreview}
                                    name={form.data.first_name}
                                    className="w-16 h-16 border-2 border-slate-300 shadow-sm"
                                    iconClassName="w-8 h-8"
                                />
                                {form.data.background_color && form.data.background_color !== 'original' && (
                                    <span
                                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                        style={{
                                            backgroundColor:
                                                form.data.background_color === 'white'
                                                    ? '#FFFFFF'
                                                    : form.data.background_color === 'green'
                                                    ? '#166534'
                                                    : '#1D4ED8',
                                        }}
                                        title={`Background: ${form.data.background_color}`}
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-800">
                                        Student Profile Photo
                                    </Label>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Aspect Ratio: 1:1 Square (Auto-corrected)
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer transition">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {photoPreview && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setRawImageForCrop(photoPreview);
                                                    setIsCropModalOpen(true);
                                                }}
                                                className="text-xs h-8 text-slate-700"
                                            >
                                                <Crop className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                                Crop / Background
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemovePhoto}
                                                className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                Remove
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <p className="text-[11px] text-slate-500 leading-tight">
                                    Upload JPEG, PNG, or WEBP up to 5MB. You can resize, crop to 1:1, or apply an official <strong>white or green background</strong> before saving.
                                </p>

                                {form.errors?.photo && (
                                    <span className="text-xs text-rose-600 font-medium block">
                                        {form.errors.photo}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Interactive Crop & Background Customizer Modal */}
                    {isCropModalOpen && rawImageForCrop && (
                        <ImageCropModal
                            isOpen={isCropModalOpen}
                            imageSrc={rawImageForCrop}
                            onClose={() => setIsCropModalOpen(false)}
                            onApply={handleCropApply}
                            initialBgColor={form.data.background_color}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <div>
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={form.data.first_name}
                                onChange={(e) =>
                                    form.setData('first_name', e.target.value)
                                }
                                required
                            />
                            {form.errors?.first_name && (
                                <span className="text-xs text-red-500">
                                    {form.errors.first_name}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={form.data.last_name}
                                onChange={(e) =>
                                    form.setData('last_name', e.target.value)
                                }
                                required
                            />
                            {form.errors?.last_name && (
                                <span className="text-xs text-red-500">
                                    {form.errors.last_name}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender *</Label>
                            <select
                                id="gender"
                                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white"
                                value={form.data.gender}
                                onChange={(e) =>
                                    form.setData('gender', e.target.value)
                                }
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
                                value={form.data.date_of_birth}
                                onChange={(e) =>
                                    form.setData('date_of_birth', e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Guardian Contact */}
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Guardian Contact
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div>
                            <Label htmlFor="guardian_name">Guardian Name *</Label>
                            <Input
                                id="guardian_name"
                                value={form.data.guardian_name}
                                onChange={(e) =>
                                    form.setData('guardian_name', e.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="guardian_relation">Relation *</Label>
                            <Input
                                id="guardian_relation"
                                placeholder="Father, Mother..."
                                value={form.data.guardian_relation}
                                onChange={(e) =>
                                    form.setData(
                                        'guardian_relation',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="guardian_phone">Phone Number *</Label>
                            <Input
                                id="guardian_phone"
                                placeholder="+92 300 0000000"
                                value={form.data.guardian_phone}
                                onChange={(e) =>
                                    form.setData('guardian_phone', e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}