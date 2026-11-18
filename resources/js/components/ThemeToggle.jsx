import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className = '' }) {
    const { props } = usePage();
    const systemSettingTheme = props.system_settings?.theme_mode;

    const [theme, setTheme] = useState('system');
    const [isDark, setIsDark] = useState(false);

    const applyTheme = (targetTheme) => {
        const root = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dark = targetTheme === 'dark' || (targetTheme === 'system' && prefersDark);

        if (dark) {
            root.classList.add('dark');
            setIsDark(true);
        } else {
            root.classList.remove('dark');
            setIsDark(false);
        }
    };

    useEffect(() => {
        let initial = 'system';
        try {
            initial = localStorage.getItem('theme') || systemSettingTheme || 'system';
        } catch (e) {
            initial = systemSettingTheme || 'system';
        }

        setTheme(initial);
        applyTheme(initial);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = () => {
            const current = localStorage.getItem('theme') || 'system';
            if (current === 'system') {
                applyTheme('system');
            }
        };

        const handleCustomThemeEvent = (e) => {
            const newMode = e.detail || 'system';
            setTheme(newMode);
            applyTheme(newMode);
        };

        mediaQuery.addEventListener('change', handleMediaChange);
        window.addEventListener('theme-changed', handleCustomThemeEvent);

        return () => {
            mediaQuery.removeEventListener('change', handleMediaChange);
            window.removeEventListener('theme-changed', handleCustomThemeEvent);
        };
    }, [systemSettingTheme]);

    const toggleTheme = () => {
        let nextTheme;
        if (theme === 'light') {
            nextTheme = 'dark';
        } else if (theme === 'dark') {
            nextTheme = 'system';
        } else {
            nextTheme = 'light';
        }

        setTheme(nextTheme);
        try {
            localStorage.setItem('theme', nextTheme);
        } catch (e) {}
        applyTheme(nextTheme);
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: nextTheme }));
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={`h-9 w-9 p-0 rounded-xs border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs ${className}`}
            title={`Theme Mode: ${theme.toUpperCase()} (Click to toggle)`}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-indigo-400 transition-transform duration-200 rotate-0 scale-100" />
            ) : theme === 'light' ? (
                <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 rotate-0 scale-100" />
            ) : (
                <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200" />
            )}
        </Button>
    );
}
