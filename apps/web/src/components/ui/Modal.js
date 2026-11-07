import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
export function Modal({ open, onClose, title, children, className, size = 'md' }) {
    const overlayRef = useRef(null);
    // Close on Escape
    useEffect(() => {
        if (!open)
            return;
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);
    // Lock scroll
    useEffect(() => {
        if (open)
            document.body.style.overflow = 'hidden';
        else
            document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    return createPortal(_jsx(AnimatePresence, { children: open && (_jsxs(motion.div, { ref: overlayRef, className: "fixed inset-0 z-50 flex items-center justify-center p-4", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, onClick: (e) => { if (e.target === overlayRef.current)
                onClose(); }, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, children: [_jsx("div", { className: "absolute inset-0 bg-ink/60 backdrop-blur-sm", "aria-hidden": "true" }), _jsxs(motion.div, { className: cn('relative z-10 w-full bg-surface rounded-modal shadow-mid', sizes[size], className), initial: { scale: 0.95, y: 8, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 }, exit: { scale: 0.95, y: 8, opacity: 0 }, transition: { duration: 0.2, ease: 'easeOut' }, children: [title && (_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-line", children: [_jsx("h2", { id: "modal-title", className: "text-sm font-heading font-bold text-ink", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded hover:bg-line transition-colors", "aria-label": "Close", children: _jsx(X, { size: 18, className: "text-mute" }) })] })), !title && (_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 p-1 rounded hover:bg-line transition-colors z-10", "aria-label": "Close", children: _jsx(X, { size: 18, className: "text-mute" }) })), _jsx("div", { className: "p-6", children: children })] })] })) }), document.body);
}
//# sourceMappingURL=Modal.js.map