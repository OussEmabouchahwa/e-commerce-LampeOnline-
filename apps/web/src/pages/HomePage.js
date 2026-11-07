import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Truck, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/products/ProductCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { HeroLamp } from '@/components/3d/HeroLamp';
import { api } from '@/lib/api';
export default function HomePage() {
    const { data, isLoading } = useQuery({
        queryKey: ['products', 'featured'],
        queryFn: () => api.get('/products?pageSize=4&sortBy=createdAt&sortDir=desc'),
    });
    return (_jsxs("div", { children: [_jsxs("section", { className: "relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12", children: [_jsx("div", { className: "absolute inset-0 bg-bg", style: {
                            background: 'radial-gradient(ellipse 65% 65% at 50% 35%, color-mix(in srgb, var(--bulb) 9%, var(--bg)), var(--bg))',
                        }, "aria-hidden": "true" }), _jsxs("div", { className: "relative max-w-content mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: 'easeOut' }, className: "lg:col-span-6 text-center lg:text-left z-10", children: [_jsx("p", { className: "text-xs font-semibold text-bulb uppercase tracking-widest mb-3", children: "Showroom interactif de luminaires" }), _jsx("h1", { className: "font-heading font-extrabold text-2xl sm:text-3xl text-ink leading-[1.15] mb-5", children: "La lumi\u00E8re id\u00E9ale pour sublimer chaque espace" }), _jsx("p", { className: "text-xs text-mute max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed", children: "Explorez notre collection exclusive en 3D. Testez la temp\u00E9rature de couleur, modulez l'intensit\u00E9 lumineuse et commandez en ligne avec livraison partout en Tunisie." }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3", children: [_jsx(Link, { to: "/products", children: _jsxs(Button, { variant: "primary", size: "lg", className: "gap-2 w-full sm:w-auto", children: ["Explorer la collection", _jsx(ArrowRight, { size: 16 })] }) }), _jsx(Link, { to: "/products?categoryId=suspension", children: _jsx(Button, { variant: "secondary", size: "lg", className: "w-full sm:w-auto", children: "Suspensions" }) })] })] }), _jsx("div", { className: "lg:col-span-6 flex items-center justify-center relative", children: _jsx(HeroLamp, {}) })] })] }), _jsx("section", { className: "py-16 border-t border-line", children: _jsx("div", { className: "max-w-content mx-auto px-4 sm:px-6", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-8", children: [
                            {
                                icon: Zap,
                                title: 'Visualisation 3D temps réel',
                                desc: 'Manipulez la lampe à 360°, allumez-la et personnalisez la nuance de chaleur.',
                            },
                            {
                                icon: Truck,
                                title: 'Livraison express en Tunisie',
                                desc: 'Expédition soignée à domicile dans toutes les régions de Tunisie.',
                            },
                            {
                                icon: Shield,
                                title: 'Paiement flexible & sécurisé',
                                desc: 'Paiement par carte test instantané ou règlement en espèces à la livraison.',
                            },
                        ].map((f) => (_jsxs(motion.div, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, viewport: { once: true }, className: "flex flex-col items-start gap-3", children: [_jsx("div", { className: "p-3 rounded-card bg-surface border border-line", children: _jsx(f.icon, { size: 20, className: "text-teal" }) }), _jsx("h3", { className: "text-xs font-heading font-bold text-ink", children: f.title }), _jsx("p", { className: "text-xs text-mute", children: f.desc })] }, f.title))) }) }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-heading font-bold text-ink", children: "Nouveaut\u00E9s phares" }), _jsx("p", { className: "text-xs text-mute", children: "Nos cr\u00E9ations et luminaires les plus r\u00E9cents" })] }), _jsxs(Link, { to: "/products", className: "text-xs text-teal hover:underline flex items-center gap-1 font-semibold", children: ["Voir tout le catalogue ", _jsx(ArrowRight, { size: 14 })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: isLoading
                                ? Array.from({ length: 4 }).map((_, i) => _jsx(SkeletonCard, {}, i))
                                : data?.data.map((p) => _jsx(ProductCard, { product: p }, p.id)) })] }) }), _jsx("section", { className: "py-20 border-t border-line bg-surface/30", children: _jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 text-center", children: [_jsx("h2", { className: "text-lg font-heading font-bold text-ink mb-3", children: "Envie d'illuminer votre int\u00E9rieur ?" }), _jsx("p", { className: "text-xs text-mute mb-8 max-w-md mx-auto", children: "Cr\u00E9ez votre compte en quelques secondes pour enregistrer vos coups de c\u0153ur et suivre vos commandes." }), _jsx(Link, { to: "/auth/register", children: _jsx(Button, { variant: "primary", size: "lg", children: "Cr\u00E9er un compte client" }) })] }) })] }));
}
//# sourceMappingURL=HomePage.js.map