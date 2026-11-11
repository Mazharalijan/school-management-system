import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('system');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'system';
        setTheme(storedTheme);
        applyTheme(storedTheme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
                applyTheme('system');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

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
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={`h-9 w-9 p-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs ${className}`}
            title={`Current theme: ${theme.toUpperCase()} (Click to change)`}
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
