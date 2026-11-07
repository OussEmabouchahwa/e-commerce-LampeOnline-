import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
export function Drawer({ open, onClose, title, children, side = 'right', className }) {
    const overlayRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    return createPortal(_jsx(AnimatePresence, { children: open && (_jsxs(motion.div, { ref: overlayRef, className: "fixed inset-0 z-50 flex", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, onClick: (e) => { if (e.target === overlayRef.current)
                onClose(); }, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'drawer-title' : undefined, children: [_jsx("div", { className: "absolute inset-0 bg-ink/60 backdrop-blur-sm", "aria-hidden": "true" }), _jsxs(motion.div, { className: cn('relative z-10 flex flex-col bg-surface shadow-mid', 'w-full max-w-sm', side === 'right' ? 'ml-auto' : 'mr-auto', className), initial: { x: side === 'right' ? '100%' : '-100%' }, animate: { x: 0 }, exit: { x: side === 'right' ? '100%' : '-100%' }, transition: { duration: 0.25, ease: 'easeOut' }, children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-line flex-shrink-0", children: [title && (_jsx("h2", { id: "drawer-title", className: "text-sm font-heading font-bold text-ink", children: title })), _jsx("button", { onClick: onClose, className: "ml-auto p-1 rounded hover:bg-line transition-colors", "aria-label": "Close", children: _jsx(X, { size: 18, className: "text-mute" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: children })] })] })) }), document.body);
}
//# sourceMappingURL=Drawer.js.map