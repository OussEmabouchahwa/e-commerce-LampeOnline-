import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Skeleton({ className }) {
    return (_jsx("div", { className: cn('animate-pulse rounded bg-line', className), "aria-hidden": "true" }));
}
export function SkeletonCard() {
    return (_jsxs("div", { className: "bg-surface border border-line rounded-card p-4 space-y-3", children: [_jsx(Skeleton, { className: "h-48 w-full rounded-input" }), _jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-8 w-full" })] }));
}
export function SkeletonList({ count = 5 }) {
    return (_jsx("div", { className: "space-y-3", children: Array.from({ length: count }).map((_, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Skeleton, { className: "h-12 w-12 rounded-input flex-shrink-0" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-3 w-2/3" })] })] }, i))) }));
}
//# sourceMappingURL=Skeleton.js.map