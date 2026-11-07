import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { forwardRef, useId } from 'react';
export const Input = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-xs font-medium text-ink", children: label })), _jsx("input", { ref: ref, id: inputId, "aria-describedby": error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined, "aria-invalid": error ? 'true' : undefined, className: cn('w-full px-3 py-2 text-xs bg-surface border rounded-input text-ink placeholder:text-mute', 'transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bulb', error ? 'border-danger' : 'border-line hover:border-mute', props.disabled && 'opacity-50 cursor-not-allowed', className), ...props }), error && (_jsx("p", { id: `${inputId}-error`, role: "alert", className: "text-xs text-danger", children: error })), hint && !error && (_jsx("p", { id: `${inputId}-hint`, className: "text-xs text-mute", children: hint }))] }));
});
Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map