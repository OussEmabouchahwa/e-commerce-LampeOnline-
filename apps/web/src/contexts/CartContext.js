import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const CartContext = createContext(null);
const STORAGE_KEY = 'lampe_guest_cart';
function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
export function CartProvider({ children }) {
    const [items, setItems] = useState(loadCart);
    useEffect(() => { saveCart(items); }, [items]);
    function addItem(item) {
        setItems((prev) => {
            const existing = prev.find((i) => i.productId === item.productId);
            if (existing) {
                return prev.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i);
            }
            return [...prev, item];
        });
    }
    function removeItem(productId) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    }
    function updateQty(productId, qty) {
        if (qty <= 0) {
            removeItem(productId);
            return;
        }
        setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i));
    }
    function clearCart() { setItems([]); }
    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    const totalMillimes = items.reduce((s, i) => s + i.priceMillimes * i.qty, 0);
    return (_jsx(CartContext.Provider, { value: { items, addItem, removeItem, updateQty, clearCart, totalItems, totalMillimes }, children: children }));
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
//# sourceMappingURL=CartContext.js.map