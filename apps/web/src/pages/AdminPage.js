import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProductSchema, } from '@lampe/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Logo } from '@/components/ui/Logo';
import { SkeletonList } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { formatPrice, formatDate, pctChange } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, AlertTriangle, Download, Plus, Edit2, Trash2, Lock, Unlock, ArrowUpRight, ArrowDownRight, ArrowLeft, } from 'lucide-react';
export default function AdminPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [section, setSection] = useState('dashboard');
    const [rangeDays, setRangeDays] = useState('30');
    const [productDrawerOpen, setProductDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    // Auth guard: must be ADMIN
    if (!user || user.role !== 'ADMIN') {
        return (_jsx("div", { className: "max-w-md mx-auto px-4 py-20 text-center", children: _jsxs(Card, { className: "p-8", children: [_jsx("p", { className: "text-xs text-danger mb-4", children: "Acc\u00E8s r\u00E9serv\u00E9 aux administrateurs." }), _jsx(Link, { to: "/", children: _jsx(Button, { variant: "secondary", size: "md", children: "Retour \u00E0 l'accueil" }) })] }) }));
    }
    // Stats query
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats', rangeDays],
        queryFn: () => api.get(`/analytics/stats?range=${rangeDays}`),
        enabled: section === 'dashboard',
    });
    // Products query
    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => api.get('/products/admin/list?pageSize=50'),
        enabled: section === 'products',
    });
    // Categories query
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/products/categories'),
    });
    // Orders query
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => api.get('/orders/all?pageSize=50'),
        enabled: section === 'orders',
    });
    // Clients query
    const { data: clientsData, isLoading: clientsLoading } = useQuery({
        queryKey: ['admin-clients'],
        queryFn: () => api.get('/users?pageSize=50'),
        enabled: section === 'clients',
    });
    // Product mutations
    const deleteProductMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast('Produit archivé', 'info');
        },
    });
    // Order status mutation
    const updateOrderStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => api.patch(`/orders/${orderId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast('Statut de commande mis à jour', 'success');
        },
        onError: (err) => toast(err.message, 'error'),
    });
    // Client status mutation
    const updateClientStatusMutation = useMutation({
        mutationFn: ({ clientId, status }) => api.patch(`/users/${clientId}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
            toast('Statut client mis à jour', 'success');
        },
        onError: (err) => toast(err.message, 'error'),
    });
    // Export CSV
    const handleExportCsv = () => {
        window.open('/api/orders/export', '_blank');
    };
    return (_jsxs("div", { className: "flex min-h-[calc(100vh-4rem)]", children: [_jsxs("aside", { className: "w-60 border-r border-line bg-surface flex flex-col justify-between p-4 flex-shrink-0", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3 px-2", children: [_jsx(Logo, { size: "sm" }), _jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-mute", children: "Admin" })] }), _jsx("nav", { className: "space-y-1", children: [
                                    { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
                                    { key: 'products', label: 'Produits', icon: Package },
                                    { key: 'orders', label: 'Commandes', icon: ShoppingBag },
                                    { key: 'clients', label: 'Clients', icon: Users },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isActive = section === item.key;
                                    return (_jsxs("button", { onClick: () => setSection(item.key), className: `w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-input transition-colors ${isActive
                                            ? 'bg-teal text-white shadow-low'
                                            : 'text-mute hover:text-ink hover:bg-line/40'}`, children: [_jsx(Icon, { size: 16 }), item.label] }, item.key));
                                }) })] }), _jsxs(Link, { to: "/", className: "flex items-center gap-2 text-xs text-mute hover:text-ink px-3 py-2 rounded-input hover:bg-line/40 transition-colors", children: [_jsx(ArrowLeft, { size: 16 }), "Retour \u00E0 la boutique"] })] }), _jsxs("main", { className: "flex-1 p-8 overflow-y-auto bg-bg", children: [section === 'dashboard' && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: "Statistiques g\u00E9n\u00E9rales" }), _jsx("p", { className: "text-xs text-mute", children: "Activit\u00E9 et performances de LampeOnline" })] }), _jsx("div", { className: "flex items-center gap-1 bg-surface p-1 rounded-input border border-line", children: ['7', '30', '90'].map((days) => (_jsxs("button", { onClick: () => setRangeDays(days), className: `px-3 py-1 text-xs font-semibold rounded ${rangeDays === days ? 'bg-teal text-white' : 'text-mute hover:text-ink'}`, children: [days, " jours"] }, days))) })] }), statsLoading || !stats ? (_jsx(SkeletonList, { count: 4 })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KpiCard, { title: "Chiffre d\u2019affaires", value: formatPrice(stats.kpis.revenue), prevValue: formatPrice(stats.kpis.prevRevenue), change: pctChange(stats.kpis.revenue, stats.kpis.prevRevenue) }), _jsx(KpiCard, { title: "Commandes", value: String(stats.kpis.orders), prevValue: String(stats.kpis.prevOrders), change: pctChange(stats.kpis.orders, stats.kpis.prevOrders) }), _jsx(KpiCard, { title: "Visites uniques", value: String(stats.kpis.uniqueVisitors), prevValue: String(stats.kpis.prevUniqueVisitors), change: pctChange(stats.kpis.uniqueVisitors, stats.kpis.prevUniqueVisitors) }), _jsx(KpiCard, { title: "Taux de conversion", value: `${stats.kpis.conversionRate}%`, prevValue: "Panier \u2192 Vente", highlight: true })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Fr\u00E9quentation quotidienne" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: stats.dailyVisits, children: [_jsx(XAxis, { dataKey: "date", stroke: "var(--mute)", fontSize: 10 }), _jsx(YAxis, { stroke: "var(--mute)", fontSize: 10 }), _jsx(Tooltip, { contentStyle: {
                                                                            backgroundColor: 'var(--surface)',
                                                                            borderColor: 'var(--line)',
                                                                            borderRadius: '8px',
                                                                            fontSize: '11px',
                                                                        } }), _jsx(Bar, { dataKey: "count", fill: "var(--teal)", radius: [4, 4, 0, 0] })] }) }) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Tunnel de conversion" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: stats.funnel, layout: "vertical", children: [_jsx(XAxis, { type: "number", stroke: "var(--mute)", fontSize: 10 }), _jsx(YAxis, { dataKey: "event", type: "category", stroke: "var(--mute)", fontSize: 10 }), _jsx(Tooltip, { contentStyle: {
                                                                            backgroundColor: 'var(--surface)',
                                                                            borderColor: 'var(--line)',
                                                                            borderRadius: '8px',
                                                                            fontSize: '11px',
                                                                        } }), _jsx(Bar, { dataKey: "count", fill: "var(--bulb)", radius: [0, 4, 4, 0] })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2", children: [_jsx(AlertTriangle, { size: 16, className: "text-danger" }), "Alertes stock faible (\u2264 5)"] }), stats.lowStock.length === 0 ? (_jsx("p", { className: "text-xs text-mute", children: "Tous les stocks sont suffisants." })) : (_jsx("ul", { className: "divide-y divide-line", children: stats.lowStock.map((prod) => (_jsxs("li", { className: "py-2.5 flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-medium text-ink truncate", children: prod.name }), _jsx(Badge, { variant: prod.stock === 0 ? 'danger' : 'bulb', children: prod.stock === 0 ? 'Rupture' : `${prod.stock} restant(s)` })] }, prod.id))) }))] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-xs font-heading font-bold text-ink uppercase tracking-wider mb-4", children: "Derni\u00E8res commandes" }), stats.latestOrders.length === 0 ? (_jsx("p", { className: "text-xs text-mute", children: "Aucune commande r\u00E9cente." })) : (_jsx("ul", { className: "divide-y divide-line", children: stats.latestOrders.map((o) => (_jsxs("li", { className: "py-2.5 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-ink", children: o.user?.name ?? 'Client' }), _jsx("p", { className: "text-[10px] text-mute", children: formatDate(o.createdAt) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-bold text-teal", children: formatPrice(o.totalMillimes) }), _jsx(Badge, { children: o.status })] })] }, o.id))) }))] })] })] }))] })), section === 'products' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: "Gestion des luminaires" }), _jsx("p", { className: "text-xs text-mute", children: "Ajoutez, modifiez ou archivez vos produits" })] }), _jsxs(Button, { variant: "primary", size: "sm", onClick: () => {
                                            setEditingProduct(null);
                                            setProductDrawerOpen(true);
                                        }, className: "gap-2", children: [_jsx(Plus, { size: 16 }), " Nouveau luminaire"] })] }), _jsx(Card, { className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4", children: "Produit" }), _jsx("th", { className: "p-4", children: "Cat\u00E9gorie" }), _jsx("th", { className: "p-4", children: "Prix" }), _jsx("th", { className: "p-4", children: "Stock" }), _jsx("th", { className: "p-4", children: "Statut" }), _jsx("th", { className: "p-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-line", children: productsLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-8 text-center text-mute", children: "Chargement des produits..." }) })) : (productsData?.data.map((prod) => (_jsxs("tr", { className: "hover:bg-line/20 transition-colors", children: [_jsxs("td", { className: "p-4 flex items-center gap-3", children: [_jsx("img", { src: prod.images[0] ?? '', alt: "", className: "w-10 h-10 object-cover rounded-input bg-line flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-ink", children: prod.name }), _jsx("p", { className: "text-[11px] text-mute font-mono", children: prod.slug })] })] }), _jsx("td", { className: "p-4 text-mute", children: prod.category?.name ?? '—' }), _jsx("td", { className: "p-4 font-bold text-teal", children: formatPrice(prod.priceMillimes) }), _jsx("td", { className: "p-4", children: _jsx("span", { className: prod.stock <= 5 ? 'text-danger font-bold' : 'text-ink', children: prod.stock }) }), _jsx("td", { className: "p-4", children: _jsx(Badge, { variant: prod.isActive ? 'ok' : 'mute', children: prod.isActive ? 'Actif' : 'Archivé' }) }), _jsxs("td", { className: "p-4 text-right space-x-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                        setEditingProduct(prod);
                                                                        setProductDrawerOpen(true);
                                                                    }, "aria-label": "Modifier", children: _jsx(Edit2, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-danger hover:bg-danger/10", onClick: () => {
                                                                        if (confirm(`Archiver le luminaire "${prod.name}" ?`)) {
                                                                            deleteProductMutation.mutate(prod.id);
                                                                        }
                                                                    }, "aria-label": "Archiver", children: _jsx(Trash2, { size: 14 }) })] })] }, prod.id)))) })] }) }) }), _jsx(Drawer, { open: productDrawerOpen, onClose: () => setProductDrawerOpen(false), title: editingProduct ? 'Modifier le luminaire' : 'Ajouter un luminaire', className: "max-w-lg", children: _jsx(ProductFormDrawer, { initialData: editingProduct, categories: categories ?? [], onSuccess: () => {
                                        setProductDrawerOpen(false);
                                        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
                                    } }) })] })), section === 'orders' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: "Gestion des commandes" }), _jsx("p", { className: "text-xs text-mute", children: "Modifiez les statuts et exportez les rapports" })] }), _jsxs(Button, { variant: "secondary", size: "sm", onClick: handleExportCsv, className: "gap-2", children: [_jsx(Download, { size: 16 }), " Exporter CSV"] })] }), _jsx(Card, { className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4", children: "R\u00E9f." }), _jsx("th", { className: "p-4", children: "Client" }), _jsx("th", { className: "p-4", children: "Date" }), _jsx("th", { className: "p-4", children: "Montant" }), _jsx("th", { className: "p-4", children: "Statut" }), _jsx("th", { className: "p-4 text-right", children: "Changer statut" })] }) }), _jsx("tbody", { className: "divide-y divide-line", children: ordersLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-8 text-center text-mute", children: "Chargement des commandes..." }) })) : (ordersData?.data.map((o) => (_jsxs("tr", { className: "hover:bg-line/20 transition-colors", children: [_jsx("td", { className: "p-4 font-mono font-semibold text-ink", children: o.id }), _jsxs("td", { className: "p-4", children: [_jsx("p", { className: "font-medium text-ink", children: o.shippingAddress?.fullName }), _jsx("p", { className: "text-[11px] text-mute", children: o.shippingAddress?.city })] }), _jsx("td", { className: "p-4 text-mute", children: formatDate(o.createdAt) }), _jsx("td", { className: "p-4 font-bold text-teal", children: formatPrice(o.totalMillimes) }), _jsx("td", { className: "p-4", children: _jsx(Badge, { variant: o.status === 'CANCELLED' ? 'danger' : 'ok', children: o.status }) }), _jsx("td", { className: "p-4 text-right", children: _jsxs("select", { value: o.status, onChange: (e) => updateOrderStatusMutation.mutate({
                                                                    orderId: o.id,
                                                                    status: e.target.value,
                                                                }), className: "px-2 py-1 text-xs bg-surface border border-line rounded-input text-ink", children: [_jsx("option", { value: "PENDING", children: "PENDING" }), _jsx("option", { value: "PAID", children: "PAID" }), _jsx("option", { value: "SHIPPED", children: "SHIPPED" }), _jsx("option", { value: "DELIVERED", children: "DELIVERED" }), _jsx("option", { value: "CANCELLED", children: "CANCELLED" })] }) })] }, o.id)))) })] }) }) })] })), section === 'clients' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: "Gestion des clients" }), _jsx("p", { className: "text-xs text-mute", children: "Consultez vos clients et g\u00E9rez les autorisations d'acc\u00E8s" })] }), _jsx(Card, { className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-surface/50 border-b border-line text-mute uppercase tracking-wider text-[10px]", children: _jsxs("tr", { children: [_jsx("th", { className: "p-4", children: "Nom" }), _jsx("th", { className: "p-4", children: "Email" }), _jsx("th", { className: "p-4", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-4", children: "Commandes" }), _jsx("th", { className: "p-4", children: "Statut" }), _jsx("th", { className: "p-4 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-line", children: clientsLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "p-8 text-center text-mute", children: "Chargement des clients..." }) })) : (clientsData?.data.map((c) => (_jsxs("tr", { className: "hover:bg-line/20 transition-colors", children: [_jsx("td", { className: "p-4 font-semibold text-ink", children: c.name }), _jsx("td", { className: "p-4 text-mute", children: c.email }), _jsx("td", { className: "p-4 text-mute", children: c.phone ?? '—' }), _jsx("td", { className: "p-4 font-semibold text-teal", children: c.orderCount }), _jsx("td", { className: "p-4", children: _jsx(Badge, { variant: c.status === 'BLOCKED' ? 'danger' : 'ok', children: c.status }) }), _jsx("td", { className: "p-4 text-right", children: _jsxs(Button, { variant: "ghost", size: "sm", className: c.status === 'BLOCKED'
                                                                    ? 'text-ok hover:bg-ok/10'
                                                                    : 'text-danger hover:bg-danger/10', onClick: () => {
                                                                    const nextStatus = c.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
                                                                    if (confirm(`Voulez-vous vraiment changer le statut de ${c.name} à ${nextStatus} ?`)) {
                                                                        updateClientStatusMutation.mutate({
                                                                            clientId: c.id,
                                                                            status: nextStatus,
                                                                        });
                                                                    }
                                                                }, children: [c.status === 'BLOCKED' ? (_jsx(Unlock, { size: 14, className: "mr-1" })) : (_jsx(Lock, { size: 14, className: "mr-1" })), c.status === 'BLOCKED' ? 'Débloquer' : 'Bloquer'] }) })] }, c.id)))) })] }) }) })] }))] })] }));
}
function KpiCard({ title, value, prevValue, change, highlight = false, }) {
    return (_jsxs(Card, { className: `p-5 ${highlight ? 'border-teal' : ''}`, children: [_jsx("p", { className: "text-[11px] font-semibold text-mute uppercase tracking-wider", children: title }), _jsxs("div", { className: "flex items-baseline justify-between mt-2", children: [_jsx("h3", { className: "text-xl font-heading font-bold text-ink", children: value }), change !== undefined && (_jsxs("span", { className: `flex items-center text-xs font-semibold ${change >= 0 ? 'text-ok' : 'text-danger'}`, children: [change >= 0 ? _jsx(ArrowUpRight, { size: 14 }) : _jsx(ArrowDownRight, { size: 14 }), Math.abs(change), "%"] }))] }), prevValue && _jsxs("p", { className: "text-[10px] text-mute mt-1", children: ["Pr\u00E9c\u00E9dent : ", prevValue] })] }));
}
function ProductFormDrawer({ initialData, categories, onSuccess, }) {
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(CreateProductSchema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                slug: initialData.slug,
                description: initialData.description,
                priceMillimes: initialData.priceMillimes,
                stock: initialData.stock,
                categoryId: initialData.categoryId,
                images: initialData.images,
                model3d: initialData.model3d,
                isActive: initialData.isActive,
            }
            : {
                name: '',
                slug: '',
                description: '',
                priceMillimes: 120000,
                stock: 10,
                categoryId: categories[0]?.id ?? '',
                images: ['https://picsum.photos/seed/lamp/800/600'],
                model3d: {
                    shade: 'cone',
                    shadeColor: '#ffffff',
                    stemColor: '#888888',
                    baseColor: '#444444',
                    colorTemp: 3000,
                },
                isActive: true,
            },
    });
    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (initialData) {
                await api.patch(`/products/${initialData.id}`, data);
                toast('Luminaire modifié avec succès', 'success');
            }
            else {
                await api.post('/products', data);
                toast('Luminaire créé avec succès', 'success');
            }
            onSuccess();
        }
        catch (err) {
            if (err instanceof ApiError)
                toast(err.message, 'error');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "p-6 space-y-4", children: [_jsx(Input, { label: "Nom du produit", error: errors.name?.message, ...register('name') }), _jsx(Input, { label: "Slug (identifiant URL)", placeholder: "mon-luminaire", error: errors.slug?.message, ...register('slug') }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-ink block mb-1", children: "Cat\u00E9gorie" }), _jsx("select", { className: "w-full px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink", ...register('categoryId'), children: categories.map((c) => (_jsx("option", { value: c.id, children: c.name }, c.id))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Prix (en millimes)", type: "number", hint: "Ex: 150000 = 150 TND", error: errors.priceMillimes?.message, ...register('priceMillimes', { valueAsNumber: true }) }), _jsx(Input, { label: "Stock disponible", type: "number", error: errors.stock?.message, ...register('stock', { valueAsNumber: true }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-medium text-ink block mb-1", children: "Description" }), _jsx("textarea", { rows: 4, className: "w-full px-3 py-2 text-xs bg-surface border border-line rounded-input text-ink placeholder:text-mute", ...register('description') }), errors.description && (_jsx("p", { className: "text-xs text-danger mt-1", children: errors.description.message }))] }), _jsx(Button, { type: "submit", variant: "primary", size: "md", className: "w-full", isLoading: submitting, children: initialData ? 'Mettre à jour' : 'Créer le luminaire' })] }));
}
//# sourceMappingURL=AdminPage.js.map