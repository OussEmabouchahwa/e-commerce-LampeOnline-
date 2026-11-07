import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { api } from '@/lib/api'

import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import ProductPage from '@/pages/ProductPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import AccountPage from '@/pages/AccountPage'
import AdminPage from '@/pages/AdminPage'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const location = useLocation()

  // Dark showroom mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Track page view silently on route change
  useEffect(() => {
    api
      .post('/analytics/visit', {
        path: location.pathname + location.search,
        referrer: document.referrer || undefined,
      })
      .catch(() => {
        // Analytics non-blocking
      })
  }, [location.pathname, location.search])

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink transition-colors duration-200">
      {!isAdminRoute && (
        <Navbar
          onCartOpen={() => setCartOpen(true)}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/*" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
