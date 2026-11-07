import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

interface NavbarProps {
  onCartOpen: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export function Navbar({ onCartOpen, isDark, onThemeToggle }: NavbarProps) {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/products', label: 'Catalogue' },
    { href: '/products?categoryId=suspension', label: 'Suspensions' },
    { href: '/products?categoryId=lampadaire', label: 'Lampadaires' },
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
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink"
            aria-label={`Cart, ${totalItems} items`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-bulb text-ink text-[10px] font-bold flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="secondary" size="sm">Admin</Button>
                </Link>
              )}
              <Link to="/account">
                <button className="p-2 rounded hover:bg-line transition-colors text-mute hover:text-ink" aria-label="Account">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </button>
              </Link>
            </div>
          ) : (
            <Link to="/auth/login">
              <Button variant="primary" size="sm">Sign in</Button>
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
          <nav className="flex flex-col p-4 gap-3" aria-label="Mobile navigation">
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
          </nav>
        </div>
      )}
    </header>
  )
}
