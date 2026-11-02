import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
    GraduationCap, 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    ShieldCheck, 
    Sparkles, 
    CheckCircle2, 
    Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 relative overflow-hidden font-sans">
            <Head title="Initial Administrator Setup - SMS" />

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Central Form Container */}
            <div className="w-full max-w-xl relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-indigo-500/20 mb-3 ring-1 ring-white/20">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        SMS Portal
                    </h1>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Initial Administrator Setup</span>
                    </div>
                </div>

                {/* Registration Glassmorphic Card */}
                <div className="bg-slate-900/75 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-white/5">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white tracking-tight">
                            Create Master Administrator
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            No active users exist in the system. Configure the primary administrative account to bootstrap the school portal with full permissions.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* First and Last Name row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="first_name" className="text-xs font-medium text-slate-300">
                                    First Name <span className="text-rose-400">*</span>
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        required
                                        autoFocus
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="e.g. Mazhar"
                                        className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-sm rounded-xl"
                                    />
                                </div>
                                {errors.first_name && (
                                    <p className="text-xs text-rose-400 mt-1">{errors.first_name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="last_name" className="text-xs font-medium text-slate-300">
                                    Last Name <span className="text-rose-400">*</span>
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        name="last_name"
                                        required
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="e.g. Ali"
                                        className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-sm rounded-xl"
                                    />
                                </div>
                                {errors.last_name && (
                                    <p className="text-xs text-rose-400 mt-1">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                                Administrative Email <span className="text-rose-400">*</span>
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@school.edu.pk"
                                    className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-sm rounded-xl"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-rose-400 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                                Password <span className="text-rose-400">*</span>
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="new-password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-sm rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-400 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-medium text-slate-300">
                                Confirm Password <span className="text-rose-400">*</span>
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Repeat your password"
                                    className="pl-9 pr-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-sm rounded-xl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs text-rose-400 mt-1">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* System Features Checklist */}
                        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs text-slate-400">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Master Administrator Privileges will be granted</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                <span>Future registrations will be automatically locked</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Initializing System...</span>
                                </>
                            ) : (
                                <>
                                    <span>Initialize Administrator & Sign In</span>
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer copyright */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    &copy; {new Date().getFullYear()} School Management System. All rights reserved.
                </p>
            </div>
        </div>
    );
}
