import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Card({ children, className }) {
    return (_jsx("div", { className: cn('bg-surface border border-line rounded-card shadow-low', className), children: children }));
}
//# sourceMappingURL=Card.js.map