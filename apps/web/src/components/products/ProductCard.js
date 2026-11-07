import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '../ui/Toast';
export function ProductCard({ product, wishlisted = false, onWishlistToggle }) {
    const { addItem } = useCart();
    const { toast } = useToast();
    const [heartAnimating, setHeartAnimating] = useState(false);
    const image = product.images[0] ?? 'https://picsum.photos/seed/lamp/400/300';
    // Tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), { stiffness: 200, damping: 20 });
    function handleMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }
    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }
    function handleAddToCart(e) {
        e.preventDefault();
        addItem({ productId: product.id, qty: 1, name: product.name, priceMillimes: product.priceMillimes, image, slug: product.slug });
        toast(`Added "${product.name}" to cart`, 'success');
    }
    function handleWishlist(e) {
        e.preventDefault();
        setHeartAnimating(true);
        setTimeout(() => setHeartAnimating(false), 300);
        onWishlistToggle?.(product.id);
    }
    return (_jsx(motion.div, { style: { rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, whileHover: { scale: 1.02 }, transition: { duration: 0.2 }, className: "group", children: _jsx(Link, { to: `/products/${product.slug}`, className: "block", children: _jsxs("div", { className: "bg-surface border border-line rounded-card overflow-hidden shadow-low hover:shadow-mid transition-shadow duration-200", children: [_jsxs("div", { className: "relative aspect-[4/3] overflow-hidden bg-bg", children: [_jsx(motion.img, { layoutId: `product-image-${product.id}`, src: image, alt: product.name, className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105", loading: "lazy", width: 400, height: 300 }), product.stock === 0 && (_jsx("div", { className: "absolute inset-0 bg-bg/70 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium text-mute bg-surface/80 px-3 py-1 rounded-pill", children: "Out of stock" }) })), product.stock > 0 && product.stock <= 5 && (_jsx("div", { className: "absolute top-2 left-2", children: _jsxs("span", { className: "text-xs font-medium text-bulb bg-bg/90 px-2 py-0.5 rounded-pill", children: ["Only ", product.stock, " left"] }) })), _jsx("button", { onClick: handleWishlist, className: "absolute top-2 right-2 p-2 rounded-full bg-surface/80 backdrop-blur-sm hover:bg-surface transition-colors", "aria-label": wishlisted ? 'Remove from wishlist' : 'Add to wishlist', children: _jsx(motion.div, { animate: heartAnimating ? { scale: [1, 1.4, 1] } : {}, transition: { duration: 0.25 }, children: _jsx(Heart, { size: 16, className: cn(wishlisted ? 'fill-bulb text-bulb' : 'text-mute') }) }) })] }), _jsxs("div", { className: "p-4", children: [product.category && (_jsx("p", { className: "text-xs text-mute mb-1", children: product.category.name })), _jsx("h3", { className: "text-xs font-heading font-bold text-ink line-clamp-2 mb-2", children: product.name }), _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm font-bold text-teal", children: formatPrice(product.priceMillimes) }), _jsx("button", { onClick: handleAddToCart, disabled: product.stock === 0, className: cn('p-2 rounded-input bg-teal text-white hover:opacity-90 transition-opacity', 'disabled:opacity-30 disabled:cursor-not-allowed'), "aria-label": `Add ${product.name} to cart`, children: _jsx(ShoppingCart, { size: 16 }) })] })] })] }) }) }));
}
//# sourceMappingURL=ProductCard.js.map