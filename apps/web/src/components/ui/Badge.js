import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
const variants = {
    default: 'bg-line text-ink',
    ok: 'bg-ok/20 text-ok',
    danger: 'bg-danger/20 text-danger',
    bulb: 'bg-bulb/20 text-bulb',
    mute: 'bg-line text-mute',
};
export function Badge({ children, variant = 'default', className }) {
    return (_jsx("span", { className: cn('inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium', variants[variant], className), children: children }));
}
//# sourceMappingURL=Badge.js.map