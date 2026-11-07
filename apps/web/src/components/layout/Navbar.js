import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
export function Navbar({ onCartOpen, isDark, onThemeToggle }) {
    const { user } = useAuth();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navLinks = [
        { href: '/products', label: 'Catalogue' },
        { href: '/products?categoryId=suspension', label: 'Suspensions' },
        { href: '/products?categoryId=lampadaire', label: 'Lampadaires' },
    ];
    return (_jsxs("header", { className: "sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-line", children: [_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4", children: [_jsxs(Link, { to: "/", "aria-label": "Go to homepage", className: "flex-shrink-0", children: [_jsx(Logo, { size: "md", className: "hidden sm:block" }), _jsx(Logo, { size: "sm", className: "sm:hidden" })] }), _jsx("nav", { className: "hidden md:flex items-center gap-6", "aria-label": "Main navigation", children: navLinks.map((l) => (_jsx(Link, { to: l.href, className: "text-xs font-medium text-mute hover:text-ink transition-colors", children: l.label }, l.href))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: onThemeToggle, className: "p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink", "aria-label": isDark ? 'Switch to light mode' : 'Switch to dark mode', children: isDark ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }), _jsxs("button", { onClick: onCartOpen, className: "relative p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink", "aria-label": `Cart, ${totalItems} items`, children: [_jsx(ShoppingCart, { size: 20 }), totalItems > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-bulb text-ink text-[10px] font-bold flex items-center justify-center", children: totalItems > 99 ? '99+' : totalItems }))] }), user ? (_jsxs("div", { className: "flex items-center gap-2", children: [user.role === 'ADMIN' && (_jsx(Link, { to: "/admin", children: _jsx(Button, { variant: "secondary", size: "sm", children: "Admin" }) })), _jsx(Link, { to: "/account", children: _jsx("button", { className: "p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink", "aria-label": "Account", children: user.avatarUrl ? (_jsx("img", { src: user.avatarUrl, alt: user.name, className: "h-7 w-7 rounded-full object-cover" })) : (_jsx(User, { size: 20 })) }) })] })) : (_jsx(Link, { to: "/auth/login", children: _jsx(Button, { variant: "primary", size: "sm", children: "Sign in" }) })), _jsx("button", { className: "md:hidden p-2 rounded hover:bg-line transition-colors text-mute", onClick: () => setMobileOpen(!mobileOpen), "aria-label": "Toggle menu", "aria-expanded": mobileOpen, children: mobileOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) })] })] }), mobileOpen && (_jsx("div", { className: "md:hidden border-t border-line bg-surface", children: _jsx("nav", { className: "flex flex-col p-4 gap-3", "aria-label": "Mobile navigation", children: navLinks.map((l) => (_jsx(Link, { to: l.href, className: "text-xs font-medium text-ink py-2 border-b border-line last:border-0", onClick: () => setMobileOpen(false), children: l.label }, l.href))) }) }))] }));
}
//# sourceMappingURL=Navbar.js.map