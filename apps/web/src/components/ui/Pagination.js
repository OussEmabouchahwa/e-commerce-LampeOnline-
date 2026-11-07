import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
export function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1)
        return null;
    const pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++)
            pages.push(i);
    }
    else {
        pages.push(1);
        if (page > 3)
            pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
            pages.push(i);
        if (page < totalPages - 2)
            pages.push('...');
        pages.push(totalPages);
    }
    return (_jsxs("nav", { className: "flex items-center gap-1", "aria-label": "Pagination", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(page - 1), disabled: page === 1, "aria-label": "Previous page", children: _jsx(ChevronLeft, { size: 16 }) }), pages.map((p, i) => p === '...' ? (_jsx("span", { className: "px-2 text-mute text-xs", children: "\u2026" }, `ellipsis-${i}`)) : (_jsx(Button, { variant: p === page ? 'primary' : 'ghost', size: "sm", onClick: () => onPageChange(p), "aria-current": p === page ? 'page' : undefined, children: p }, p))), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(page + 1), disabled: page === totalPages, "aria-label": "Next page", children: _jsx(ChevronRight, { size: 16 }) })] }));
}
//# sourceMappingURL=Pagination.js.map