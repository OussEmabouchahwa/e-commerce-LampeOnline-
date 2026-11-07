import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema, ChangePasswordSchema, } from '@lampe/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { User, ShoppingBag, Heart, KeyRound, LogOut, ExternalLink, Trash2, ShoppingCart, } from 'lucide-react';
export default function AccountPage() {
    const { user, logout } = useAuth();
    const { addItem } = useCart();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = tabParam && ['overview', 'orders', 'wishlist', 'profile'].includes(tabParam)
        ? tabParam
        : 'overview';
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };
    // Orders Query
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => api.get('/orders?pageSize=10'),
        enabled: !!user,
    });
    // Wishlist Query
    const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
        queryKey: ['my-wishlist'],
        queryFn: () => api.get('/wishlist'),
        enabled: !!user,
    });
    // Remove Wishlist Mutation
    const removeWishlistMutation = useMutation({
        mutationFn: (productId) => api.delete(`/wishlist/${productId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
            toast('Retiré de la liste de souhaits', 'info');
        },
    });
    // Profile Update Form
    const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: profileSubmitting }, } = useForm({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            name: user?.name ?? '',
            phone: user?.phone ?? '',
        },
    });
    const onUpdateProfile = async (data) => {
        try {
            await api.patch('/users/me', data);
            toast('Profil mis à jour', 'success');
        }
        catch (err) {
            if (err instanceof ApiError)
                toast(err.message, 'error');
        }
    };
    // Password Change Form
    const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }, } = useForm({
        resolver: zodResolver(ChangePasswordSchema),
    });
    const onChangePassword = async (data) => {
        try {
            await api.post('/users/me/password', data);
            toast('Mot de passe modifié avec succès', 'success');
            resetPasswordForm();
        }
        catch (err) {
            if (err instanceof ApiError)
                toast(err.message, 'error');
        }
    };
    const handleLogout = async () => {
        await logout();
        toast('Déconnexion réussie', 'info');
        navigate('/');
    };
    if (!user) {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-20 text-center", children: _jsxs(Card, { className: "p-8", children: [_jsx("p", { className: "text-xs text-mute mb-4", children: "Veuillez vous connecter pour voir votre compte." }), _jsx(Link, { to: "/auth/login", children: _jsx(Button, { variant: "primary", size: "md", children: "Se connecter" }) })] }) }));
    }
    const latestOrder = ordersData?.data[0];
    return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-10", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-heading font-bold text-ink", children: "Mon espace client" }), _jsxs("p", { className: "text-xs text-mute mt-1", children: ["Bonjour, ", _jsx("span", { className: "font-semibold text-ink", children: user.name }), " (", user.email, ")"] })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: handleLogout, className: "text-danger self-start", children: [_jsx(LogOut, { size: 16 }), " D\u00E9connexion"] })] }), _jsx("div", { className: "flex gap-2 border-b border-line pb-px mb-8 overflow-x-auto", children: [
                    { key: 'overview', label: 'Vue d’ensemble', icon: User },
                    { key: 'orders', label: `Commandes (${ordersData?.total ?? 0})`, icon: ShoppingBag },
                    { key: 'wishlist', label: `Coups de cœur (${wishlistData?.length ?? 0})`, icon: Heart },
                    { key: 'profile', label: 'Paramètres du compte', icon: KeyRound },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (_jsxs("button", { onClick: () => setActiveTab(tab.key), className: `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-input border-b-2 transition-colors whitespace-nowrap ${isActive
                            ? 'border-teal text-teal bg-surface'
                            : 'border-transparent text-mute hover:text-ink'}`, children: [_jsx(Icon, { size: 16 }), tab.label] }, tab.key));
                }) }), _jsxs("div", { children: [activeTab === 'overview' && (_jsx("div", { className: "space-y-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider", children: "Derni\u00E8re commande" }), latestOrder && (_jsxs(Link, { to: `/orders/${latestOrder.id}`, className: "text-xs text-teal hover:underline flex items-center gap-1", children: ["D\u00E9tails ", _jsx(ExternalLink, { size: 12 })] }))] }), ordersLoading ? (_jsx(SkeletonList, { count: 1 })) : latestOrder ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center text-xs", children: [_jsx("span", { className: "font-mono text-mute", children: latestOrder.id }), _jsx(Badge, { children: latestOrder.status })] }), _jsxs("p", { className: "text-xs text-mute", children: ["Pass\u00E9e le ", formatDate(latestOrder.createdAt)] }), _jsxs("div", { className: "pt-2 border-t border-line flex justify-between items-center text-xs", children: [_jsxs("span", { children: [latestOrder.items.length, " article(s)"] }), _jsx("span", { className: "font-bold text-teal", children: formatPrice(latestOrder.totalMillimes) })] })] })) : (_jsx("p", { className: "text-xs text-mute", children: "Aucune commande pour le moment." }))] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider", children: "Vos coups de c\u0153ur" }), _jsx("button", { onClick: () => setActiveTab('wishlist'), className: "text-xs text-teal hover:underline", children: "Voir tout" })] }), wishlistLoading ? (_jsx(SkeletonList, { count: 2 })) : wishlistData && wishlistData.length > 0 ? (_jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: wishlistData.slice(0, 4).map((item) => (_jsx(Link, { to: `/products/${item.product.slug}`, className: "group flex-shrink-0", children: _jsx("img", { src: item.product.images[0] ?? '', alt: item.product.name, className: "w-16 h-16 rounded-input object-cover border border-line group-hover:border-teal transition-colors" }) }, item.productId))) })) : (_jsx("p", { className: "text-xs text-mute", children: "Votre liste de souhaits est vide." }))] })] }) })), activeTab === 'orders' && (_jsx("div", { className: "space-y-4", children: ordersLoading ? (_jsx(SkeletonList, { count: 4 })) : ordersData && ordersData.data.length > 0 ? (_jsx("div", { className: "space-y-4", children: ordersData.data.map((order) => (_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-line mb-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "font-mono text-xs text-ink font-semibold", children: ["Commande #", order.id] }), _jsx("p", { className: "text-[11px] text-mute", children: formatDate(order.createdAt) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { children: order.status }), _jsx(Link, { to: `/orders/${order.id}`, children: _jsx(Button, { variant: "secondary", size: "sm", children: "Suivi & D\u00E9tails" }) })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-ink", children: order.items.map((i) => i.nameSnapshot).join(', ') }), _jsxs("p", { className: "text-mute text-[11px] mt-0.5", children: ["Mode de paiement :", ' ', order.paymentMethod === 'MOCK_CARD' ? 'Carte bancaire' : 'Espèces à la livraison'] })] }), _jsx("div", { className: "text-right flex-shrink-0", children: _jsx("p", { className: "text-sm font-bold text-teal", children: formatPrice(order.totalMillimes) }) })] })] }, order.id))) })) : (_jsxs(Card, { className: "p-12 text-center", children: [_jsx(ShoppingBag, { size: 36, className: "text-line mx-auto mb-3" }), _jsx("p", { className: "text-xs text-mute mb-4", children: "Vous n'avez pas encore pass\u00E9 de commande." }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", size: "sm", children: "D\u00E9couvrir le catalogue" }) })] })) })), activeTab === 'wishlist' && (_jsx("div", { children: wishlistLoading ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 3 }).map((_, i) => (_jsx(SkeletonCard, {}, i))) })) : wishlistData && wishlistData.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: wishlistData.map((item) => (_jsxs(Card, { className: "overflow-hidden flex flex-col justify-between group", children: [_jsxs(Link, { to: `/products/${item.product.slug}`, className: "block", children: [_jsx("div", { className: "relative aspect-[4/3] overflow-hidden bg-bg", children: _jsx("img", { src: item.product.images[0] ?? '', alt: item.product.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" }) }), _jsxs("div", { className: "p-4", children: [_jsx("p", { className: "text-[11px] text-mute mb-1", children: item.product.category?.name ?? 'Luminaire' }), _jsx("h3", { className: "text-xs font-bold text-ink mb-1 truncate group-hover:text-teal transition-colors", children: item.product.name }), _jsx("p", { className: "text-xs font-bold text-teal", children: formatPrice(item.product.priceMillimes) })] })] }), _jsxs("div", { className: "p-4 pt-0 flex gap-2", children: [_jsxs(Button, { variant: "primary", size: "sm", className: "flex-1 gap-1", onClick: () => {
                                                    addItem({
                                                        productId: item.product.id,
                                                        qty: 1,
                                                        name: item.product.name,
                                                        priceMillimes: item.product.priceMillimes,
                                                        image: item.product.images[0] ?? '',
                                                        slug: item.product.slug,
                                                    });
                                                    toast(`Ajouté au panier`, 'success');
                                                }, children: [_jsx(ShoppingCart, { size: 14 }), " Ajouter au panier"] }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-danger hover:bg-danger/10", onClick: () => removeWishlistMutation.mutate(item.productId), "aria-label": "Supprimer de la liste", title: "Retirer des coups de c\u0153ur", children: _jsx(Trash2, { size: 16 }) })] })] }, item.productId))) })) : (_jsxs(Card, { className: "p-12 text-center", children: [_jsx(Heart, { size: 36, className: "text-line mx-auto mb-3" }), _jsx("p", { className: "text-xs text-mute mb-4", children: "Votre liste de souhaits est vide." }), _jsx(Link, { to: "/products", children: _jsx(Button, { variant: "primary", size: "sm", children: "Explorer les produits" }) })] })) })), activeTab === 'profile' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Informations personnelles" }), _jsxs("form", { onSubmit: handleProfileSubmit(onUpdateProfile), className: "space-y-4", children: [_jsx(Input, { label: "Nom complet", error: profileErrors.name?.message, ...regProfile('name') }), _jsx(Input, { label: "Num\u00E9ro de t\u00E9l\u00E9phone", type: "tel", placeholder: "+216 -- --- ---", error: profileErrors.phone?.message, ...regProfile('phone') }), _jsx(Button, { type: "submit", variant: "primary", size: "sm", isLoading: profileSubmitting, children: "Enregistrer les modifications" })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Modifier le mot de passe" }), _jsxs("form", { onSubmit: handlePasswordSubmit(onChangePassword), className: "space-y-4", children: [_jsx(Input, { label: "Mot de passe actuel", type: "password", error: passwordErrors.currentPassword?.message, ...regPassword('currentPassword') }), _jsx(Input, { label: "Nouveau mot de passe", type: "password", error: passwordErrors.newPassword?.message, ...regPassword('newPassword') }), _jsx(Input, { label: "Confirmer le nouveau mot de passe", type: "password", error: passwordErrors.confirmPassword?.message, ...regPassword('confirmPassword') }), _jsx(Button, { type: "submit", variant: "secondary", size: "sm", isLoading: passwordSubmitting, children: "Mettre \u00E0 jour le mot de passe" })] })] })] }))] })] }));
}
//# sourceMappingURL=AccountPage.js.map