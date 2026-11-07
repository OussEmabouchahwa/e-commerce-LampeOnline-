import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
const variantClasses = {
    primary: 'bg-teal text-white hover:opacity-90 active:opacity-80 disabled:opacity-40',
    secondary: 'border border-line bg-surface text-ink hover:border-teal hover:text-teal disabled:opacity-40',
    ghost: 'text-ink hover:bg-surface disabled:opacity-40',
    danger: 'bg-danger text-white hover:opacity-90 active:opacity-80 disabled:opacity-40',
};
const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-input',
    md: 'px-4 py-2 text-xs rounded-input',
    lg: 'px-6 py-3 text-sm rounded-input',
};
export const Button = forwardRef(({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    return (_jsxs("button", { ref: ref, disabled: disabled || isLoading, className: cn('inline-flex items-center justify-center gap-2 font-body font-medium transition-all duration-150 cursor-pointer select-none', variantClasses[variant], sizeClasses[size], isLoading && 'cursor-wait', className), ...props, children: [isLoading ? (_jsx("span", { className: "inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin", "aria-hidden": "true" })) : null, children] }));
});
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map