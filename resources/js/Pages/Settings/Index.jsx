import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    Settings,
    LayoutDashboard,
    Sparkles,
    BarChart3,
    CheckCircle2,
    Sun,
    Moon,
    Laptop,
    Palette
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
        include_fines_in_financial_flow: settings.include_fines_in_financial_flow !== undefined ? Boolean(settings.include_fines_in_financial_flow) : true,
        dashboard_theme: settings.dashboard_theme || 'shadcn',
        theme_mode: settings.theme_mode || (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'system') || 'system',
    });

    const handleThemeModeChange = (mode) => {
        form.setData('theme_mode', mode);

        // Immediate real-time preview
        const root = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        try {
            localStorage.setItem('theme', mode);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('theme-changed', { detail: mode }));
    };

    const handleDashboardThemeChange = (selectedTheme) => {
        form.setData('dashboard_theme', selectedTheme);

        try {
            localStorage.setItem('dashboard_theme', selectedTheme);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('dashboard-theme-changed', { detail: selectedTheme }));
    };

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
            onSuccess: () => {
                const mode = form.data.theme_mode || 'system';
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

                if (isDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }

                try {
                    localStorage.setItem('theme', mode);
                    localStorage.setItem('dashboard_theme', form.data.dashboard_theme);
                } catch (e) {}

                window.dispatchEvent(new CustomEvent('theme-changed', { detail: mode }));
            },
        });
    };

    return (
        <AppLayout title="System Settings">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <span>System Settings</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">Configure global school details, branding, contact info, and invoicing defaults.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* School Branding & Profile */}
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-foreground font-bold text-sm">
                            <Building className="h-4 w-4 text-primary" />
                            <span>School Identity & Logo</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Logo Upload Box */}
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-sm bg-muted/30">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="School Logo" className="h-28 w-28 object-contain mb-3 rounded-xs" />
                                ) : (
                                    <div className="h-28 w-28 bg-muted rounded-xs flex items-center justify-center text-muted-foreground mb-3">
                                        <ImageIcon className="h-10 w-10" />
                                    </div>
                                )}
                                <Label htmlFor="logo" className="cursor-pointer bg-card px-3 py-1.5 border border-border rounded-xs text-xs font-semibold text-foreground hover:bg-muted">
                                    Upload Logo
                                </Label>
                                <input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                {form.errors.logo && <span className="text-xs text-destructive mt-1">{form.errors.logo}</span>}
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
                                    {form.errors.school_name && <span className="text-xs text-destructive">{form.errors.school_name}</span>}
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

                {/* System Appearance & Color Mode (Light / Dark / System) */}
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                <Palette className="h-4 w-4 text-primary" />
                                <span>System Appearance &amp; Color Mode</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Choose light, dark, or system color mode</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Option 1: Light Mode */}
                            <div
                                onClick={() => handleThemeModeChange('light')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.theme_mode === 'light'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]">
                                            Light Mode
                                        </Badge>
                                        {form.data.theme_mode === 'light' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Light Theme</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Crisp white background with dark zinc typography and high-contrast borders. Perfect for bright environments.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground">
                                    Clean White &amp; Zinc
                                </div>
                            </div>

                            {/* Option 2: Dark Mode */}
                            <div
                                onClick={() => handleThemeModeChange('dark')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.theme_mode === 'dark'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                                            Dark Mode (Shadcn)
                                        </Badge>
                                        {form.data.theme_mode === 'dark' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <Moon className="h-3.5 w-3.5 text-primary" />
                                        <span>Dark Theme</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Deep dark background matching ui.shadcn.com/examples/dashboard. Easy on the eyes for extended operational sessions.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-primary font-semibold">
                                    Shadcn Modern Zinc Dark
                                </div>
                            </div>

                            {/* Option 3: System Mode */}
                            <div
                                onClick={() => handleThemeModeChange('system')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.theme_mode === 'system'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                                            Auto Detect
                                        </Badge>
                                        {form.data.theme_mode === 'system' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>System Preference</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Automatically adapts to your device operating system setting. Switches to dark mode or light mode dynamically.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
                                    Matches Device OS
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Dashboard Design & Layout Theme */}
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                <LayoutDashboard className="h-4 w-4 text-primary" />
                                <span>Dashboard UI Layout & Design</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Choose how the main dashboard looks</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Option 1: Shadcn Modern */}
                            <div
                                onClick={() => handleDashboardThemeChange('shadcn')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.dashboard_theme === 'shadcn'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                                            Shadcn UI (Recommended)
                                        </Badge>
                                        {form.data.dashboard_theme === 'shadcn' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        <span>Shadcn Modern</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Minimalist zinc dashboard inspired by ui.shadcn.com/examples/dashboard with interactive tabs, metric deltas, and clean bar charts.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-primary font-semibold">
                                    ui.shadcn.com/examples/dashboard
                                </div>
                            </div>

                            {/* Option 2: Academic Classic */}
                            <div
                                onClick={() => handleDashboardThemeChange('academic')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.dashboard_theme === 'academic'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                                            Classic
                                        </Badge>
                                        {form.data.dashboard_theme === 'academic' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <Building className="h-3.5 w-3.5 text-blue-500" />
                                        <span>Academic Classic</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Traditional school operations dashboard with colored stat cards, gender demographics, class/section count, and detailed tabular feeds.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
                                    School Operations Centric
                                </div>
                            </div>

                            {/* Option 3: Executive Compact */}
                            <div
                                onClick={() => handleDashboardThemeChange('compact')}
                                className={`p-4 rounded-sm border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                    form.data.dashboard_theme === 'compact'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                        : 'border-border hover:border-muted-foreground/30 bg-card'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px]">
                                            High Density
                                        </Badge>
                                        {form.data.dashboard_theme === 'compact' && (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                        <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Executive Compact</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        High-density KPI metric grid and financial performance indicators for quick senior administration reviews.
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
                                    Financial & Metric Dials
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Academic & Operations */}
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-foreground font-bold text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
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
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-foreground font-bold text-sm">
                            <Phone className="h-4 w-4 text-primary" />
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
                                    className="w-full p-2.5 text-sm rounded-xs border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Receipts, Invoicing & Fines Financial Flow */}
                <Card className="border-border bg-card text-card-foreground shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border text-foreground font-bold text-sm">
                            <Receipt className="h-4 w-4 text-primary" />
                            <span>Fee Receipt, Invoicing & Fines Financial Flow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

                        <div className="rounded-sm border border-border/80 bg-muted/30 p-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="include_fines_in_financial_flow"
                                    checked={Boolean(form.data.include_fines_in_financial_flow)}
                                    onChange={(e) => form.setData('include_fines_in_financial_flow', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded-xs border-input text-primary focus:ring-ring"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="include_fines_in_financial_flow" className="cursor-pointer font-semibold text-foreground text-sm">
                                        Include Student Fines in School Financial Flow & Profit / Loss Statement
                                    </Label>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        When checked, collected fines (leave fines, exam penalties, discipline fines) are recognized as school revenue in the Profit &amp; Loss reports and dashboard financial indicators. When unchecked, fines are accounted as administrative disciplinary penalties and excluded from the school payment flow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Action */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2 px-6"
                    >
                        <Save className="h-4 w-4" />
                        <span>Save Settings</span>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}