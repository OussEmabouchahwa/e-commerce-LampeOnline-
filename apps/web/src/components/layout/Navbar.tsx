import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, X, Sun, Moon, Package } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface NavbarProps {
  onCartOpen: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export function Navbar({ onCartOpen, isDark, onThemeToggle }: NavbarProps) {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Query wishlist count for logged in client
  const { data: wishlistData } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: () => api.get<Array<{ productId: string }>>('/wishlist'),
    enabled: !!user,
  })
  const wishlistCount = wishlistData?.length ?? 0

  const navLinks = [
    { href: '/products', label: 'Catalogue' },
    { href: '/products?categoryId=suspension', label: 'Suspensions' },
    { href: '/products?categoryId=lampadaire', label: 'Lampadaires' },
    { href: '/products?categoryId=table', label: 'Lampes de table' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" aria-label="Go to homepage" className="flex-shrink-0">
          <Logo size="md" className="hidden sm:block" />
          <Logo size="sm" className="sm:hidden" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-xs font-medium text-mute hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink"
            aria-label={isDark ? 'Passer au mode clair' : 'Passer au showroom sombre'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wishlist Heart with count */}
          <Link
            to={user ? '/account?tab=wishlist' : '/auth/login'}
            className="relative p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink"
            aria-label={`Coups de cœur, ${wishlistCount} produit(s)`}
            title="Mes coups de cœur"
          >
            <Heart size={20} className={wishlistCount > 0 ? 'text-bulb fill-bulb' : ''} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-bulb text-ink text-[10px] font-bold flex items-center justify-center shadow-low">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink"
            aria-label={`Panier, ${totalItems} article(s)`}
            title="Mon panier"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-teal text-white text-[10px] font-bold flex items-center justify-center shadow-low">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth / Account */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="secondary" size="sm">Admin</Button>
                </Link>
              )}
              <Link
                to="/account"
                className="flex items-center gap-2 p-1.5 rounded-input hover:bg-line transition-colors"
                title="Mon compte client"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-line" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-teal/10 text-teal flex items-center justify-center">
                    <User size={16} />
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-ink max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/auth/login">
              <Button variant="primary" size="sm">Connexion</Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded hover:bg-line transition-colors text-mute"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-surface">
          <nav className="flex flex-col p-4 gap-2" aria-label="Mobile navigation">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="text-xs font-medium text-ink py-2 border-b border-line last:border-0"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/account?tab=orders"
                  className="text-xs font-medium text-ink py-2 border-b border-line flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Package size={16} className="text-teal" /> Mes commandes
                </Link>
                <Link
                  to="/account?tab=wishlist"
                  className="text-xs font-medium text-ink py-2 border-b border-line flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart size={16} className="text-bulb" /> Mes coups de cœur ({wishlistCount})
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
