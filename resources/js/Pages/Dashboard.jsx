import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ShadcnDashboardView from './Dashboard/components/ShadcnDashboardView';
import AcademicDashboardView from './Dashboard/components/AcademicDashboardView';
import CompactDashboardView from './Dashboard/components/CompactDashboardView';

export default function Dashboard({
    stats,
    recentExpenses = [],
    recentFeePayments = [],
    unpaidStudents = [],
    unpaidSummary = {},
    monthlyTrends = [],
    currentPeriod = 'all_time',
    dashboardTheme = 'shadcn',
}) {
    // Current active theme (initialized from localStorage or prop)
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('dashboard_theme') || dashboardTheme || 'shadcn';
        } catch (e) {
            return dashboardTheme || 'shadcn';
        }
    });

    useEffect(() => {
        if (dashboardTheme) {
            setTheme(dashboardTheme);
            try {
                localStorage.setItem('dashboard_theme', dashboardTheme);
            } catch (e) {}
        }
    }, [dashboardTheme]);

    useEffect(() => {
        const handleThemeChanged = (e) => {
            if (e.detail && e.detail !== theme) {
                setTheme(e.detail);
            }
        };

        window.addEventListener('dashboard-theme-changed', handleThemeChanged);
        return () => window.removeEventListener('dashboard-theme-changed', handleThemeChanged);
    }, [theme]);

    const handlePeriodChange = (periodKey) => {
        router.get(
            route('dashboard'),
            { period: periodKey },
            { preserveState: true, replace: true }
        );
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        try {
            localStorage.setItem('dashboard_theme', newTheme);
        } catch (e) {}

        // Immediately update sidebar and header styles across the layout
        window.dispatchEvent(new CustomEvent('dashboard-theme-changed', { detail: newTheme }));

        // Persist to backend database in background
        router.post(
            route('settings.update'),
            { dashboard_theme: newTheme },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['system_settings', 'dashboardTheme'],
            }
        );
    };

    const formatCurrency = (amount) => {
        return `Rs. ${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    return (
        <AppLayout title={theme === 'shadcn' ? 'Dashboard' : theme === 'compact' ? 'Executive Dashboard' : 'Academic Dashboard'}>
            <Head title="Dashboard - School Management System" />

            {theme === 'shadcn' && (
                <ShadcnDashboardView
                    stats={stats}
                    recentExpenses={recentExpenses}
                    recentFeePayments={recentFeePayments}
                    unpaidStudents={unpaidStudents}
                    unpaidSummary={unpaidSummary}
                    monthlyTrends={monthlyTrends}
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                    activeTheme={theme}
                    onThemeChange={handleThemeChange}
                    formatCurrency={formatCurrency}
                />
            )}

            {theme === 'academic' && (
                <AcademicDashboardView
                    stats={stats}
                    recentExpenses={recentExpenses}
                    recentFeePayments={recentFeePayments}
                    unpaidStudents={unpaidStudents}
                    unpaidSummary={unpaidSummary}
                    monthlyTrends={monthlyTrends}
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                    activeTheme={theme}
                    onThemeChange={handleThemeChange}
                    formatCurrency={formatCurrency}
                />
            )}

            {theme === 'compact' && (
                <CompactDashboardView
                    stats={stats}
                    recentExpenses={recentExpenses}
                    recentFeePayments={recentFeePayments}
                    unpaidStudents={unpaidStudents}
                    unpaidSummary={unpaidSummary}
                    monthlyTrends={monthlyTrends}
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                    activeTheme={theme}
                    onThemeChange={handleThemeChange}
                    formatCurrency={formatCurrency}
                />
            )}
        </AppLayout>
    );
}
