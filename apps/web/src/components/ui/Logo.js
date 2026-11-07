import { jsx as _jsx } from "react/jsx-runtime";
const heights = {
    sm: 'h-7', // 28px — mobile nav
    md: 'h-9', // 36px — desktop nav
    lg: 'h-12', // 48px — footer / auth
};
export function Logo({ size = 'md', className = '' }) {
    return (_jsx("img", { src: "/assets/bo-creation-logo.png", alt: "BO Creation \u2014 LampeOnline", className: `${heights[size]} w-auto object-contain ${className}` }));
}
//# sourceMappingURL=Logo.js.map