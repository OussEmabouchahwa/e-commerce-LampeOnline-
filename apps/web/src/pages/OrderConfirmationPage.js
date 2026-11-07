import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';
const STATUS_STEPS = [
    { key: 'PENDING', label: 'En attente', icon: Clock },
    { key: 'PAID', label: 'Payée', icon: CheckCircle2 },
    { key: 'SHIPPED', label: 'Expédiée', icon: Truck },
    { key: 'DELIVERED', label: 'Livrée', icon: PackageCheck },
];
export default function OrderConfirmationPage() {
    const { id } = useParams();
    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', id],
        queryFn: () => api.get(`/orders/${id}`),
        enabled: !!id,
    });
    if (isLoading) {
        return (_jsx("div", { className: "max-w-content mx-auto px-4 py-20 text-center", children: _jsx("p", { className: "text-xs text-mute", children: "Chargement de votre commande..." }) }));
    }
    if (isError || !order) {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-20 text-center", children: _jsxs(Card, { className: "p-8", children: [_jsx(AlertCircle, { size: 36, className: "text-danger mx-auto mb-4" }), _jsx("h1", { className: "text-lg font-heading font-bold text-ink mb-2", children: "Commande introuvable" }), _jsx("p", { className: "text-xs text-mute mb-6", children: "Cette commande n'existe pas ou vous n'avez pas l'autorisation de la consulter." }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", size: "md", children: "Retour au catalogue" }) })] }) }));
    }
    const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
    const isCancelled = order.status === 'CANCELLED';
    return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-12", children: [_jsxs("div", { className: "text-center max-w-xl mx-auto mb-10", children: [_jsx("div", { className: "inline-flex p-3 rounded-full bg-ok/10 text-ok mb-4", children: _jsx(CheckCircle2, { size: 36 }) }), _jsx("h1", { className: "text-2xl font-heading font-bold text-ink", children: "Merci pour votre commande !" }), _jsxs("p", { className: "text-xs text-mute mt-2", children: ["Num\u00E9ro de r\u00E9f\u00E9rence : ", _jsx("span", { className: "font-mono text-ink font-semibold", children: order.id })] }), _jsxs("p", { className: "text-[11px] text-mute mt-1", children: ["Pass\u00E9e le ", formatDate(order.createdAt)] })] }), _jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider", children: "Statut d'acheminement" }), _jsx(Badge, { variant: isCancelled ? 'danger' : 'ok', children: order.status })] }), isCancelled ? (_jsx("div", { className: "p-4 rounded-card bg-danger/10 border border-danger/20 text-xs text-danger", children: "Cette commande a \u00E9t\u00E9 annul\u00E9e. Si vous avez \u00E9t\u00E9 d\u00E9bit\u00E9, le remboursement sera effectu\u00E9 sous 48 heures." })) : (_jsx("div", { className: "grid grid-cols-4 gap-2 relative", children: STATUS_STEPS.map((step, idx) => {
                                    const isPassed = idx <= currentStepIdx;
                                    const isCurrent = idx === currentStepIdx;
                                    const IconComponent = step.icon;
                                    return (_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: `w-9 h-9 rounded-full flex items-center justify-center transition-colors mb-2 ${isCurrent
                                                    ? 'bg-bulb text-ink shadow-low'
                                                    : isPassed
                                                        ? 'bg-teal text-white'
                                                        : 'bg-line text-mute'}`, children: _jsx(IconComponent, { size: 18 }) }), _jsx("span", { className: `text-[11px] font-medium ${isPassed ? 'text-ink font-semibold' : 'text-mute'}`, children: step.label })] }, step.key));
                                }) }))] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Articles command\u00E9s" }), _jsx("ul", { className: "divide-y divide-line", children: order.items.map((item) => (_jsxs("li", { className: "py-3 flex items-center justify-between gap-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-ink truncate", children: item.nameSnapshot }), _jsxs("p", { className: "text-[11px] text-mute", children: ["Quantit\u00E9 : ", item.qty] })] }), _jsx("p", { className: "text-xs font-semibold text-teal flex-shrink-0", children: formatPrice(item.priceSnapshot * item.qty) })] }, item.id))) }), _jsxs("div", { className: "flex justify-between items-center border-t border-line pt-4 mt-2", children: [_jsx("span", { className: "text-xs font-bold text-ink", children: "Total pay\u00E9" }), _jsx("span", { className: "text-sm font-bold text-teal", children: formatPrice(order.totalMillimes) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-3", children: "Adresse de livraison" }), _jsxs("div", { className: "text-xs text-mute space-y-1", children: [_jsx("p", { className: "font-semibold text-ink", children: order.shippingAddress.fullName }), _jsx("p", { children: order.shippingAddress.address }), _jsxs("p", { children: [order.shippingAddress.postalCode, " ", order.shippingAddress.city] }), _jsxs("p", { children: ["T\u00E9l : ", order.shippingAddress.phone] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-3", children: "Mode de paiement" }), _jsxs("div", { className: "text-xs text-mute space-y-1", children: [_jsx("p", { className: "font-semibold text-ink", children: order.paymentMethod === 'MOCK_CARD'
                                                    ? 'Carte bancaire (Simulée)'
                                                    : 'Paiement à la livraison' }), _jsxs("p", { children: ["Statut du r\u00E8glement : ", order.paymentStatus] }), _jsx("p", { className: "text-[11px] text-mute pt-2", children: "Livraison gratuite partout sur le territoire tunisien." })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-4 pt-4", children: [_jsx(Link, { to: "/account", children: _jsx(Button, { variant: "secondary", size: "md", className: "w-full sm:w-auto", children: "Voir toutes mes commandes" }) }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", size: "md", className: "w-full sm:w-auto", children: "Continuer mes achats" }) })] })] })] }));
}
//# sourceMappingURL=OrderConfirmationPage.js.map