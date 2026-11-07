import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
export function Footer() {
    return (_jsxs("footer", { className: "border-t border-line bg-surface mt-20", children: [_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8", children: [_jsxs("div", { className: "flex flex-col items-start gap-3", children: [_jsx(Logo, { size: "lg" }), _jsx("p", { className: "text-xs text-mute max-w-[200px]", children: "Showroom interactif de luminaires haut de gamme. Livraison en Tunisie." })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-heading font-bold text-ink mb-3", children: "Catalogue" }), _jsx("ul", { className: "flex flex-col gap-2", children: [
                                    { href: '/products', label: 'Tous les produits' },
                                    { href: '/products?categoryId=suspension', label: 'Suspensions' },
                                    { href: '/products?categoryId=lampadaire', label: 'Lampadaires' },
                                    { href: '/products?categoryId=table', label: 'Lampes de table' },
                                    { href: '/products?categoryId=bureau', label: 'Bureau' },
                                ].map((l) => (_jsx("li", { children: _jsx(Link, { to: l.href, className: "text-xs text-mute hover:text-ink transition-colors", children: l.label }) }, l.href))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-heading font-bold text-ink mb-3", children: "Mon compte" }), _jsx("ul", { className: "flex flex-col gap-2", children: [
                                    { href: '/account', label: 'Mes commandes' },
                                    { href: '/account/wishlist', label: 'Liste de souhaits' },
                                    { href: '/account/profile', label: 'Mon profil' },
                                ].map((l) => (_jsx("li", { children: _jsx(Link, { to: l.href, className: "text-xs text-mute hover:text-ink transition-colors", children: l.label }) }, l.href))) })] })] }), _jsx("div", { className: "border-t border-line", children: _jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2", children: [_jsxs("p", { className: "text-xs text-mute", children: ["\u00A9 ", new Date().getFullYear(), " LampeOnline \u00B7 Tunisie"] }), _jsx("p", { className: "text-xs text-mute", children: "Paiements simul\u00E9s \u2014 aucune donn\u00E9e bancaire r\u00E9elle" })] }) })] }));
}
//# sourceMappingURL=Footer.js.map