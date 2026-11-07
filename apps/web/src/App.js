import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { api } from '@/lib/api';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import AccountPage from '@/pages/AccountPage';
import AdminPage from '@/pages/AdminPage';
export default function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const location = useLocation();
    // Dark showroom mode toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);
    // Track page view silently on route change
    useEffect(() => {
        api
            .post('/analytics/visit', {
            path: location.pathname + location.search,
            referrer: document.referrer || undefined,
        })
            .catch(() => {
            // Analytics non-blocking
        });
    }, [location.pathname, location.search]);
    const isAdminRoute = location.pathname.startsWith('/admin');
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-bg text-ink transition-colors duration-200", children: [!isAdminRoute && (_jsx(Navbar, { onCartOpen: () => setCartOpen(true), isDark: isDark, onThemeToggle: () => setIsDark(!isDark) })), _jsx("main", { className: "flex-1", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/products", element: _jsx(CatalogPage, {}) }), _jsx(Route, { path: "/products/:slug", element: _jsx(ProductPage, {}) }), _jsx(Route, { path: "/auth/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/auth/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/checkout", element: _jsx(CheckoutPage, {}) }), _jsx(Route, { path: "/orders/:id", element: _jsx(OrderConfirmationPage, {}) }), _jsx(Route, { path: "/account", element: _jsx(AccountPage, {}) }), _jsx(Route, { path: "/account/*", element: _jsx(AccountPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "/admin/*", element: _jsx(AdminPage, {}) })] }) }), !isAdminRoute && _jsx(Footer, {}), _jsx(CartDrawer, { open: cartOpen, onClose: () => setCartOpen(false) })] }));
}
//# sourceMappingURL=App.js.map