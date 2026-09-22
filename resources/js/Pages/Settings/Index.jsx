import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Building,
    Globe,
    Phone,
    Mail,
    MapPin,
    Receipt,
    Image as ImageIcon,
    Save,
    Calendar,
    Settings
} from 'lucide-react';

export default function SettingsIndex({ settings = {} }) {
    const [logoPreview, setLogoPreview] = useState(settings.logo_url || null);

    const form = useForm({
        _method: 'POST',
        school_name: settings.school_name || '',
        school_tagline: settings.school_tagline || '',
        logo: null,
        registration_number: settings.registration_number || '',
        current_session_year: settings.current_session_year || '2026-2027',
        currency_symbol: settings.currency_symbol || 'Rs.',
        currency_code: settings.currency_code || 'PKR',
        timezone: settings.timezone || 'Asia/Karachi',
        date_format: settings.date_format || 'Y-m-d',
        phone: settings.phone || '',
        alt_phone: settings.alt_phone || '',
        email: settings.email || '',
        website: settings.website || '',
        address: settings.address || '',
        invoice_prefix: settings.invoice_prefix || 'INV-',
        receipt_footer_note: settings.receipt_footer_note || '',
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout title="System Settings">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <span>System Settings</span>
                    </h2>
                    <p className="text-sm text-slate-500">Configure global school details, branding, contact info, and invoicing defaults.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* School Branding & Profile */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span>School Identity & Logo</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Logo Upload Box */}
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="School Logo" className="h-28 w-28 object-contain mb-3 rounded" />
                                ) : (
                                    <div className="h-28 w-28 bg-slate-200 rounded flex items-center justify-center text-slate-400 mb-3">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                )}
                                <Label htmlFor="logo" className="cursor-pointer bg-white px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                    Upload Logo
                                </Label>
                                <input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                {form.errors.logo && <span className="text-xs text-red-500 mt-1">{form.errors.logo}</span>}
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="school_name">School Name *</Label>
                                    <Input
                                        id="school_name"
                                        value={form.data.school_name}
                                        onChange={(e) => form.setData('school_name', e.target.value)}
                                        required
                                    />
                                    {form.errors.school_name && <span className="text-xs text-red-500">{form.errors.school_name}</span>}
                                </div>

                                <div>
                                    <Label htmlFor="school_tagline">Tagline / Motto</Label>
                                    <Input
                                        id="school_tagline"
                                        placeholder="e.g. Excellence in Education"
                                        value={form.data.school_tagline}
                                        onChange={(e) => form.setData('school_tagline', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="registration_number">Reg / Board Code</Label>
                                    <Input
                                        id="registration_number"
                                        placeholder="e.g. REG-2026-99"
                                        value={form.data.registration_number}
                                        onChange={(e) => form.setData('registration_number', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Academic & Operations */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>Academic & System Operations</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="current_session_year">Active Academic Session *</Label>
                                <Input
                                    id="current_session_year"
                                    placeholder="2026-2027"
                                    value={form.data.current_session_year}
                                    onChange={(e) => form.setData('current_session_year', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="currency_symbol">Currency Symbol *</Label>
                                <Input
                                    id="currency_symbol"
                                    placeholder="Rs."
                                    value={form.data.currency_symbol}
                                    onChange={(e) => form.setData('currency_symbol', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="currency_code">Currency Code *</Label>
                                <Input
                                    id="currency_code"
                                    placeholder="PKR"
                                    value={form.data.currency_code}
                                    onChange={(e) => form.setData('currency_code', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input
                                    id="timezone"
                                    value={form.data.timezone}
                                    onChange={(e) => form.setData('timezone', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact & Address */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span>Contact & Address Information</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Primary Phone *</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="alt_phone">Secondary Phone</Label>
                                <Input
                                    id="alt_phone"
                                    value={form.data.alt_phone}
                                    onChange={(e) => form.setData('alt_phone', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Official Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="website">Website URL</Label>
                                <Input
                                    id="website"
                                    placeholder="https://myschool.edu.pk"
                                    value={form.data.website}
                                    onChange={(e) => form.setData('website', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="address">Full Address *</Label>
                                <textarea
                                    id="address"
                                    rows="2"
                                    className="w-full p-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Receipts & Invoicing */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 text-slate-800 font-bold text-sm">
                            <Receipt className="h-4 w-4 text-blue-600" />
                            <span>Fee Receipt & Invoice Settings</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="invoice_prefix">Invoice Prefix *</Label>
                                <Input
                                    id="invoice_prefix"
                                    placeholder="INV-"
                                    value={form.data.invoice_prefix}
                                    onChange={(e) => form.setData('invoice_prefix', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="receipt_footer_note">Receipt Footer Note</Label>
                                <Input
                                    id="receipt_footer_note"
                                    placeholder="e.g. Fees once paid are non-refundable."
                                    value={form.data.receipt_footer_note}
                                    onChange={(e) => form.setData('receipt_footer_note', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Action */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-6"
                    >
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}