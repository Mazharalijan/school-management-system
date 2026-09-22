import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'sm:max-w-xl',
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto`}>
                {title && (
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
                    </DialogHeader>
                )}
                <div className="pt-2">{children}</div>
                {footer && <DialogFooter className="pt-4 border-t mt-4">{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}