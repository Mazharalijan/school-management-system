import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Global event bus for imperative toast calls
const TOAST_EVENT = 'app-toast-event';

export const toast = {
    success: (message, options = {}) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent(TOAST_EVENT, {
                    detail: { type: 'success', message, ...options },
                })
            );
        }
    },
    error: (message, options = {}) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent(TOAST_EVENT, {
                    detail: { type: 'error', message, ...options },
                })
            );
        }
    },
    info: (message, options = {}) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent(TOAST_EVENT, {
                    detail: { type: 'info', message, ...options },
                })
            );
        }
    },
};

export default function ToastContainer() {
    const { props } = usePage();
    const flash = props.flash || {};
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message, duration = 4000) => {
        if (!message) return;
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Listen to Inertia flash updates
    useEffect(() => {
        if (flash.success) {
            addToast('success', flash.success);
        }
        if (flash.error) {
            addToast('error', flash.error);
        }
        if (flash.message) {
            addToast('info', flash.message);
        }
        if (flash.status) {
            addToast('info', flash.status);
        }
    }, [flash.success, flash.error, flash.message, flash.status]);

    // Listen to custom imperatively triggered toasts
    useEffect(() => {
        const handleToastEvent = (e) => {
            const { type = 'info', message, duration = 4000 } = e.detail || {};
            addToast(type, message, duration);
        };

        window.addEventListener(TOAST_EVENT, handleToastEvent);
        return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            className="fixed bottom-5 left-5 md:left-72 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print"
        >
            {toasts.map((t) => {
                const isSuccess = t.type === 'success';
                const isError = t.type === 'error';

                return (
                    <div
                        key={t.id}
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3',
                            'bg-card/95 text-card-foreground border-border',
                            isSuccess && 'border-emerald-500/30 dark:border-emerald-500/20 bg-card/98',
                            isError && 'border-destructive/30 bg-card/98'
                        )}
                    >
                        <div className="shrink-0 mt-0.5">
                            {isSuccess ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : isError ? (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                            ) : (
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-snug break-words">
                                {t.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeToast(t.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 -mr-1 rounded-md"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
