import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
const ToastContext = createContext(null);
const icons = {
    success: _jsx(CheckCircle, { size: 18, className: "text-ok flex-shrink-0" }),
    error: _jsx(AlertCircle, { size: 18, className: "text-danger flex-shrink-0" }),
    info: _jsx(Info, { size: 18, className: "text-teal flex-shrink-0" }),
};
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});
    function dismiss(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        clearTimeout(timers.current[id]);
    }
    function toast(message, type = 'success') {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
        timers.current[id] = setTimeout(() => dismiss(id), 4000);
    }
    return (_jsxs(ToastContext.Provider, { value: { toast }, children: [children, createPortal(_jsx("div", { className: "fixed bottom-6 right-6 z-[200] flex flex-col gap-2", "aria-live": "polite", "aria-label": "Notifications", children: _jsx(AnimatePresence, { children: toasts.map((t) => (_jsxs(motion.div, { initial: { opacity: 0, x: 48 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 48 }, transition: { duration: 0.2 }, className: "flex items-center gap-3 bg-surface border border-line rounded-card shadow-mid px-4 py-3 min-w-[260px] max-w-sm", children: [icons[t.type], _jsx("p", { className: "flex-1 text-xs text-ink", children: t.message }), _jsx("button", { onClick: () => dismiss(t.id), "aria-label": "Dismiss", className: "text-mute hover:text-ink", children: _jsx(X, { size: 14 }) })] }, t.id))) }) }), document.body)] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
//# sourceMappingURL=Toast.js.map