import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, } from '@lampe/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { ShieldAlert, CreditCard, Banknote } from 'lucide-react';
const CheckoutFormSchema = z.object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    phone: z.string().min(8, 'Numéro de téléphone invalide'),
    address: z.string().min(5, 'Adresse complète requise'),
    city: z.string().min(2, 'Ville requise'),
    postalCode: z.string().min(4, 'Code postal requis'),
    paymentMethod: PaymentMethod,
    mockCardNumber: z.string().optional(),
});
export default function CheckoutPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { items, totalMillimes, clearCart } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [idempotencyKey] = useState(() => uuidv4());
    const { register, handleSubmit, watch, setValue, formState: { errors }, } = useForm({
        resolver: zodResolver(CheckoutFormSchema),
        defaultValues: {
            fullName: user?.name ?? '',
            phone: user?.phone ?? '',
            paymentMethod: 'MOCK_CARD',
            mockCardNumber: '4242 4242 4242 4242',
        },
    });
    const selectedPaymentMethod = watch('paymentMethod');
    if (authLoading) {
        return (_jsx("div", { className: "max-w-content mx-auto px-4 py-20 text-center", children: _jsx("p", { className: "text-sm text-mute", children: "Chargement de votre session..." }) }));
    }
    // Visitor-to-client purchase gate:
    if (!user) {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-20 text-center", children: _jsxs(Card, { className: "p-8", children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink mb-2", children: "Connexion requise" }), _jsx("p", { className: "text-xs text-mute mb-6", children: "Pour finaliser votre commande, veuillez vous connecter ou cr\u00E9er un compte client. Votre panier sera conserv\u00E9." }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(Link, { to: "/auth/login", state: { returnTo: '/checkout' }, children: _jsx(Button, { variant: "primary", size: "md", className: "w-full", children: "Se connecter" }) }), _jsx(Link, { to: "/auth/register", state: { returnTo: '/checkout' }, children: _jsx(Button, { variant: "secondary", size: "md", className: "w-full", children: "Cr\u00E9er un compte" }) })] })] }) }));
    }
    if (items.length === 0) {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-20 text-center", children: _jsxs(Card, { className: "p-8", children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink mb-2", children: "Votre panier est vide" }), _jsx("p", { className: "text-xs text-mute mb-6", children: "Ajoutez des luminaires \u00E0 votre panier avant de proc\u00E9der au paiement." }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", size: "md", children: "D\u00E9couvrir le catalogue" }) })] }) }));
    }
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            // First ensure cart is synced to server before placing order
            await api.post('/cart/merge', items.map((i) => ({ productId: i.productId, qty: i.qty })));
            const payload = {
                shippingAddress: {
                    fullName: data.fullName,
                    phone: data.phone,
                    address: data.address,
                    city: data.city,
                    postalCode: data.postalCode,
                },
                paymentMethod: data.paymentMethod,
                idempotencyKey,
                mockCardNumber: data.paymentMethod === 'MOCK_CARD' ? data.mockCardNumber : undefined,
            };
            const order = await api.post('/orders', payload);
            clearCart();
            toast('Commande passée avec succès !', 'success');
            navigate(`/orders/${order.id}`, { replace: true });
        }
        catch (err) {
            if (err instanceof ApiError) {
                setErrorMessage(err.message);
            }
            else {
                setErrorMessage('Une erreur est survenue lors du paiement.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-10", children: [_jsx("h1", { className: "text-2xl font-heading font-bold text-ink mb-8", children: "Finaliser la commande" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsx("div", { className: "lg:col-span-7", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-8", children: [errorMessage && (_jsxs("div", { role: "alert", className: "p-4 rounded-card bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-3", children: [_jsx(ShieldAlert, { size: 18, className: "flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Paiement refus\u00E9 ou erreur :" }), _jsx("p", { children: errorMessage })] })] })), _jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-sm font-heading font-bold text-ink mb-4 flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs", children: "1" }), "Adresse de livraison en Tunisie"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Nom complet du destinataire", error: errors.fullName?.message, ...register('fullName') }), _jsx(Input, { label: "Num\u00E9ro de t\u00E9l\u00E9phone", type: "tel", placeholder: "+216 -- --- ---", error: errors.phone?.message, ...register('phone') }), _jsx(Input, { label: "Adresse de livraison", placeholder: "Rue, appartement, \u00E9tage...", error: errors.address?.message, ...register('address') }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Ville / Gouvernorat", error: errors.city?.message, ...register('city') }), _jsx(Input, { label: "Code postal", placeholder: "1001", error: errors.postalCode?.message, ...register('postalCode') })] })] })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-sm font-heading font-bold text-ink mb-4 flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs", children: "2" }), "Mode de r\u00E8glement"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("label", { className: `flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all ${selectedPaymentMethod === 'MOCK_CARD'
                                                                ? 'border-teal bg-teal/5'
                                                                : 'border-line hover:border-mute'}`, children: [_jsx("input", { type: "radio", value: "MOCK_CARD", className: "sr-only", ...register('paymentMethod') }), _jsx(CreditCard, { size: 20, className: selectedPaymentMethod === 'MOCK_CARD' ? 'text-teal' : 'text-mute' }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-xs font-semibold text-ink", children: "Carte bancaire (Simul\u00E9e)" }), _jsx("p", { className: "text-[11px] text-mute", children: "Test de paiement imm\u00E9diat" })] })] }), _jsxs("label", { className: `flex items-center gap-3 p-4 rounded-card border cursor-pointer transition-all ${selectedPaymentMethod === 'CASH_ON_DELIVERY'
                                                                ? 'border-teal bg-teal/5'
                                                                : 'border-line hover:border-mute'}`, children: [_jsx("input", { type: "radio", value: "CASH_ON_DELIVERY", className: "sr-only", ...register('paymentMethod') }), _jsx(Banknote, { size: 20, className: selectedPaymentMethod === 'CASH_ON_DELIVERY' ? 'text-teal' : 'text-mute' }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-xs font-semibold text-ink", children: "Paiement \u00E0 la livraison" }), _jsx("p", { className: "text-[11px] text-mute", children: "R\u00E8glement en esp\u00E8ces" })] })] })] }), selectedPaymentMethod === 'MOCK_CARD' && (_jsxs("div", { className: "p-4 rounded-card bg-surface border border-line space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-semibold text-ink flex items-center gap-1.5", children: [_jsx(CreditCard, { size: 15, className: "text-bulb" }), " Formulaire de test"] }), _jsx("span", { className: "px-2 py-0.5 rounded-pill bg-bulb/20 text-bulb text-[10px] font-bold uppercase tracking-wider", children: "Simul\u00E9" })] }), _jsx("p", { className: "text-[11px] text-mute", children: "Aucune carte r\u00E9elle requise. Utilisez l'un des num\u00E9ros de test :" }), _jsxs("div", { className: "flex flex-wrap gap-2 text-[11px]", children: [_jsx("button", { type: "button", onClick: () => setValue('mockCardNumber', '4242 4242 4242 4242'), className: "px-2 py-1 rounded bg-line/50 hover:bg-line text-ink transition-colors font-mono", children: "4242... (Succ\u00E8s)" }), _jsx("button", { type: "button", onClick: () => setValue('mockCardNumber', '4000 0000 0000 0002'), className: "px-2 py-1 rounded bg-line/50 hover:bg-line text-danger transition-colors font-mono", children: "4000...02 (Refus)" }), _jsx("button", { type: "button", onClick: () => setValue('mockCardNumber', '4000 0000 0000 3220'), className: "px-2 py-1 rounded bg-line/50 hover:bg-line text-bulb transition-colors font-mono", children: "4000...20 (V\u00E9rif 3s)" })] }), _jsx(Input, { label: "Num\u00E9ro de carte de test", placeholder: "4242 4242 4242 4242", className: "font-mono", error: errors.mockCardNumber?.message, ...register('mockCardNumber') })] }))] })] }), _jsxs(Button, { type: "submit", variant: "primary", size: "lg", className: "w-full text-sm", isLoading: isSubmitting, children: ["Confirmer et payer ", formatPrice(totalMillimes)] })] }) }), _jsx("div", { className: "lg:col-span-5", children: _jsxs(Card, { className: "p-6 sticky top-24", children: [_jsx("h2", { className: "text-sm font-heading font-bold text-ink mb-4", children: "R\u00E9capitulatif de commande" }), _jsx("ul", { className: "divide-y divide-line mb-6 max-h-72 overflow-y-auto pr-1", children: items.map((item) => (_jsxs("li", { className: "py-3 flex items-center gap-3", children: [_jsx("img", { src: item.image, alt: item.name, className: "w-12 h-12 object-cover rounded-input bg-line flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-ink truncate", children: item.name }), _jsxs("p", { className: "text-[11px] text-mute", children: ["Qt\u00E9 : ", item.qty] })] }), _jsx("p", { className: "text-xs font-semibold text-teal flex-shrink-0", children: formatPrice(item.priceMillimes * item.qty) })] }, item.productId))) }), _jsxs("div", { className: "space-y-2 border-t border-line pt-4 text-xs", children: [_jsxs("div", { className: "flex justify-between text-mute", children: [_jsx("span", { children: "Sous-total" }), _jsx("span", { children: formatPrice(totalMillimes) })] }), _jsxs("div", { className: "flex justify-between text-mute", children: [_jsx("span", { children: "Livraison en Tunisie" }), _jsx("span", { className: "text-ok font-medium", children: "Gratuite" })] }), _jsxs("div", { className: "flex justify-between text-ink font-bold text-sm pt-2 border-t border-line", children: [_jsx("span", { children: "Total TTC" }), _jsx("span", { className: "text-teal", children: formatPrice(totalMillimes) })] })] })] }) })] })] }));
}
//# sourceMappingURL=CheckoutPage.js.map