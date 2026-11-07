import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Package, Box, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProductViewer3D } from '@/components/3d/ProductViewer3D';
import { api } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
export default function ProductPage() {
    const { slug } = useParams();
    const { addItem } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedImg, setSelectedImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [viewMode, setViewMode] = useState('photo');
    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => api.get(`/products/${slug}`),
        enabled: !!slug,
    });
    // Check if product is in wishlist
    const { data: wishlistData } = useQuery({
        queryKey: ['my-wishlist'],
        queryFn: () => api.get('/wishlist'),
        enabled: !!user,
    });
    const isWishlisted = !!wishlistData?.some((item) => item.productId === product?.id);
    const handleToggleWishlist = async () => {
        if (!user) {
            toast('Connectez-vous pour ajouter ce produit à vos coups de cœur', 'info');
            return;
        }
        if (!product)
            return;
        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${product.id}`);
                toast('Retiré de vos coups de cœur', 'info');
            }
            else {
                await api.post('/wishlist', { productId: product.id });
                toast('Ajouté à vos coups de cœur !', 'success');
            }
            queryClient.invalidateQueries({ queryKey: ['my-wishlist'] });
        }
        catch {
            toast('Une erreur est survenue', 'error');
        }
    };
    if (isLoading)
        return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-12", children: [_jsx(Skeleton, { className: "aspect-square rounded-card" }), _jsxs("div", { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-6 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/4" }), _jsx(Skeleton, { className: "h-24 w-full" }), _jsx(Skeleton, { className: "h-12 w-full" })] })] }));
    if (isError || !product)
        return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-20 text-center", children: [_jsx("p", { className: "text-sm text-danger mb-4", children: "Product not found" }), _jsx(Button, { variant: "secondary", size: "md", onClick: () => navigate('/products'), children: "Back to catalogue" })] }));
    const images = product.images.length > 0 ? product.images : ['https://picsum.photos/seed/lamp/800/600'];
    const image = images[selectedImg] ?? images[0] ?? '';
    function handleAddToCart() {
        addItem({ productId: product.id, qty, name: product.name, priceMillimes: product.priceMillimes, image, slug: product.slug });
        toast(`Added "${product.name}" to cart`, 'success');
    }
    return (_jsxs("div", { className: "max-w-content mx-auto px-4 sm:px-6 py-8", children: [_jsxs("nav", { className: "flex items-center gap-2 text-xs text-mute mb-8", "aria-label": "Breadcrumb", children: [_jsx(Link, { to: "/", className: "hover:text-ink transition-colors", children: "Home" }), _jsx("span", { children: "/" }), _jsx(Link, { to: "/products", className: "hover:text-ink transition-colors", children: "Catalogue" }), product.category && (_jsxs(_Fragment, { children: [_jsx("span", { children: "/" }), _jsx(Link, { to: `/products?categoryId=${product.category.slug}`, className: "hover:text-ink transition-colors", children: product.category.name })] })), _jsx("span", { children: "/" }), _jsx("span", { className: "text-ink", children: product.name })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-end gap-1 mb-2", children: [_jsxs("button", { onClick: () => setViewMode('photo'), className: cn('px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors', viewMode === 'photo'
                                            ? 'bg-teal text-white'
                                            : 'bg-surface text-mute hover:text-ink border border-line'), children: [_jsx(ImageIcon, { size: 13 }), " Photo"] }), _jsxs("button", { onClick: () => setViewMode('3d'), className: cn('px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors', viewMode === '3d'
                                            ? 'bg-teal text-white'
                                            : 'bg-surface text-mute hover:text-ink border border-line'), children: [_jsx(Box, { size: 13 }), " Vue 3D"] })] }), viewMode === '3d' && product.model3d ? (_jsx(ProductViewer3D, { model: product.model3d })) : (_jsxs(_Fragment, { children: [_jsx(motion.div, { layoutId: `product-image-${product.id}`, className: "aspect-square rounded-card overflow-hidden bg-bg mb-4 border border-line", children: _jsx("img", { src: image, alt: product.name, className: "w-full h-full object-cover", width: 600, height: 600 }) }), images.length > 1 && (_jsx("div", { className: "flex gap-2 overflow-x-auto pb-2", children: images.map((img, i) => (_jsx("button", { onClick: () => setSelectedImg(i), className: cn('flex-shrink-0 h-16 w-16 rounded-input overflow-hidden border-2 transition-colors', i === selectedImg ? 'border-teal' : 'border-line hover:border-mute'), children: _jsx("img", { src: img, alt: `View ${i + 1}`, className: "w-full h-full object-cover" }) }, i))) }))] }))] }), _jsxs("div", { className: "flex flex-col gap-6", children: [product.category && (_jsx(Badge, { variant: "mute", children: product.category.name })), _jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: product.name }), _jsx("div", { className: "text-2xl font-bold text-teal", children: formatPrice(product.priceMillimes) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Package, { size: 16, className: product.stock > 0 ? 'text-ok' : 'text-danger' }), _jsx("span", { className: cn('text-xs', product.stock > 0 ? 'text-ok' : 'text-danger'), children: product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} remaining` : 'In stock' })] }), _jsx("p", { className: "text-xs text-mute leading-relaxed", children: product.description }), product.stock > 0 && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center border border-line rounded-input overflow-hidden", children: [_jsx("button", { onClick: () => setQty(Math.max(1, qty - 1)), className: "px-3 py-2 text-mute hover:text-ink hover:bg-line transition-colors", "aria-label": "Decrease quantity", children: "\u2212" }), _jsx("span", { className: "px-4 py-2 text-xs font-medium text-ink border-x border-line", children: qty }), _jsx("button", { onClick: () => setQty(Math.min(product.stock, qty + 1)), className: "px-3 py-2 text-mute hover:text-ink hover:bg-line transition-colors", "aria-label": "Increase quantity", children: "+" })] }), _jsxs(Button, { variant: "primary", size: "lg", onClick: handleAddToCart, className: "flex-1 gap-2", children: [_jsx(ShoppingCart, { size: 16 }), " Add to cart"] }), _jsx("button", { onClick: handleToggleWishlist, className: "p-3 border border-line rounded-input hover:border-bulb transition-colors", "aria-label": isWishlisted ? 'Retirer de vos coups de cœur' : 'Ajouter à vos coups de cœur', title: isWishlisted ? 'Retirer de vos coups de cœur' : 'Ajouter à vos coups de cœur', children: _jsx(Heart, { size: 18, className: cn(isWishlisted ? 'fill-bulb text-bulb' : 'text-mute') }) })] }))] })] })] }));
}
//# sourceMappingURL=ProductPage.js.map